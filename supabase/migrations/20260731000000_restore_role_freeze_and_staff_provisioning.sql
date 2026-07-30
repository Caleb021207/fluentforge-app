-- WORKSTREAM 0.4 — Role-system repair (plan 15 §1.2, Phase-0 backlog R1; 19 #6).
--
-- 1. Restores the FULL strict protect_profile_privileged_columns trigger from
--    20260729061713: profiles.role is frozen for ALL non-admin client writes.
--    This reverts 20260730010000_allow_student_teacher_role_selection, whose
--    "the display role is harmless" rationale is the enabler of the
--    self-promoted-teacher exploit (plan 15 G1/§7.2): flip role -> create
--    class -> add_by_email any student -> read that minor's email/transcripts.
-- 2. Creates staff_access_codes: admin-provisioned educator access codes
--    (plan 15 §1.2 verified-onboarding path 1, "school code / staff join
--    code"). Only the sha256 hash of a code is ever stored; codes are
--    verified exclusively inside provision_teacher — no client read path.
-- 3. Creates provision_teacher(p_code): the ONLY path by which an
--    authenticated user becomes a teacher (until the admin-invite and
--    domain-verification paths ship, plan 15 §1.2 paths 2-3).
--
-- PREPARED, NOT APPLIED — staging validation required (LEDGER 0.4).

-- =========================================================
-- 1. RESTORE STRICT PRIVILEGE-ESCALATION GUARD ON profiles
--    (verbatim copy of 20260729061713 §3 — do not paraphrase; plan 15 §1.2
--    "Re-freeze `role` fully", backlog R1 acceptance: "role un-settable by
--    non-admin")
-- =========================================================
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  is_privileged boolean := (auth.uid() IS NULL) OR public.has_role(auth.uid(), 'admin');
BEGIN
  IF is_privileged THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := COALESCE(NULLIF(NEW.role, ''), 'student');
    IF NEW.role <> 'student' THEN NEW.role := 'student'; END IF;
    NEW.account_tier := COALESCE(NEW.account_tier, 'standard');
    NEW.is_minor := false;
    NEW.parental_consent_granted := false;
    NEW.safety_mode := 'standard';
    RETURN NEW;
  END IF;

  NEW.role := OLD.role;
  NEW.account_tier := OLD.account_tier;
  NEW.school_id := OLD.school_id;
  NEW.grade_level_id := OLD.grade_level_id;
  NEW.is_minor := OLD.is_minor;
  NEW.parental_consent_granted := OLD.parental_consent_granted;
  NEW.parental_consent_at := OLD.parental_consent_at;
  NEW.age_verified_at := OLD.age_verified_at;
  NEW.safety_mode := OLD.safety_mode;
  NEW.birth_year := OLD.birth_year;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER protect_profile_privileged_columns
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- =========================================================
-- 2. STAFF ACCESS CODES (plan 15 §1.2 path 1)
-- =========================================================
-- Only the sha256 hex digest of a code is stored. Whoever mints a code must
-- hash the NORMALIZED form (uppercased, all whitespace stripped) — the same
-- normalization provision_teacher applies before comparison:
--   encode(digest(upper(regexp_replace(code, '\s', '', 'g')), 'sha256'), 'hex')
CREATE TABLE IF NOT EXISTS public.staff_access_codes (
  code_hash text PRIMARY KEY,
  school_name text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  revoked boolean NOT NULL DEFAULT false
);

ALTER TABLE public.staff_access_codes ENABLE ROW LEVEL SECURITY;

-- Admin-only ALL. Deliberately NO anon/authenticated read policy: codes are
-- verified only inside the provision_teacher RPC (definer), so non-admin
-- clients can never enumerate even the hashes (no code-validity oracle —
-- plan 15 §2.3 lesson from verify-certification-code).
DROP POLICY IF EXISTS "Admins manage staff access codes" ON public.staff_access_codes;
CREATE POLICY "Admins manage staff access codes" ON public.staff_access_codes
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Table privileges: authenticated keeps privileges so the admin policy above
-- is usable through the API; RLS yields zero rows for everyone else.
REVOKE ALL ON public.staff_access_codes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_access_codes TO authenticated;
GRANT ALL ON public.staff_access_codes TO service_role;

-- =========================================================
-- 3. provision_teacher(p_code) — the one sanctioned promotion path
-- =========================================================
-- [requires validation] Supabase installs pgcrypto in the `extensions`
-- schema by default; confirm on staging and adjust the digest()
-- qualification if this project differs.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- SECURITY DEFINER + search_path='' per the hardened definer-helper idiom
-- (20260729061713 §1, plan 15 §2.1).
--
-- WHY THE JWT-GUC DANCE BELOW IS NEEDED (documenting the trigger bypass):
-- SECURITY DEFINER alone does NOT bypass protect_profile_privileged_columns.
-- The trigger's guard keys on auth.uid(), which reads the request-scoped JWT
-- claim GUCs — it is unaffected by the definer's role. Inside this function
-- auth.uid() is still the caller, so a plain UPDATE would be silently
-- reverted (NEW.role := OLD.role). We therefore deliberately enter the
-- trigger's existing service-context escape hatch (auth.uid() IS NULL) for
-- exactly one statement, by clearing the JWT claim GUCs transaction-locally
-- and restoring them immediately after. This is the plan-sanctioned
-- server-side role write (plan 15 §1.2: redeeming a staff code "sets
-- role=teacher ... server-side, via a SECURITY DEFINER function analogous to
-- the existing join_class_by_code"). Clients cannot replicate it: PostgREST
-- re-derives these GUCs from the signed JWT on every request, and non-RPC
-- statements cannot batch set_config into their transaction.
CREATE OR REPLACE FUNCTION public.provision_teacher(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_normalized text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_hash text;
  v_school_name text;
  v_claim_sub text;
  v_claims text;
  v_profile_rows integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not signed in');
  END IF;

  IF v_normalized = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Enter an educator access code');
  END IF;

  v_hash := encode(extensions.digest(v_normalized, 'sha256'), 'hex');

  -- Atomic validate-and-consume: the WHERE clause re-checks every condition
  -- under the row lock, so concurrent redemptions cannot exceed max_uses.
  -- One generic failure message on purpose — no unexpired/revoked/used-up
  -- distinction for callers to probe.
  UPDATE public.staff_access_codes
  SET current_uses = current_uses + 1
  WHERE code_hash = v_hash
    AND revoked = false
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  RETURNING school_name INTO v_school_name;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired educator access code');
  END IF;

  -- Enter the trigger's service-context escape hatch for one statement
  -- (see header comment). set_config(..., true) is transaction-local; we
  -- still restore eagerly so auth.uid() is correct for the rest of the
  -- function.
  v_claim_sub := current_setting('request.jwt.claim.sub', true);
  v_claims := current_setting('request.jwt.claims', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', '', true);

  UPDATE public.profiles SET role = 'teacher' WHERE id = v_user;
  -- Capture the row count BEFORE the restoring set_configs: PERFORM would
  -- overwrite FOUND/ROW_COUNT.
  GET DIAGNOSTICS v_profile_rows = ROW_COUNT;

  PERFORM set_config('request.jwt.claim.sub', coalesce(v_claim_sub, ''), true);
  PERFORM set_config('request.jwt.claims', coalesce(v_claims, ''), true);

  IF v_profile_rows = 0 THEN
    -- No profile row: raise so the whole transaction (including the
    -- current_uses increment above) rolls back rather than burning a use.
    RAISE EXCEPTION 'provision_teacher: no profile row for user %', v_user;
  END IF;

  -- Audit the promotion (plan 15 §4.3 direction; educational_data_access_audit
  -- is the audit table that exists today). Guarded with to_regclass so this
  -- function survives the table's planned replacement by data_access_audit.
  IF to_regclass('public.educational_data_access_audit') IS NOT NULL THEN
    INSERT INTO public.educational_data_access_audit
      (accessor_user_id, accessed_user_id, data_type, access_purpose)
    VALUES
      (v_user, v_user, 'role_provisioning',
       'provision_teacher: staff access code redeemed'
         || coalesce(' (' || v_school_name || ')', ''));
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Educator access verified');
END;
$$;

REVOKE ALL ON FUNCTION public.provision_teacher(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.provision_teacher(text) TO authenticated;

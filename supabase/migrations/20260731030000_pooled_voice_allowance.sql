-- WORKSTREAM 2.3 — Institution-level pooled voice allowance
-- (policy: docs/palavox-overhaul-plan/16-cost-and-capacity-model.md §7 "AI
-- allowances, pooling, and safeguards"; plan 17 P1/P2; wip-01a §10 schema drift).
--
-- WHAT THIS ADDS (additive only — no existing table/function is altered):
--   1. public.institution_voice_pools — one voice pool per (school, academic
--      period). Allowance is sized from the licensed seat count, NOT metered
--      per student (16 §3/§7: billing is per activated seat, usage-based
--      billing is explicitly rejected). Per 16 §7, per licensed seat/year:
--        • 1,000 pooled voice minutes total,
--        • of which 400 are a PROTECTED realtime sub-pool (a pooled floor, not
--          an individual entitlement),
--        • leaving ~600 for cascade + drill (non-realtime) routes.
--   2. public.current_pool_period() — academic-year period key with an
--      August boundary (fixes wip-01a F1.4: the legacy calendar-year key flips
--      on 1 January, mid school year; "student access runs August–May").
--   3. public.ensure_voice_pool(school, period) — (re)provision a pool row,
--      sizing allocation from the live activated-student roster. Allocation
--      only ever GROWS (grant-not-revoke; 16 §7 "additional pool blocks are
--      granted on admin request ... logged, never invoiced").
--   4. public.consume_voice_minutes(school, minutes, is_realtime) — the
--      SECURITY DEFINER consume RPC. Enforces the two rules of 16 §7:
--        • "drills degrade first": non-realtime traffic may draw only the
--          general allocation; when it is gone it degrades to a free
--          cached/deterministic route even though the protected realtime
--          reserve still has minutes.
--        • "realtime is the last thing to yield": realtime may draw the whole
--          pool and only degrades (to cascade, else text) at full exhaustion.
--      It NEVER creates an overage and NEVER bills — at exhaustion it returns a
--      degrade route ({allowed:false, degrade_to:'cascade'|'cached'|'text'})
--      instead (16 §7 "No overage billing").
--
-- The routing arithmetic is a 1:1 mirror of the pure reference module
-- supabase/functions/_shared/voicePool.ts (its vitest golden vectors are the
-- spec) and is behavior-tested on a real Postgres engine by
-- tools/db-harness/voicePool.behavior.mjs.
--
-- RLS: admins (global) and a school's teachers may READ their pool; there is
-- no authenticated write path — pools are mutated only by edge functions via
-- service_role and the definer RPCs (server-authoritative, mirrors the stance
-- of student_usage_limits / usage_counters). Students get zero rows.
--
-- PREPARED, NOT APPLIED — staging validation required (LEDGER Phase 2 /
-- workstream 2.3). Nothing here has been run against any hosted database; it is
-- validated locally by the migration harness (PGlite / Postgres 18) only.

-- =========================================================
-- 1. POOL TABLE
-- =========================================================
CREATE TABLE public.institution_voice_pools (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The pooling unit. 16 §7 pools "district-wide"; this keys the pool at the
  -- school (the tenancy boundary that exists today: profiles.school_id,
  -- teacher membership). District-level totals are the SUM of a district's
  -- school pools (schools.district_id). Same per-seat math either way.
  school_id                  uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  -- Academic period key, e.g. '2026-2027' (see current_pool_period()).
  period                     text NOT NULL,
  -- Licensed/activated seats contributing to this pool.
  seats                      integer NOT NULL DEFAULT 0 CHECK (seats >= 0),
  -- Total pooled minutes (seats × 1000, or an admin-granted larger override).
  minutes_allocated          numeric NOT NULL DEFAULT 0 CHECK (minutes_allocated >= 0),
  -- Protected realtime sub-pool floor (seats × 400).
  realtime_reserved_minutes  numeric NOT NULL DEFAULT 0 CHECK (realtime_reserved_minutes >= 0),
  -- Consumed minutes (all live-voice routes) and the realtime subset.
  minutes_used               numeric NOT NULL DEFAULT 0 CHECK (minutes_used >= 0),
  realtime_used              numeric NOT NULL DEFAULT 0 CHECK (realtime_used >= 0),
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, period),
  -- Invariants the consume RPC maintains (belt-and-suspenders):
  CONSTRAINT institution_voice_pools_realtime_subset
    CHECK (realtime_used <= minutes_used),
  CONSTRAINT institution_voice_pools_reserve_within_alloc
    CHECK (realtime_reserved_minutes <= minutes_allocated)
);

ALTER TABLE public.institution_voice_pools ENABLE ROW LEVEL SECURITY;

-- READ: global admins see every pool; a teacher sees their own school's pool.
-- (app_role has no 'teacher' member — teacher status lives in profiles.role,
-- so this is a profiles EXISTS check, not has_role.)
CREATE POLICY "Admins and teachers read voice pools"
ON public.institution_voice_pools
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'teacher'
      AND p.school_id = institution_voice_pools.school_id
  )
);
-- No INSERT/UPDATE/DELETE policy: writes are service_role only (bypasses RLS)
-- and the definer RPCs below. Students match no policy → zero rows.

REVOKE ALL ON public.institution_voice_pools FROM anon;
GRANT SELECT ON public.institution_voice_pools TO authenticated; -- RLS narrows it
GRANT ALL ON public.institution_voice_pools TO service_role;

DROP TRIGGER IF EXISTS update_institution_voice_pools_updated_at ON public.institution_voice_pools;
CREATE TRIGGER update_institution_voice_pools_updated_at
BEFORE UPDATE ON public.institution_voice_pools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2. ACADEMIC-PERIOD KEY (August boundary — fixes wip-01a F1.4)
-- =========================================================
-- Aug–Dec belongs to 'YYYY-(YYYY+1)'; Jan–Jul belongs to '(YYYY-1)-YYYY'. The
-- pool therefore resets at the school-year boundary, not on 1 January.
CREATE OR REPLACE FUNCTION public.current_pool_period(p_at timestamptz DEFAULT now())
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN EXTRACT(MONTH FROM p_at) >= 8
      THEN EXTRACT(YEAR FROM p_at)::int::text || '-' || (EXTRACT(YEAR FROM p_at)::int + 1)::text
    ELSE (EXTRACT(YEAR FROM p_at)::int - 1)::text || '-' || EXTRACT(YEAR FROM p_at)::int::text
  END
$$;
GRANT EXECUTE ON FUNCTION public.current_pool_period(timestamptz) TO authenticated, service_role;

-- =========================================================
-- 3. PROVISIONING — size allocation from the licensed roster
-- =========================================================
-- "Activated student" (16 §7) = an account provisioned under the institution's
-- license: profiles.role='student' on the school's roster. Allocation only ever
-- grows, and never drops below what the period has already consumed, so the
-- no-overage invariant can never be retroactively broken by re-provisioning.
CREATE OR REPLACE FUNCTION public.ensure_voice_pool(p_school_id uuid, p_period text DEFAULT NULL)
RETURNS public.institution_voice_pools
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_period text := COALESCE(p_period, public.current_pool_period());
  v_seats  integer;
  v_row    public.institution_voice_pools;
BEGIN
  SELECT count(*) INTO v_seats
  FROM public.profiles
  WHERE school_id = p_school_id AND role = 'student';

  INSERT INTO public.institution_voice_pools AS pool
    (school_id, period, seats, minutes_allocated, realtime_reserved_minutes)
  VALUES
    (p_school_id, v_period, v_seats, v_seats * 1000, v_seats * 400) -- 16 §7 per-seat sizing
  ON CONFLICT (school_id, period) DO UPDATE
    SET seats = EXCLUDED.seats,
        minutes_allocated = GREATEST(pool.minutes_allocated, EXCLUDED.minutes_allocated, pool.minutes_used),
        realtime_reserved_minutes = GREATEST(pool.realtime_reserved_minutes, EXCLUDED.realtime_reserved_minutes),
        updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_voice_pool(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_voice_pool(uuid, text) TO service_role;

-- =========================================================
-- 4. CONSUME — the pooled, degrade-not-bill router (16 §7)
-- =========================================================
-- Mirrors decideVoiceRoute() in _shared/voicePool.ts exactly:
--   pool_remaining     = minutes_allocated − minutes_used            (realtime cap)
--   general_remaining  = (minutes_allocated − realtime_reserved) − (minutes_used − realtime_used)
--   nonrealtime_cap    = LEAST(general_remaining, pool_remaining)    (cascade/drill cap)
-- All-or-degrade: a request is booked at its requested tier only if it fits its
-- cap; otherwise the whole request degrades (books 0) — no overage, no bill.
CREATE OR REPLACE FUNCTION public.consume_voice_minutes(
  p_school_id  uuid,
  p_minutes    numeric,
  p_is_realtime boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pool               public.institution_voice_pools;
  v_m                  numeric := GREATEST(0, COALESCE(p_minutes, 0));
  v_requested          text := CASE WHEN p_is_realtime THEN 'realtime' ELSE 'cascade' END;
  v_general            numeric;
  v_pool_remaining     numeric;
  v_general_remaining  numeric;
  v_nonrt_cap          numeric;
  v_nonrt_used         numeric;
  v_route              text;
  v_granted            numeric := 0;
  v_reason             text;
  v_rt_reserve_left    numeric;
BEGIN
  -- Serialize concurrent consumption of the SAME pool: the row lock makes two
  -- edge-function calls read-modify-write in sequence, so they cannot both
  -- observe the same remaining and double-spend into an overage (lost update).
  SELECT * INTO v_pool
  FROM public.institution_voice_pools
  WHERE school_id = p_school_id AND period = public.current_pool_period()
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Unprovisioned pool: degrade gracefully, never error, never bill.
    RETURN jsonb_build_object(
      'allowed', false,
      'route', CASE WHEN p_is_realtime THEN 'text' ELSE 'cached' END,
      'degrade_to', CASE WHEN p_is_realtime THEN 'text' ELSE 'cached' END,
      'granted_minutes', 0,
      'minutes_remaining', 0,
      'realtime_reserve_remaining', 0,
      'notify_admin', false,
      'reason', 'pool_unprovisioned'
    );
  END IF;

  v_nonrt_used        := GREATEST(0, v_pool.minutes_used - v_pool.realtime_used);
  v_general           := GREATEST(0, v_pool.minutes_allocated - v_pool.realtime_reserved_minutes);
  v_pool_remaining    := GREATEST(0, v_pool.minutes_allocated - v_pool.minutes_used);
  v_general_remaining := GREATEST(0, v_general - v_nonrt_used);
  v_nonrt_cap         := LEAST(v_general_remaining, v_pool_remaining);

  IF p_is_realtime THEN
    IF v_m <= v_pool_remaining THEN
      v_route := 'realtime';
      v_granted := v_m;
      v_reason := CASE WHEN v_m = 0 THEN 'noop' ELSE 'ok' END;
    ELSE
      -- Realtime yields last: cascade if any cascade capacity remains, else
      -- text. (nonrt_cap ≤ pool_remaining < v_m, so this resolves to text at
      -- true exhaustion — parity with the reference module.)
      v_route := CASE WHEN v_m <= v_nonrt_cap THEN 'cascade' ELSE 'text' END;
      v_granted := 0;
      v_reason := 'pool_exhausted';
    END IF;
  ELSE
    IF v_m <= v_nonrt_cap THEN
      v_route := 'cascade';
      v_granted := v_m;
      v_reason := CASE WHEN v_m = 0 THEN 'noop' ELSE 'ok' END;
    ELSE
      -- Non-realtime degrades to the free deterministic/cached route so the
      -- protected realtime reserve is never consumed by drills/cascade.
      v_route := 'cached';
      v_granted := 0;
      v_reason := CASE WHEN v_pool_remaining > 0 THEN 'nonrealtime_pool_protected' ELSE 'pool_exhausted' END;
    END IF;
  END IF;

  IF v_granted > 0 THEN
    UPDATE public.institution_voice_pools
    SET minutes_used  = minutes_used + v_granted,
        realtime_used = realtime_used + CASE WHEN p_is_realtime THEN v_granted ELSE 0 END,
        updated_at    = now()
    WHERE id = v_pool.id;
  END IF;

  v_pool_remaining := GREATEST(0, v_pool.minutes_allocated - (v_pool.minutes_used + v_granted));
  v_rt_reserve_left := GREATEST(0, v_pool.realtime_reserved_minutes
    - (v_pool.realtime_used + CASE WHEN p_is_realtime THEN v_granted ELSE 0 END));

  RETURN jsonb_build_object(
    'allowed', (v_route = v_requested),
    'route', v_route,
    'degrade_to', CASE WHEN v_route = v_requested THEN NULL ELSE v_route END,
    'granted_minutes', v_granted,
    'minutes_remaining', v_pool_remaining,
    'realtime_reserve_remaining', v_rt_reserve_left,
    'notify_admin', (v_pool.minutes_allocated > 0
                     AND (v_pool.minutes_used + v_granted) / v_pool.minutes_allocated >= 0.8),
    'reason', v_reason
  );
END;
$$;

-- Consumption is server-measured only: students/teachers must never book
-- minutes directly (would let a client drain or spare the pool). Edge functions
-- call this as service_role.
REVOKE ALL ON FUNCTION public.consume_voice_minutes(uuid, numeric, boolean) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_voice_minutes(uuid, numeric, boolean) TO service_role;

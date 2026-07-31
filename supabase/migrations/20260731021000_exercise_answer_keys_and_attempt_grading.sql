-- WORKSTREAM 2.1 — Grading service beyond MCQ (plan 06 §E2 grading service,
-- §E9 partial credit, §2.3 answer-key protection, §6.2 attempt schema deltas).
--
-- 1. public.exercise_answer_keys: the server-only key store for the Wave-1
--    (and later) primitives. Holds the primitive tag, the answer `key` jsonb
--    (accept-lists / token solutions / correct options / cloze blanks) and a
--    `grading` jsonb (tier, pass_threshold, near_miss…). This REPLACES the
--    label-encoding hack the quarantined WIP grader used (keys smuggled through
--    exercise_options.label, rejected by 06 §6.4). Posture is deliberately
--    STRICTER than exercise_options: NO grant to authenticated and NO client
--    RLS policy — service-role only, read exclusively inside submit-exercise
--    (the single grading writer). exercise_options still carries a table-level
--    GRANT SELECT (20260729164446 :166); this table carries none.
-- 2. public.exercise_attempts gains the partial-credit / provenance columns
--    from 06 §E9/§6.2 so a graded attempt can express a continuous score, a
--    pass flag, the hint level, the grader version, the tier and the raw
--    response. `is_correct` is KEPT as the boolean the mastery/lesson/XP
--    pipeline already reads (06 §6.2 "keep is_correct as an alias during
--    migration"); submit-exercise writes is_correct = passed = grade.correct.
--
-- Security-relevant SQL → proven by tools/db-harness/answerKeys.behavior.mjs
-- (authenticated has NO privilege on exercise_answer_keys; service_role does).
--
-- PREPARED, NOT APPLIED — staging validation required (LEDGER Phase 2 /
-- workstream 2.1). The local db-harness validates the chain; nothing here has
-- been run against the hosted database.

-- =========================================================
-- 1. SERVER-ONLY ANSWER-KEY STORE
-- =========================================================

CREATE TABLE IF NOT EXISTS public.exercise_answer_keys (
  exercise_id    uuid PRIMARY KEY REFERENCES public.exercises(id) ON DELETE CASCADE,
  -- Grading primitive (06 §5 envelope `primitive`). Not FK-constrained to the
  -- exercises.type CHECK: the primitive vocabulary is the grader registry's
  -- (supabase/functions/_shared/graders.ts), which is broader than the legacy
  -- type list and evolves per wave.
  primitive      text NOT NULL,
  -- Answer material — accept-lists, token solutions, correct options, cloze
  -- blank keys. Shape is per-primitive (06 §3 Key blocks). NEVER serialized to
  -- a client (06 §2.3); only submit-exercise reads it with the service role.
  key            jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Grading config: tier, pass_threshold, near_miss, keep_accents (06 §5).
  grading        jsonb NOT NULL DEFAULT '{}'::jsonb,
  grader_version text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exercise_answer_keys IS
  'Server-only exercise answer keys + grading config (plan 06 §2.3). No authenticated grant, no client RLS policy: read exclusively by submit-exercise under the service role. Stricter than exercise_options by design.';

-- Service role ONLY. Deliberately NO grant to authenticated (contrast the
-- table-level GRANT SELECT that exercise_options still carries).
GRANT ALL ON public.exercise_answer_keys TO service_role;

-- RLS enabled with NO policy: belt-and-braces deny for any non-superuser role
-- even if a grant were mistakenly added later. service_role bypasses RLS.
ALTER TABLE public.exercise_answer_keys ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_exercise_answer_keys_updated
  BEFORE UPDATE ON public.exercise_answer_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2. ATTEMPT GRADING COLUMNS (partial credit + provenance)
-- =========================================================

ALTER TABLE public.exercise_attempts
  ADD COLUMN IF NOT EXISTS score          numeric CHECK (score IS NULL OR (score >= 0 AND score <= 1)),
  ADD COLUMN IF NOT EXISTS passed         boolean,
  ADD COLUMN IF NOT EXISTS hint_level     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier           integer,
  ADD COLUMN IF NOT EXISTS grader_version text,
  -- Raw learner response (option id, text, ordered tokens, cloze blanks…) so a
  -- grade is reproducible / re-gradable (06 §6.1 grader_version audit).
  ADD COLUMN IF NOT EXISTS response       jsonb;

COMMENT ON COLUMN public.exercise_attempts.score IS
  'Continuous grade in [0,1] (plan 06 §E9). is_correct/passed carry the pass verdict the mastery/lesson/XP pipeline reads.';

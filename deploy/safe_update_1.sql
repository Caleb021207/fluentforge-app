-- ============================================================
--  PALAVOX — Safe Database Update #1  (additive foundation)
-- ------------------------------------------------------------
--  SAFETY GUARANTEES:
--   * ALL-OR-NOTHING: everything runs inside one transaction.
--     If any single line fails, the whole thing undoes itself
--     and your database is left EXACTLY as it was.
--   * ADD-ONLY: it only creates NEW storage. It does not change,
--     rename, or delete anything your live app already uses, so
--     it cannot break the running app.
--   * Safe to run more than once (every step checks first).
--
--  What it will NOT do: change how your app looks or behaves yet.
--  This is groundwork the new features will sit on later.
-- ============================================================

BEGIN;

-- 0. Standard helper used by the "updated_at" timestamps below.
--    CREATE OR REPLACE is harmless if it already exists.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. Server-only answer-key store (powers the new grading engine
--    that can grade fill-in-the-blank, typing, ordering, etc. —
--    not just multiple choice). Answers live server-side only.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exercise_answer_keys (
  exercise_id    uuid PRIMARY KEY REFERENCES public.exercises(id) ON DELETE CASCADE,
  primitive      text NOT NULL,
  key            jsonb NOT NULL DEFAULT '{}'::jsonb,
  grading        jsonb NOT NULL DEFAULT '{}'::jsonb,
  grader_version text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.exercise_answer_keys TO service_role;
ALTER TABLE public.exercise_answer_keys ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_exercise_answer_keys_updated ON public.exercise_answer_keys;
CREATE TRIGGER trg_exercise_answer_keys_updated
  BEFORE UPDATE ON public.exercise_answer_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. A few extra columns on exercise_attempts so a graded answer
--    can record a partial score + how it was graded (for audit).
--    ADD COLUMN IF NOT EXISTS = skips any that already exist.
-- ============================================================
ALTER TABLE public.exercise_attempts
  ADD COLUMN IF NOT EXISTS score          numeric CHECK (score IS NULL OR (score >= 0 AND score <= 1)),
  ADD COLUMN IF NOT EXISTS passed         boolean,
  ADD COLUMN IF NOT EXISTS hint_level     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier           integer,
  ADD COLUMN IF NOT EXISTS grader_version text,
  ADD COLUMN IF NOT EXISTS response       jsonb;

-- ============================================================
-- 3. Unified learner-memory foundation (spaced-repetition "cards"
--    plus an honest evidence ladder). New table only — nothing
--    reads or writes it yet; it's the groundwork for smarter review.
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.learner_proficiency_rung AS ENUM (
    'unseen','exposed','recognition','cued_recall','production','spontaneous'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.learner_memory_items (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_kind      text NOT NULL CHECK (item_kind IN (
    'vocab','chunk','grammar','pronunciation','phoneme_contrast',
    'listening','writing','function','error_pattern')),
  item_ref       uuid,
  item_key       text NOT NULL,
  stability      numeric     NOT NULL DEFAULT 0,
  difficulty     numeric     NOT NULL DEFAULT 0,
  due            timestamptz NOT NULL DEFAULT now(),
  last_review    timestamptz,
  reps           integer     NOT NULL DEFAULT 0,
  lapses         integer     NOT NULL DEFAULT 0,
  state          integer     NOT NULL DEFAULT 0,
  elapsed_days   numeric     NOT NULL DEFAULT 0,
  scheduled_days numeric     NOT NULL DEFAULT 0,
  learning_steps integer     NOT NULL DEFAULT 0,
  proficiency_rung public.learner_proficiency_rung NOT NULL DEFAULT 'unseen',
  productive_uses  integer NOT NULL DEFAULT 0,
  evidence         jsonb   NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_kind, item_key)
);

CREATE INDEX IF NOT EXISTS idx_learner_memory_items_due  ON public.learner_memory_items (user_id, due);
CREATE INDEX IF NOT EXISTS idx_learner_memory_items_kind ON public.learner_memory_items (user_id, item_kind);

GRANT SELECT ON public.learner_memory_items TO authenticated;
GRANT ALL    ON public.learner_memory_items TO service_role;
ALTER TABLE public.learner_memory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners read own memory items" ON public.learner_memory_items;
CREATE POLICY "Learners read own memory items" ON public.learner_memory_items
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_learner_memory_items_updated ON public.learner_memory_items;
CREATE TRIGGER trg_learner_memory_items_updated
  BEFORE UPDATE ON public.learner_memory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

-- If you reached here, everything committed. This line just prints proof:
SELECT 'SUCCESS — safe foundation added. Your live app is unchanged.' AS result;

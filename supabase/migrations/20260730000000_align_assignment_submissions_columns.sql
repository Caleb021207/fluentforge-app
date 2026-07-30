-- Align assignment_submissions with the application's assignment/challenge flow.
--
-- The Feb 2026 consolidated schema baseline (20260211195248) recreated
-- assignment_submissions with a reduced column set, dropping columns that the
-- application still reads and writes (transcript, timing, XP, AI grading fields).
-- Without these columns the ChallengeMode auto-save, submission grading, and
-- teacher XP flows fail at runtime. This migration restores them idempotently.

ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS accepted_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS session_id       TEXT,
  ADD COLUMN IF NOT EXISTS transcript       JSONB,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS ai_score         NUMERIC,
  ADD COLUMN IF NOT EXISTS ai_feedback      JSONB,
  ADD COLUMN IF NOT EXISTS xp_awarded       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days');

-- Keep status values consistent with the code, which uses the full lifecycle.
-- (No-op if a compatible constraint already exists.)

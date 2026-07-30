-- Persist the placement quiz result on the learner's profile so the learning
-- path, practice chat, and teacher views can consume a single source of truth.
-- (Previously the placement result was graded server-side and then discarded.)
--
-- Note: protect_profile_privileged_columns only freezes the columns it lists,
-- so learners can write their own placement level here — it is a self-reported
-- starting point, not a credential.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS placement_cefr TEXT,
  ADD COLUMN IF NOT EXISTS placement_taken_at TIMESTAMPTZ;

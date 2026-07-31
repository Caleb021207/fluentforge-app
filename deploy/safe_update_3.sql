-- ============================================================
--  PALAVOX — Safe Database Update #3  (conversation history)
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
--  What it adds: one table that stores a learner's finished
--  practice conversations (which scenario, how many messages,
--  and the coach feedback) so progress can be shown over time.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Conversation session history. Written ONLY by the server
--    (service role) after a practice conversation ends; learners
--    can read their own rows. No client writes at all.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id   text,
  message_count integer NOT NULL DEFAULT 0,
  feedback      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_created
  ON public.conversation_sessions (user_id, created_at DESC);

GRANT SELECT ON public.conversation_sessions TO authenticated;
GRANT ALL    ON public.conversation_sessions TO service_role;
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners read own conversation sessions" ON public.conversation_sessions;
CREATE POLICY "Learners read own conversation sessions" ON public.conversation_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMIT;

-- If you reached here, everything committed. This line just prints proof:
SELECT 'SUCCESS — conversation history storage added. Your live app is unchanged.' AS result;

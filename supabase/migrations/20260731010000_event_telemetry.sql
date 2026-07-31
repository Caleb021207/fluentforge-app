-- WORKSTREAM 1.5 — Telemetry event tables (plan wip-03a §2 Deliverable 1; 17 P1).
--
-- 1. public.learning_events: the canonical behavioral event stream (wip-03a
--    §2.2 envelope, adapted to the workstream brief's column names). The
--    event_type CHECK mirrors the CLOSED taxonomy in
--    supabase/functions/_shared/eventTypes.ts (the grep-able registry,
--    AC1.2). Adding an event type is a two-file PR: that module AND this
--    constraint (contract test: tests/server-pure/eventTypes.test.ts).
-- 2. public.learning_events_daily: plain view (chosen over a materialized
--    view — no refresh job exists yet; no pg_cron schedule is present in any
--    migration [observed], so a matview would silently go stale) giving
--    per-user per-day activity rollups. security_invoker so the base
--    table's RLS applies to the querying user, not the view owner.
-- 3. RLS: SELECT own + is_teacher_of_student + admin (the exact xp_events
--    policy pattern, 20260729171206 :139-143). INSERT is service-role ONLY:
--    no authenticated INSERT policy and no INSERT grant — events are written
--    exclusively by edge functions (wip-03a §2.2 write path; mirrors the
--    server-authoritative stance of submit-exercise).
--
-- PREPARED, NOT APPLIED — staging validation required (LEDGER Phase 1 /
-- workstream 1.5). Nothing here has been run against any database.

-- =========================================================
-- 1. EVENT TABLE
-- =========================================================

CREATE TABLE public.learning_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL for pure system events (actor_role='system' in the taxonomy).
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Tenant-ready: denormalized school for district rollups (plan 14).
  -- Nullable — consumer users have no school.
  school_id    uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  -- CLOSED taxonomy — keep in exact sync with EVENT_TYPES in
  -- supabase/functions/_shared/eventTypes.ts.
  event_type   text NOT NULL CHECK (event_type IN (
    -- learner events
    'session.start','session.end',
    'lesson.start','lesson.complete','lesson.abandon',
    'exercise.attempt','exercise.hint',
    'review.card',
    'mission.start','mission.step','mission.complete',
    'conversation.turn','conversation.end',
    'speech.pronunciation_scored',
    'assessment.placement_completed','assessment.attempt',
    'evidence.transcript_uploaded','evidence.analysis_completed','evidence.analysis_failed',
    'assignment.viewed','assignment.submitted',
    'nav.page',
    -- teacher events
    'teacher.class_created','teacher.assignment_created','teacher.roster_changed',
    'teacher.report_viewed','teacher.report_exported','teacher.intervention_ack',
    -- system events
    'system.provider_call','system.quota_exhausted','system.gate_run',
    'system.job_run','system.rls_denied_report'
  )),
  -- Entity refs, all nullable. Deliberately NOT foreign keys: lessons are
  -- being re-seeded by the content pipeline (0.7) and the missions table
  -- does not exist yet (task #16 frozen) — events must outlive the
  -- entities they reference (append-only audit semantics).
  lesson_id    uuid,
  exercise_id  uuid,
  mission_id   uuid,
  modality     text CHECK (modality IN ('tap','type','speak','listen','read','write')),
  duration_ms  integer CHECK (duration_ms >= 0),
  -- NO PII (wip-03a §2.4, non-negotiable): enumerated strings and numbers
  -- ONLY. Never names, emails, addresses, free text, uploaded-file names,
  -- IPs, user agents, precise geo, or learner-generated language.
  -- user_id above is the only identifier an event may carry. Write path
  -- validates with validateEvent() in _shared/eventTypes.ts.
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_events IS
  'Canonical behavioral event stream (wip-03a Deliverable 1). Append-only; written by edge functions with the service role only.';
COMMENT ON COLUMN public.learning_events.metadata IS
  'NO PII: enumerated strings and numbers only — never names, emails, addresses, free text, file names, IPs, or learner-generated language (wip-03a §2.4). Validated by _shared/eventTypes.ts validateEvent().';

CREATE INDEX idx_learning_events_user_occurred
  ON public.learning_events (user_id, occurred_at DESC);
CREATE INDEX idx_learning_events_type_occurred
  ON public.learning_events (event_type, occurred_at DESC);

-- =========================================================
-- 2. GRANTS + RLS — SELECT own/teacher/admin; INSERT service-role only
-- =========================================================

-- SELECT only for clients. NO INSERT/UPDATE/DELETE grant to authenticated:
-- even a mistakenly-created permissive policy could not open a write path
-- without a matching grant (belt and braces).
GRANT SELECT ON public.learning_events TO authenticated;
GRANT ALL ON public.learning_events TO service_role;

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners read own events" ON public.learning_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Teachers read their students events" ON public.learning_events
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

-- Deliberately NO INSERT policy for authenticated: events enter exclusively
-- through edge functions using the service role (which bypasses RLS). The
-- client can never invent an event (wip-03a §2.2/§2.4; contrast with the
-- client-writable usage_tracking/api_calls_tracking/student_metrics tables
-- this stream is designed to replace, wip-03a §1).

-- =========================================================
-- 3. DAILY ROLLUP VIEW (plain view; matview deferred until pg_cron exists)
-- =========================================================

CREATE VIEW public.learning_events_daily
WITH (security_invoker = true) AS
SELECT
  user_id,
  school_id,
  (occurred_at AT TIME ZONE 'utc')::date AS activity_date,
  event_type,
  count(*)::bigint                        AS event_count,
  coalesce(sum(duration_ms), 0)::bigint   AS total_duration_ms
FROM public.learning_events
WHERE user_id IS NOT NULL
GROUP BY user_id, school_id, (occurred_at AT TIME ZONE 'utc')::date, event_type;

COMMENT ON VIEW public.learning_events_daily IS
  'Per-user daily activity rollup over learning_events (wip-03a §2.5 rollup_user_day, simplest form). security_invoker: callers see only rows their learning_events RLS allows. Replace with a pg_cron-refreshed materialized table when event volume warrants (wip-03a guardrail 1).';

GRANT SELECT ON public.learning_events_daily TO authenticated;
GRANT SELECT ON public.learning_events_daily TO service_role;

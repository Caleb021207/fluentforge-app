-- WORKSTREAM 2.2 — Unified learner-memory model (plan 05 §2 entity model, §3
-- scheduling, §6 migration path M1→M2→M3). Successor to vocab_card_state:
-- one FSRS card per trackable "memory item" across all nine target kinds,
-- with a second orthogonal axis — the proficiency-evidence ladder — so mastery
-- claims never rest on recognition/exposure (owner rule; plan §2.1, §2.5).
--
-- SCOPE OF THIS MIGRATION — ADDITIVE FOUNDATION ONLY (plan §6.1 Phase M1):
--   * Creates NEW objects only. It does NOT drop or alter any existing column
--     or table. vocab_card_state / vocab_review_log / skill_mastery are left
--     exactly as-is; dual-write and cutover are later workstreams (§6.1 M2/M3).
--   * The app is intentionally NOT wired to this table yet. No edge function or
--     client code reads or writes it in this release — this file is the schema
--     foundation plus the read-only projection needed to build the M2 diff.
--
-- ROLLBACK IS TRIVIAL AND SAFE — the ONLY objects to drop are the ones created
-- here (no data is migrated, nothing existing is mutated):
--     DROP VIEW    IF EXISTS public.learner_memory_items_from_vocab;
--     DROP TABLE   IF EXISTS public.learner_memory_items;      -- drops its indexes/policies/trigger
--     DROP TYPE    IF EXISTS public.learner_proficiency_rung;
--
-- PREPARED, NOT APPLIED — validated locally against the PGlite migration
-- harness (tools/db-harness) only; nothing here has been run against any hosted
-- database. Requires production apply (LEDGER workstream 2.2).

-- =========================================================
-- 1. PROFICIENCY-EVIDENCE LADDER (the second axis; plan §2.1)
-- =========================================================
-- Evidence depth = the highest CORROBORATED rung of knowing that has been
-- proven for an item, tracked independently of FSRS memory strength. Ordered
-- (Postgres enums sort by declaration order) so the owner rule is expressible
-- directly in SQL: anything at or below 'recognition' can NEVER feed a
-- proficiency/mastery claim (plan §2.1, §2.5), i.e. the gate is
-- `proficiency_rung > 'recognition'`.
--
-- The four claim-bearing rungs the brief enumerates are
-- recognition < cued_recall < production < spontaneous. Two pre-evidence floor
-- values ('unseen', 'exposed') are included below them (plan §2.1's full
-- 0→5 ladder) so a freshly-created card has an HONEST default of 'unseen'
-- rather than falsely asserting recognition it has not demonstrated.
CREATE TYPE public.learner_proficiency_rung AS ENUM (
  'unseen',       -- 0: target exists / taught-set entry, no interaction yet
  'exposed',      -- 1: seen (intro), not yet retrieved  — cannot feed claims
  'recognition',  -- 2: recognized (e.g. flashcard flip) — cannot feed claims (owner rule)
  'cued_recall',  -- 3: recalled with a cue (typed recall, cloze)
  'production',   -- 4: produced in a structured task
  'spontaneous'   -- 5: used spontaneously in open/guided conversation
);
COMMENT ON TYPE public.learner_proficiency_rung IS
  'Evidence-depth axis (plan 05 §2.1). Ordered; rungs <= recognition never feed proficiency/mastery claims (owner rule). unseen/exposed are the honest pre-evidence floor.';

-- =========================================================
-- 2. LEARNER MEMORY ITEMS — one row = one FSRS card + evidence overlay
-- =========================================================
CREATE TABLE public.learner_memory_items (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Which kind of thing is being learned (plan §2.2, nine kinds). CHECK, not a
  -- lookup table: the set is closed by design and enumerated in the brief.
  item_kind      text NOT NULL CHECK (item_kind IN (
    'vocab','chunk','grammar','pronunciation','phoneme_contrast',
    'listening','writing','function','error_pattern')),

  -- Content anchor. Nullable and deliberately NOT a foreign key: only vocab
  -- (vocabulary.id) and function (can_do_statements.id) have content tables
  -- today; chunk/grammar/pronunciation/phoneme_contrast/listening/writing land
  -- in a future memory_targets registry (plan §2.3), and error_pattern is
  -- derived (§4). Same append-only-outlives-entity rationale as
  -- learning_events (20260731010000).
  item_ref       uuid,

  -- Stable per-(user,kind) key and part of the natural PK. For vocab this is
  -- vocabulary_id::text; for authored kinds it is the content-published key;
  -- for error_pattern it is the taxonomy_code (+ optional target) (plan §4).
  item_key       text NOT NULL,

  -- ---- FSRS-5 memory state (column-for-column mirror of vocab_card_state,
  -- 20260729171206:77-86, so the M2 dual-write is a straight copy) ----
  stability      numeric     NOT NULL DEFAULT 0,
  difficulty     numeric     NOT NULL DEFAULT 0,
  due            timestamptz NOT NULL DEFAULT now(),
  last_review    timestamptz,
  reps           integer     NOT NULL DEFAULT 0,
  lapses         integer     NOT NULL DEFAULT 0,
  state          integer     NOT NULL DEFAULT 0,   -- FSRS: New=0 Learning=1 Review=2 Relearning=3
  elapsed_days   numeric     NOT NULL DEFAULT 0,
  scheduled_days numeric     NOT NULL DEFAULT 0,
  learning_steps integer     NOT NULL DEFAULT 0,

  -- ---- Evidence-depth axis (plan §2.1) ----
  proficiency_rung public.learner_proficiency_rung NOT NULL DEFAULT 'unseen',
  productive_uses  integer NOT NULL DEFAULT 0,      -- count of production/spontaneous uses (feeds §5.1 Beta mastery)
  evidence         jsonb   NOT NULL DEFAULT '{}'::jsonb,  -- per-channel evidence summary/provenance overlay (plan §2.3)

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, item_kind, item_key)
);

COMMENT ON TABLE public.learner_memory_items IS
  'Unified learner-memory card (plan 05 §2). Successor of vocab_card_state; one FSRS card per memory item across nine kinds, plus the proficiency-evidence ladder overlay. Server-authoritative: written only by edge functions (service role). ADDITIVE FOUNDATION — not yet wired to the app (plan §6.1 M1).';
COMMENT ON COLUMN public.learner_memory_items.item_ref IS
  'Optional content anchor (vocabulary.id, can_do_statements.id, future memory_targets.id). Not a FK: several kinds have no content table yet and events must outlive re-seeded content.';
COMMENT ON COLUMN public.learner_memory_items.proficiency_rung IS
  'Highest corroborated evidence rung (plan §2.1). <= recognition never feeds proficiency/mastery claims (owner rule).';

-- Indexes (plan §3.3 queue reads: due-ordering per learner; per-kind slicing).
CREATE INDEX idx_learner_memory_items_due  ON public.learner_memory_items (user_id, due);
CREATE INDEX idx_learner_memory_items_kind ON public.learner_memory_items (user_id, item_kind);

-- ---- Grants + RLS: SELECT own/teacher/admin; writes are SERVICE-ROLE ONLY ----
-- Same pattern as vocab_card_state (20260729171206:91-98) and learning_events
-- (20260731010000): no INSERT/UPDATE/DELETE grant or policy for authenticated,
-- so even a mistaken permissive policy could not open a client write path
-- (belt and braces) — the scheduler is server-authoritative.
GRANT SELECT ON public.learner_memory_items TO authenticated;
GRANT ALL    ON public.learner_memory_items TO service_role;

ALTER TABLE public.learner_memory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners read own memory items" ON public.learner_memory_items
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Teachers read their students memory items" ON public.learner_memory_items
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_learner_memory_items_updated
  BEFORE UPDATE ON public.learner_memory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 3. READ-ONLY MAPPING VIEW — current vocab_card_state projected into the
--    new shape (plan §6.1 M2 dual-write diff source)
-- =========================================================
-- Projects every existing vocab_card_state row AS IF it were a
-- learner_memory_items row, so the M2 nightly diff can assert equality of the
-- FSRS fields between the legacy store (via this view) and the new store,
-- WITHOUT migrating any data here (backfill is the M1 data step / cutover,
-- owned by a later workstream). Recognition-only history maps honestly:
-- proficiency_rung = 'recognition' iff the card has been reviewed (reps > 0),
-- else 'unseen' (plan §6.1 M1 step 2 — "evidence_rung = 2 where reps > 0").
--
-- security_invoker = true: the view carries no RLS of its own; it runs the
-- underlying vocab_card_state scan as the QUERYING role, so a student sees only
-- their own rows through it and a teacher/admin/service role sees what their
-- own RLS on vocab_card_state allows.
CREATE VIEW public.learner_memory_items_from_vocab
WITH (security_invoker = true) AS
SELECT
  vcs.user_id,
  'vocab'::text                    AS item_kind,
  vcs.vocabulary_id                AS item_ref,
  vcs.vocabulary_id::text          AS item_key,
  vcs.stability,
  vcs.difficulty,
  vcs.due,
  vcs.last_review,
  vcs.reps,
  vcs.lapses,
  vcs.state,
  vcs.elapsed_days,
  vcs.scheduled_days,
  vcs.learning_steps,
  (CASE WHEN vcs.reps > 0 THEN 'recognition' ELSE 'unseen' END)::public.learner_proficiency_rung
                                   AS proficiency_rung,
  0::integer                       AS productive_uses,
  '{}'::jsonb                      AS evidence
FROM public.vocab_card_state vcs;

COMMENT ON VIEW public.learner_memory_items_from_vocab IS
  'Read-only projection of vocab_card_state into the learner_memory_items shape (plan 05 §6.1 M2 dual-write diff). No data migrated; security_invoker so underlying vocab_card_state RLS applies to the caller.';

GRANT SELECT ON public.learner_memory_items_from_vocab TO authenticated;
GRANT SELECT ON public.learner_memory_items_from_vocab TO service_role;

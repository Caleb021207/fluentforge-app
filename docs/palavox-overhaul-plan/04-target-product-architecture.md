# 04 · Target Product Architecture

The integrative view. Deep specifications live in 05 (memory/mastery), 06 (exercises),
09 (interaction contracts), 10 (post-course), 11 (voice), 12 (assessment), 13 (localization),
14 (institutional), 15 (data/security). Everything here is [proposed]; current-state contrasts
cite the audits.

---

## 1. Product model

One platform, two first-class **language pairs** (L1→EN for ~41 L1s; EN→ES), each carrying a
finite conversation-first course (A1→A2, ~228 lessons + 8 checkpoint experiences) that graduates
into a conversation-led continuation system. Every production learner account is provisioned
under an institutional tenant — learners are either classroom-assigned or use institutionally
licensed independent practice; both modes are tenant-bound. All deployments share the
platform; institutions add tenancy, rostering, reporting, and accommodations.

```mermaid
flowchart LR
  subgraph Platform (language-agnostic)
    ENG[Lesson engine\n+ 22 exercise primitives]
    MEM[Learner memory\nFSRS-5 unified model]
    MIS[Mission runtime\ninteraction contracts]
    VOX[Voice abstraction\nPattern-D router]
    ASSESS[Uploaded-assessment\npipeline (protected)]
    TEN[Tenancy + roles + safety]
    ANA[Events + reporting]
  end
  subgraph Content (per language pair)
    MAP[Course maps 07/08]
    VOC[Vocabulary + L1 glosses]
    CON[Contrastive notes per L1]
    AUD[Cached lesson audio]
  end
  MAP --> ENG --> MEM
  MAP --> MIS --> MEM
  VOC --> ENG & MIS
  VOX --> MIS
  MEM --> MIS
  ASSESS -. provenance-labeled evidence .-> ANA
  TEN --> ENG & MIS & ANA
```

## 2. Domain model (target entities)

**Identity/tenancy** (15): `districts → schools → classes → enrollments(academic_session)` with
immutable service-stamped `school_id` on student-data leaf tables; verified-teacher grants;
`guardians`, `parental_consent_records`, `data_access_audit`, `dsar_requests`; server-resolved
`SafetyContext` per request.

**Content** (06/07/08/13): `courses(language_pair) → units(band, release ratios) → skills →
lessons → exercises(content jsonb, versioned)` + server-only `exercise_answer_keys`;
`conversation_missions` (full interaction contract, 09); `course_checkpoints`; `passages`;
`vocabulary` + `vocabulary_glosses(l1)` + `contrastive_notes(l1)`; `content_localizations`
with `source_hash` staleness; locale registry. Status lifecycle draft→gated→operational retained;
six-gate gauntlet + seven new gates (06 §E7).

**Learner state** (05): `learner_memory_items` (9 kinds; FSRS-5 state + evidence ladder
recognition<cued<production<spontaneous), `exercise_attempts` (typed response + score),
`mission_attempts` (transcript, criteria_met, outcome), `learner_errors` (taxonomy, occurrences,
resolution), `checkpoint_attempts`, `course_graduation`, `study_time_log` (7 activity classes —
the honest-hours ledger), single XP ledger (`xp_events`) + `learner_streaks`.

**Assessment (protected)**: `transcript_analyses` append-only + status lifecycle; presented
through the provenance-labeled evidence panel (12 §3) alongside — never merged with — course
mastery, placement, and graduation records.

## 3. Service boundaries

| Service | Runs on | Responsibility | Key contracts |
| --- | --- | --- | --- |
| Web app | Vite/React (existing) | rendering, renderer shell + primitive renderers (no grading, no keys) | `PrimitiveRenderer` (06 §E5) |
| Core API | Supabase (Postgres+RLS) | CRUD under RLS, tenancy enforcement | RLS patterns (15 §2) |
| `submit-attempt` | Edge fn (refactor of submit-exercise) | all exercise grading; single writer of progress/XP/streak side effects | grader registry `_shared/graders/*`; async 202 lane for AI grading |
| Mission runtime | Edge fn (text) + **agent worker on LiveKit** (voice) | executes interaction contracts: prompt assembly (SafetyContext + L1 policy + contract + memory snapshot), turn loop, success evaluation, error extraction | contract schema (09 §1); `voice-session-token` mint |
| Voice router | Agent worker | Pattern-D routing (deterministic / cascade / realtime), provider abstraction, accounting ledger | provider interface (11 §6) |
| Assessment pipeline | Edge fn | protected flow: upload→validate→process→persist→present | invariants P1–P8 (12) |
| Learning scheduler | Edge fn + pg_cron | FSRS queue construction, decay, remediation triggers, quota resets | 05 §3–6 |
| Events/reporting | Postgres event tables + rollups | taxonomy (wip-03a), teacher/district reports, cost telemetry | no PII in events |

**New infrastructure component** (the only one): the agent-worker host for realtime voice —
LiveKit Cloud initially, Apache-2.0 self-host preserved as exit (11 §Hosting). Supabase remains
the system of record; workers hold no durable state and write through service APIs.

## 4. Key event flows

**Lesson attempt:** renderer → `submit-attempt` → grader registry → (attempt, memory items,
lesson progress, XP, streak in one transaction) → events. Deterministic Tier 0 grades inline;
Tier 1/2 (speech/LLM-rubric) return 202 + Realtime completion; Tier 2 can never flip an
objective fail (06 §E3).

**Spoken mission:** client → `voice-session-token` (quota + SafetyContext check) → LiveKit room
+ worker → routed turns (drill turns skip the LLM; open turns hit realtime-mini) → in-flight
recasts per correction policy → session end → success criteria + error extraction → memory
writes + review scheduling + honest `study_time_log(open_conversation)` + cost ledger row.

**Assessment upload (protected):** unchanged flow, hardened per 12 — status lifecycle, schema
validation, idempotency, teacher visibility via `is_teacher_of_student` under new tenancy.

**Graduation:** eligibility from evidence gates (10 §1) → adaptive conversation session →
rubric scoring → outcome routing → post-course home switch; certificate copy restricted per
claims policy (wip-03a §3).

## 5. AI orchestration & structured outputs

Every AI call goes through one prompt-assembly layer: `SafetyContext` (fail-closed strict) +
`languagePolicy` (graded L1 ratios extracted from chat-with-tutor) + task contract + learner
snapshot. All AI outputs that persist are schema-validated (zod) with quarantine-on-invalid —
generation (gauntlet), grading rubrics (bounded, floor-protected), assessment parsing (12),
error categorization (05). Model tiers: mini-class for turns and rubrics; realtime-mini for
native real-time speech; batch/self-host whisper for async re-analysis. Moderation on input+output for
minors.

## 6. Cross-cutting

**Authorization:** RLS everywhere + service-role functions individually guarded (15 §R4 audit
protocol); answer keys and prompts server-only. **Observability:** per-stage latency, provider
cost per session reconciled to invoices, error taxonomy rates, content-funnel metrics
(wip-03a §5). **Content versioning:** immutable operational versions; learners pinned per
attempt; translations hash-invalidated (13). **Degradation ladder:** realtime → cascade → text +
browser-TTS (Pattern F) → offline-tolerant review; every learner-facing surface has a defined
degraded mode. **Testing:** characterization suite first (12 §T0), golden vectors for FSRS/
graders (05/06), contract tests per service boundary, pseudo-locale + RTL CI (13), load tests to
the Scale envelope (11).

## 7. Migration posture

Strangler pattern around the preserved spine: new tables additive; dual-write windows with
nightly diffs; feature flags per surface; the July `overhaul` branch is the Phase-1 starting
point after review (owner decision 19 #8), with migration `20260730010000` reverted per 15.
Full sequencing in 17; rollback triggers in 11 §6.4 and 05 §8.

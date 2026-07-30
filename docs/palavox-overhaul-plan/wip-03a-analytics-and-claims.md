# WIP-03A — Analytics, Reporting & Proficiency-Claims Architecture

**Author:** Analytics, Reporting & Proficiency-Claims specialist (planning phase — no implementation)
**Repo:** `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`
**Date:** 2026-07-30
**Inputs read:** `wip-01a-product-inventory.md` (§3 analytics, §5 certificates, §6 gamification, §9 edge-function inventory), `wip-02-current-user-flows.md`, `wip-12a-assessment-current-state.md` — plus direct repo verification cited by file:line below.
**Labels:** `[observed]` read in repo · `[documented]` external, with URL+date · `[estimated]` · `[proposed]` design decision of this doc · `[assumption]` · `[requires validation]`.

Everything under a **"Current"** heading describes behavior at commit `7cbaadd9`. Everything under **"Proposed"** is design for the overhaul and does not exist yet.

---

## 0. Executive summary (decisions)

| # | Decision | One-line rationale |
|---|---|---|
| D1 | **One append-only `learning_events` table in Postgres** (partitioned, service-role-write-only) + nightly SQL rollups. No third-party product-analytics SDK in the learner client. | At our scale (~1M events/day at 10K DAU `[estimated]`) Postgres is comfortably sufficient, and keeping minors' behavioral data first-party is the single biggest simplifier for district DPAs/COPPA. `[proposed]` |
| D2 | **Seven-tier metrics ladder** (engagement → completion → accuracy → mastery → retention → proficiency → certification) with a hard rule: each surface may only display tiers it is entitled to, and no metric may be presented as a tier above its own. | Today XP/streak/completion numbers bleed into proficiency-shaped claims (certificates, "Current level"). The ladder makes that structurally impossible. `[proposed]` |
| D3 | **Deprecate the LLM-minted "ACTFL Advanced Low" certificates immediately** (feature-flag off in week 1); replace with a verifiable, honestly-named **"Palavox Progress Record"**; never emit an ACTFL or CEFR *level attainment* claim from any in-product evidence. | Single-LLM-read credentials with a third party's trademarked scale are indefensible pedagogically and legally (wip-01a F5.1). `[proposed]` |
| D4 | **Provenance labels on every proficiency-ish number** via a closed enum (`self_reported / ai_estimate / demonstrated / external_document / teacher_judgment`) carried from the DB to the UI. | The current UI labels an uploaded-transcript AI guess as `'certification'` (wip-12a §8.2b) — provenance must be data, not copy. `[proposed]` |
| D5 | **Five teacher/district reports** (progress-vs-plan, time-on-task, mastery heatmap, intervention flags, WIDA alignment) served from nightly rollup tables, CSV export first, with every export writing to the (currently decorative) FERPA audit table. | The report set matches what the schema can already almost answer; the blockers are three named RLS/schema gaps, not new instrumentation. `[proposed]` |
| D6 | **Observability = Sentry (scrubbed) + a first-party `provider_call_log` written inside `aiGateway` + gauntlet-funnel SQL views + a thin experiment-assignment layer.** | Today a classroom crash is invisible (wip-01a F3.3) and per-call AI cost is unrecorded anywhere `[observed — §6.2]`. `[proposed]` |

**The one dependency that gates everything:** the dual XP/streak economies (wip-01a §6) must collapse to the server-authoritative System A before any metric here is trustworthy. This doc assumes wip-01a P0 recommendations #1–#2 (kill `award-xp`/`check-streak`) are executed first. `[assumption]`

---

## 1. Current state (baseline the overhaul is measured against)

Condensed from discovery; all `[observed]` unless noted.

- **No product analytics, no error telemetry, no third-party SDK** — wip-01a F3.2/F3.3; re-verified: no `sentry|posthog|mixpanel|amplitude` in `package.json`.
- **`xp_events` is the only true event stream and misses all conversational/voice activity** — wip-01a F3.1; schema at `supabase/migrations/20260729171206_….sql:126-144` (`source, amount, ref_type, ref_id, metadata jsonb`), with teacher-of-student RLS (`:139-143`).
- **The good raw material exists for lesson/review activity only:** `exercise_attempts` records `is_correct, selected_option_id, difficulty, response_ms` (`20260729171206_….sql:51-71`); `vocab_review_log` records full FSRS state per review (`:101-123`); `lesson_progress` and `skill_mastery` are server-written aggregates (`:2-49`).
- **Conversation practice persists nothing.** `chat-with-tutor/index.ts` contains zero `.from(` calls — no turn, latency, or session record of the core tutoring loop survives the request. Voice flows write only minutes into `usage_tracking`.
- **Three "metrics" tables are client-writable:** `usage_tracking` (INSERT/UPDATE by owner, `20260211195248_….sql:137-139`), `api_calls_tracking` (INSERT by owner, `:448-449`), and — worst — `student_metrics`, where a student can INSERT/UPDATE their **own teacher-visible averages** (`:283-285`). Any metric sourced from these is untrusted.
- **`generate-teacher-report` reads only the legacy layer** (`classes/enrollments/profiles/assignments/assignment_submissions/student_metrics/student_language_metrics` — `generate-teacher-report/index.ts:36-112`) and none of the new spine (`lesson_progress`, `skill_mastery`, `xp_events`, `transcript_analyses`); plus it never checks `teacherId` against the caller (wip-12a §7.2 — FERPA-relevant).
- **Certificates:** `src/utils/fluencyCertification.ts:4-5,153-154` mints "ACTFL Advanced Low (B2)" / "ACTFL Intermediate Mid (B1)" from the single latest transcript analysis; downloadable PNG with no verification path (wip-01a F5.1/F5.7). Three mutually inconsistent CEFR score mappings exist (F5.2).
- **The FERPA access-audit table has no working writer** (wip-01a F3.4).
- **No `pg_cron` schedule exists anywhere in migrations** (grep: zero hits) — nothing periodic runs today, which is also why quota resets never fire (wip-01a F1.1).
- **A genuinely good teacher analytics layer exists client-side:** `useClassCanDoMastery.ts` + `benchmarkReadiness.ts` compute can-do coverage/readiness from RLS-scoped reads; `can_do_statements` supports `WIDA | NCSSFL-ACTFL | CEFR` frameworks (`20260729164446_….sql:136-153`). Worth preserving and moving server-side.

---

## 2. Deliverable 1 — Event taxonomy & storage

### 2.1 Storage options

| | Option A — Postgres event table + SQL rollups | Option B — External analytics (PostHog/Amplitude/Mixpanel) | Option C — Hybrid (A canonical + self-hosted PostHog for exploration) |
|---|---|---|---|
| Privacy / minors | Data never leaves Supabase; one DPA chain (Supabase→district). COPPA posture simplest. | Third-party subprocessor holding minors' behavioral data; consent + DPA + district security review per vendor. Amplitude/Mixpanel not built for under-13 data. | A's posture for raw data, but a second system to secure and explain. |
| Query power | Full SQL joins against curriculum/mastery tables — the queries that matter (per-skill, per-can-do) are *only* possible here. | Funnels/retention UI out of the box, but can't join to `skill_mastery`. | Both, at 2× operational cost. |
| Cost | Storage ≈ 200–400 bytes/row → ~0.4 GB/day at 1M events/day raw `[estimated]`; partition + drop old partitions. No per-event vendor fee. | Vendor pricing at millions of events/month is real money and scales against us. | Infra cost of self-hosting PostHog (~1 dedicated instance). |
| Ops burden | Rollup jobs + partition maintenance (needs `pg_cron` — which we need anyway for quota resets, wip-01a F1.1). | Lowest ops. | Highest ops. |
| Failure blast radius | Same DB as product — heavy analytics queries can hurt prod unless rollups isolate them. | Isolated. | Isolated for exploration. |
| District procurement | "All student data stays in our database" is a sentence sales can say. | Every new subprocessor reopens the security questionnaire (wip-01a F9.6 already flags the Lovable gateway as a DPA question). | Same as B for the PostHog leg unless self-hosted. |

**Recommendation: Option A** `[proposed]`, with two guardrails:
1. All dashboard/report reads hit **rollup tables only**, never raw `learning_events` (protects prod latency).
2. The event envelope is designed to be **export-compatible** (flat JSON, ISO timestamps, enum names) so that if we outgrow Postgres (≥ ~10M events/day `[estimated]`) we can ship partitions to ClickHouse/BigQuery without re-instrumenting clients.

Scale check `[estimated]`: a daily-active learner emits ~80–150 events (3 lessons × 8 exercises × ~3 events + ~30 reviews + session/nav + conversation turns). 10K DAU → ~1–1.5M events/day, ~450M rows/year. Monthly partitions with 24-month retention keeps any single partition <50M rows — well inside Postgres comfort. Revisit at 50K DAU.

### 2.2 Event envelope (proposed schema)

```sql
CREATE TABLE public.learning_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for pure system events
  actor_role   text NOT NULL CHECK (actor_role IN ('learner','teacher','admin','system')),
  event        text NOT NULL,              -- dot-namespaced name from the closed taxonomy below
  session_id   uuid,                       -- client-generated per app session
  activity_type text CHECK (activity_type IN
    ('core_lesson','spaced_review','guided_speaking','open_conversation',
     'listening','writing','remediation','assessment','navigation')),
  ref_type     text,                       -- 'lesson'|'exercise'|'skill'|'unit'|'mission'|'card'|'assignment'|'class'|'function'…
  ref_id       uuid,
  class_id     uuid,                       -- denormalized for teacher rollups; NULL for consumer users
  latency_ms   integer,                    -- time-to-response for the interaction, when meaningful
  duration_ms  integer,                    -- active duration the event closes out, when meaningful
  modality     text CHECK (modality IN ('tap','type','speak','listen','read','write')),
  hint_count   smallint,
  is_correct   boolean,
  properties   jsonb NOT NULL DEFAULT '{}'::jsonb  -- enum/numeric fields ONLY (see privacy rules)
) PARTITION BY RANGE (occurred_at);
-- RLS: no client role has INSERT/UPDATE/DELETE. SELECT: owner; teacher via is_teacher_of_student
-- (copy the exact policy pattern of xp_events, 20260729171206_….sql:139-143); admin.
```

Write path: a `logEvents(events[])` helper in `supabase/functions/_shared/` used by every edge function; batched (one insert per request, not per event). Client-originated events (nav, session heartbeats) go through one new thin `track-events` edge function that **whitelists event names and strips unknown properties** — the client can never invent an event type, mirroring the server-authoritative stance of `submit-exercise` `[proposed]`. Emission is fire-and-forget: an event-insert failure must never fail the learner's action (log to Sentry instead).

Relationship to `xp_events`: `xp_events` **stays** as the economy ledger (it is well-shaped, wip-01a §3.3); `learning_events` is the behavioral superset. `awardXp` in `_shared/learnerProgress.ts` gains one `logEvents` call so every XP award also appears in the stream. `[proposed]`

### 2.3 Event taxonomy (closed list; additions require a schema-registry PR)

**Learner events** (`actor_role='learner'`):

| Event | Fired by (proposed) | Key fields beyond envelope |
|---|---|---|
| `session.start` / `session.end` | client heartbeat via `track-events` | `duration_ms` (end), platform coarse class in `properties.platform ∈ {desktop,mobile,tablet}` |
| `lesson.start` / `lesson.complete` / `lesson.abandon` | `learn-lesson` / `submit-exercise` / heartbeat timeout | `ref=lesson`, `properties.exercise_count, accuracy` |
| `exercise.attempt` | `submit-exercise` (exists as row in `exercise_attempts` — event mirrors it) | `is_correct, latency_ms(=response_ms), modality, hint_count, properties.difficulty, attempt_index, error_tag` |
| `exercise.hint` | new exercise engine (task #15 — dependency) | `hint_count`, `properties.hint_type` — **does not exist today; no hint UI exists** `[observed via wip-02 F2-1]` |
| `review.card` | `vocab-review` (mirrors `vocab_review_log`) | `is_correct(rating≥2), latency_ms, properties.rating, state, scheduled_days` |
| `mission.start` / `mission.step` / `mission.complete` | conversation-mission runtime (task #16 — dependency) | `properties.step_index, goal_met` |
| `conversation.turn` | `chat-with-tutor` + voice pipelines | `modality ∈ {type,speak}`, `latency_ms` (learner think-time), `duration_ms` (speech length), `properties.turn_index, word_count, provider_latency_ms` — **note: word_count and enum tags only, never the utterance text** |
| `conversation.end` | same | `duration_ms, properties.turn_count, ended_by ∈ {learner,limit,error}` |
| `speech.pronunciation_scored` | `analyze-pronunciation` | `properties.score_band` (banded, not raw), `latency_ms` |
| `assessment.placement_completed` / `assessment.attempt` | `grade-quiz`, `record-certification-attempt` | `properties.instrument, score_band` |
| `evidence.transcript_uploaded` / `evidence.analysis_completed` / `evidence.analysis_failed` | `analyze-transcript` | `properties.file_type, parse_ok` — restores the missing status trail (wip-12a §5) |
| `assignment.viewed` / `assignment.submitted` | assignment surfaces | `ref=assignment` |
| `nav.page` | client | `properties.route` (route pattern, **not** full URL — no params) |

**Teacher events** (`actor_role='teacher'`): `teacher.class_created`, `teacher.assignment_created` (`properties.kind ∈ {conversation,curriculum}`), `teacher.roster_changed` (`properties.op`), `teacher.report_viewed` (`properties.report`), `teacher.report_exported` (also writes `educational_data_access_audit` — §5.4), `teacher.intervention_ack` (flag acknowledged — closes the loop wip-01a F2.1 identifies as missing).

**System events** (`actor_role='system'`, `user_id` NULL or the affected user): `system.provider_call` (thin pointer; the full record lives in `provider_call_log`, §6.2), `system.quota_exhausted` (`properties.bucket` — today a learner hitting the 800/day ceiling is invisible, wip-01a §1.3), `system.gate_run` (gauntlet outcome pointer, §6.3), `system.job_run` (rollup/cron health), `system.rls_denied_report` (a teacher query returned zero rows where enrollment says students exist — the silent-empty-state detector for gaps like wip-12a §7.2).

### 2.4 Privacy rules (minor-safe, non-negotiable)

1. **No PII in any event.** No names, emails, free text, uploaded-file names, IPs, user agents, or precise geo. `user_id` is the only identifier; `properties` may contain **only enumerated strings and numbers** — enforced by the `track-events` whitelist and a CI check on the taxonomy registry. `[proposed]`
2. **No learner-generated language in the event stream.** Conversation/writing content stays in its own purpose tables with stricter RLS; events carry counts and bands only. (Prevents the event store from becoming a shadow transcript archive.) `[proposed]`
3. **No third-party analytics SDK in any client surface used by learners** (D1). Any future vendor tooling operates on aggregates or staff accounts only. `[proposed]`
4. **Deletion:** `ON DELETE CASCADE` from `auth.users` covers account deletion; rollups keep only aggregates with n≥5. Raw partitions dropped at 24 months `[proposed]`; retention numbers `[requires validation]` against district contract terms.
5. **k-anonymity ≥ 5** for any aggregate that crosses a class boundary (school/district/investor surfaces). A cohort smaller than 5 renders as "—". `[proposed]`
6. **Leaderboards default to class scope**, never global, for minor accounts — fixes wip-01a F6.6 at the policy level.
7. Events referencing a minor are subject to the same `is_minor`/`safety_mode` gating the overhaul introduces server-side (dependency on wip-01a P0 #5).

### 2.5 Rollups (nightly `pg_cron`, plus 15-min incremental for teacher dashboards)

`rollup_user_day` (user × day × activity_type: events, active_ms, attempts, correct, xp), `rollup_class_day` (class × day aggregates), `rollup_skill_user` (latest mastery snapshot + trend), `rollup_item_stats` (exercise × window: n, p-value, mean latency, discrimination — the psychometrics wip-01a F3.5 notes are missing), `rollup_provider_day` (§6.2), `rollup_gate_day` (§6.3). All rollup tables are RLS'd identically to their base grain. `pg_cron` availability on the hosted project `[requires validation]` (`supabase/config.toml` project `afswfqougbfiqbkchoqj`).

### 2.6 Acceptance criteria — Deliverable 1

- AC1.1: 100% of the flows in wip-02 §1–§5 emit their listed events; verified by an integration test that replays each flow and asserts the event sequence.
- AC1.2: A grep-able schema registry file exists; CI fails on any event name or property not in it.
- AC1.3: Zero client-writable analytics tables remain (`usage_tracking`, `api_calls_tracking`, `student_metrics` INSERT/UPDATE policies removed or tables replaced) — verified by RLS policy dump.
- AC1.4: Conversation and voice activity appear in the stream (closes wip-01a F3.1): for a scripted 10-turn tutor session, exactly 10 `conversation.turn` + 1 `conversation.end` events exist, none containing message text.
- AC1.5: p95 added latency from event emission on `submit-exercise` < 20 ms (batched insert) `[estimated target; requires validation under load]`.
- AC1.6: Dropping a 24-month-old partition is a runbook'd one-liner; rollups survive it.

---

## 3. Deliverable 2 — Metrics architecture

### 3.1 The seven-tier ladder (precise definitions)

Ordered by evidentiary strength. **Rule M-1: a metric may never be displayed with the name, framing, or visual treatment of a higher tier.** (This is the rule the current certificate page violates.)

| Tier | Metric | Definition & formula | Source (proposed) |
|---|---|---|---|
| 1. Engagement | DAU/WAU/MAU; sessions; **active minutes**; streak | Active minutes = Σ `duration_ms` of closed activity intervals (see 3.3), NOT wall-clock. Streak = `learner_streaks.current_streak` (System A only). | `rollup_user_day`, `learner_streaks` |
| 2. Completion | Lesson/unit/assignment completion | Lesson complete = `lesson_progress.status='completed'` (server-set on all-published-solved, `submit-exercise/index.ts:129-141` `[observed]`). Unit complete = all operational lessons complete. Assignment completion §5.2. | `lesson_progress` |
| 3. Accuracy | First-attempt accuracy; error-tag mix | FAA = first attempts correct ÷ first attempts, windowed 7/30d, per skill type. First attempt = earliest `exercise_attempts` row per (user, exercise). | `exercise_attempts` → `rollup_user_day` |
| 4. Mastery | Skill mastery; can-do coverage | Mastered = `skill_mastery.mastery ≥ 0.8 AND attempts ≥ 5` — matches the live unlock rule (`useLearningPath.ts:146-162` via wip-02 §2.1) so learner-facing and analytic definitions can't diverge. Can-do coverage = mastered skills mapped via `content_can_do_map` ÷ mapped skills. | `skill_mastery`, `content_can_do_map` |
| 5. Retention | Return retention (D1/D7/D30 cohort return rate) **and** knowledge retention (observed recall on due FSRS cards = rating≥2 ÷ due reviews, 30d) | Two different constructs; never conflate in one chart. | `rollup_user_day`, `vocab_review_log` |
| 6. Proficiency | **Working band** (A1-low…A2-high) with mandatory provenance label | Only from designated instruments: placement (`profiles.placement_cefr`, self-reported seed), in-app checkpoint assessments (task #14 schema), external evidence (`transcript_analyses`). Never derived from XP, streaks, completion %, or time. Formula per instrument owned by the assessment specialist; this doc owns the *display contract* (§4.3). | `profiles`, `certification_attempts`, `transcript_analyses` |
| 7. Certification | Reserved. **No product surface uses this word** until a proctored, form-equated, psychometrically documented instrument exists (see §4.2). | — | — |

**XP is deliberately absent from the ladder**: it is a motivational currency, reportable to learners only, and never appears on teacher/admin/investor analytic surfaces as evidence of anything. `[proposed]` (Rationale: dual-economy exploits, wip-01a F6.1, made XP unauditable historically; even post-fix it measures compliance, not learning.)

### 3.2 Surface entitlement matrix

| Metric tier | Learner | Teacher (own classes) | School/District admin | Investor/marketing |
|---|---|---|---|---|
| Engagement | ✅ (simplified: streak, minutes) | ✅ per student | ✅ aggregate, k≥5 | ✅ aggregate only |
| Completion | ✅ own | ✅ per student | ✅ aggregate | ✅ aggregate |
| Accuracy | ⚠️ softened wording ("7 of 8 right"), never percentages-as-grades — wip-02 §7 reading-level findings | ✅ per student + item stats | ✅ aggregate | ⚠️ aggregate, no cherry-picked cohorts without denominator |
| Mastery | ✅ own, in can-do words ("You can order food"), not "mastery 45%" (wip-02 §7.1 #4) | ✅ heatmap per student | ✅ aggregate coverage | ⚠️ aggregate |
| Retention | ❌ (not learner-meaningful) | ✅ class knowledge-retention | ✅ cohort return curves | ✅ cohort curves with cohort definition attached |
| Proficiency | ✅ own working band **with provenance label** | ✅ per student with provenance | ✅ distribution, k≥5 | ❌ **never** — no "our users reach B1" claims from in-product data (§4.1) |
| Certification | — | — | — | — |

### 3.3 Time accounting by activity type

Current state: the only time data is `usage_tracking.minutes_used`, client-written `[observed — §1]`, and `exercise_attempts.response_ms`. Proposed rules:

| Activity type | Timing method | Idle cutoff / cap |
|---|---|---|
| `core_lesson` | Sum of per-exercise `response_ms` (server-received, exists today) + inter-item gaps ≤30s | Cap any single item at 180s `[estimated]`; excess discarded as idle |
| `spaced_review` | Same, from `vocab_review_log` timestamps | Cap 60s/card |
| `guided_speaking` (pronunciation, missions) | Provider session duration (server-side, from the voice pipeline) | Provider-authoritative; no client claim |
| `open_conversation` (text tutor) | Per-turn: learner think-time (`latency_ms`) + composition, closed by `conversation.turn`; session closed by `conversation.end` | Gap >120s = idle |
| `open_conversation` (voice) | Realtime session wall-time from server session records | Hard-capped by quota already |
| `listening` / `writing` | Activity-interval events from the (future) exercise engine | Gap >60s / >300s respectively |
| `remediation` | Same as core_lesson, flagged by `activity_type='remediation'` when launched from an intervention/review path | — |
| `assessment` | Instrument-reported duration, server-side | — |

Invariants: (a) **all durations are computed or verified server-side** — client heartbeats can only *close* intervals, never extend them; (b) time-on-task is reported **by activity type, never as one blended number**, on teacher/district surfaces, because 30 min of open conversation and 30 min of drills are pedagogically different facts.

### 3.4 Acceptance criteria — Deliverable 2

- AC2.1: A single `metrics.md` registry defines every displayed metric with tier, formula, source, and entitled surfaces; every dashboard component references a registry key (enforced by code review checklist).
- AC2.2: Mastery threshold constant is defined once (DB function or shared constant) and imported by both `useLearningPath` and rollups — zero duplicated `0.8` literals (grep-verifiable).
- AC2.3: No learner surface renders the strings "mastery %", "CEFR", or "WIDA" raw (wip-02 §7.1); lint rule or i18n key audit passes.
- AC2.4: Time-on-task for a scripted session (10 min lesson + 5 min review + 8 min conversation) reproduces within ±10% per activity type, and idle time (tab abandoned 20 min) contributes 0.
- AC2.5: Investor-surface queries provably contain no tier-6 data: review of the aggregate views' SQL shows no join to proficiency sources.

---

## 4. Deliverable 3 — Proficiency-claims policy

### 4.1 What Palavox may and may not claim

**MAY claim, from in-product evidence** `[proposed]`:
- **Curriculum alignment:** "Palavox lessons are aligned to CEFR A1–A2 descriptors and WIDA can-do statements" — an editorial claim about *content*, supported by the authoring pipeline's per-unit `cefr_level`/`wida_level`/`can_do_statement` fields (`20260729164446_….sql:15-30` `[observed]`) and the gauntlet's level gate (wip-01a §4.1).
- **Demonstrated performance:** "Maria has demonstrated 14 of 22 A1 can-do statements in Palavox exercises" — countable, evidence-linked, reproducible from `skill_mastery` + `content_can_do_map`.
- **Progress deltas:** "accuracy on past-tense items rose from 40% → 85% over 6 weeks."
- **External-evidence relay with attribution:** "An uploaded score report (WIDA ACCESS, 2026-04) reports level 2.5" — relaying a document, labeled as such (wip-12a P6).

**MUST NEVER claim** `[proposed]`:
- A CEFR or ACTFL **level attainment** ("Maria is B1", "ACTFL Advanced Low") from any in-product evidence — and categorically never from XP, streaks, time, completion %, or a single LLM judgment.
- The words **"certified," "certificate," "certification," "fluent/fluency level"** on any output derived from AI scoring alone.
- Aggregate proficiency marketing claims ("students reach A2 in 3 months") without a validated external measure — this binds the investor surface (§3.2).
- Equivalence chains ("ACTFL Advanced Low = B2") as product copy; the current mapping at `fluencyCertification.ts:4-5` is asserted without source and crosswalks between the frameworks are contested `[documented: ACTFL–CEFR alignment is described by ACTFL itself as approximate, https://www.actfl.org/educator-resources/actfl-proficiency-guidelines — accessed 2026-07-30]`.

Rationale: ACTFL ratings are issued via certified raters/OPI-style instruments; CEFR levels via validated exams. A Gemini read of one transcript (wip-01a F5.1: no second rater, no rubric anchoring, no sample minimum, no verification) satisfies none of that, and the input document itself is user-supplied and spoofable (wip-12a §8.2c). District assessment coordinators will recognize this instantly; one bad demo question ends a procurement. `[assumption re: procurement dynamics]`

### 4.2 Treatment of the existing certificates — options

| | Option 1 — Gate (admin-only flag, keep code) | Option 2 — Rename in place ("Palavox Fluency Award") | Option 3 — Deprecate + replace with "Palavox Progress Record" (recommended) |
|---|---|---|---|
| Legal/trademark exposure | Removed from users, code still mints ACTFL strings | **Not removed** if ACTFL/CEFR levels still shown; rename alone keeps the invalid construct | Removed entirely |
| Learner impact | Feature silently vanishes | Keeps a misleading artifact | Replaces with something honest and *more* useful to families |
| District trust | Neutral | Negative on inspection | Positive differentiator ("we show evidence, not badges") |
| Effort | Hours | Days | ~1–2 weeks `[estimated]` |

**Recommendation: Option 3, staged.** `[proposed]`
- **Week 1 (with Option 1 as the interim):** feature-flag off `/certificate`, `fluencyCertification.ts` consumers, and cert notifications; remove ACTFL strings from the bundle. No data deleted — `transcript_analyses` rows are untouched (they are evidence, protected by wip-12a P1).
- **Replacement — "Palavox Progress Record":** a server-generated document (not client `html-to-image`, fixing F5.7) containing: demonstrated can-do statements with dates and evidence counts; time-on-task by activity; accuracy trends; working band **with provenance labels**; a server-issued verification code + `/verify/{code}` route backed by an `issued_records` table (id, user, snapshot hash, issued_at, revoked). Explicit footer: *"This record describes work completed in Palavox. It is not a language-proficiency certification."*
- **Never delete** existing learner-downloaded PNGs (can't) — but the verification route returns "no record" for them, which is the correct answer.
- The three inconsistent CEFR score mappings (F5.2) are handed to the assessment specialist to reconcile; this doc's constraint is only that **none of them may surface as a level claim** until reconciled and validated.

### 4.3 Provenance labeling (the display contract)

Every proficiency-ish number rendered anywhere carries a machine-readable provenance object, resolved to UI copy:

```ts
type Provenance = {
  source: 'self_reported'        // placement quiz, learner-entered
        | 'ai_estimate'          // LLM-scored conversation/writing/pronunciation
        | 'demonstrated'         // server-graded exercise/mastery evidence
        | 'external_document'    // uploaded transcript relay
        | 'teacher_judgment';    // future: teacher-entered rating
  instrument: string;            // 'placement_quiz_v2', 'transcript_upload', 'checkpoint_a1_mid'…
  observed_at: string;           // ISO date shown to users ("as of Apr 2026")
  confidence?: 'low'|'medium'|'high';  // instrument-defined; ai_estimate is never 'high'
};
```

Rules `[proposed]`: (1) UI components that display a band/level take `Provenance` as a **required prop** — a compile error, not a guideline; (2) `ai_estimate` values always render with a visible qualifier ("AI estimate") and never in the visual style of grades; (3) `useStudentProficiency.ts`'s current mislabeling of transcript data as `'certification'` (wip-12a §7.1) is migrated to `external_document`; (4) mixed-source displays (e.g., the working band) show the *weakest* contributing source's label.

### 4.4 Acceptance criteria — Deliverable 3

- AC3.1: `grep -ri "actfl" src/` returns only `can_do_statements` framework plumbing (NCSSFL-ACTFL can-do descriptors are legitimately licensed content for *alignment*, distinct from *rating claims* — `[requires validation]` license terms) and zero certificate/level-claim strings.
- AC3.2: `/certificate` route removed or redirected; `/verify/{code}` resolves server-issued Progress Records and returns "no record" for unknown codes; issuing writes an `issued_records` row.
- AC3.3: Every rendered level/band traces to a `Provenance` prop (TypeScript compile guarantee + snapshot test on the 6 surfaces listed in wip-12a §7.1).
- AC3.4: Copy audit: no learner/teacher/marketing surface contains "certified/certificate/fluency level" attached to AI-only evidence; sign-off checklist run against the route inventory of wip-02 Appendix A.
- AC3.5: The Progress Record footer disclaimer appears on every generated document (template test).

---

## 5. Deliverable 4 — Teacher & district reporting spec

### 5.1 Schema-reality check (what the reports can stand on today)

`[observed]` — verified this session:
- ✅ `lesson_progress`, `skill_mastery`, `exercise_attempts`, `xp_events`, `learner_streaks`, `vocab_*` all have teacher-of-student SELECT RLS (`20260729171206_….sql` throughout) — the access model for class reporting already exists.
- ✅ `can_do_statements` + `content_can_do_map` exist with WIDA support (`20260729164446_….sql:136-153`).
- ✅ `class_curriculum_assignments` exists with `unit_id|lesson_id`, `due_date`, WIDA/CEFR targets (`20260729175720_….sql:1-17`).
- ❌ **No curriculum-assignment submission/completion table** (wip-02 §4.4) — but completion is *derivable*: assigned lesson × enrolled student × `lesson_progress.status`. Progress-vs-plan needs no new instrumentation, only a view.
- ❌ `transcript_analyses` teacher RLS dead (wip-12a §6.2) — external-evidence columns blocked until the `is_teacher_of_student` policy is added (wip-12a improvement #3).
- ❌ `generate-teacher-report` ignores the new spine and has the unverified-`teacherId` hole (`generate-teacher-report/index.ts:18-38`) — rebuild on rollups, do not extend.
- ❌ Time-on-task source (`usage_tracking`) is client-writable — reports must wait for §3.3 server-side time accounting.

### 5.2 The five reports

All reports: class-scoped for teachers, aggregated (k≥5) for district admins; refreshed from rollups (15-min incremental for teacher dashboard tiles, nightly for district); **CSV export at launch, PDF later** `[proposed]`; every export logged (§5.4). Column-level spec lives with each rollup's SQL; the load-bearing query sketches:

**R1 — Progress vs plan.** Per assignment × student: status ∈ {not_started, in_progress, completed, completed_late}.
```sql
SELECT cca.id, se.student_id,
       CASE WHEN lp.status='completed' AND lp.completed_at<=cca.due_date THEN 'completed'
            WHEN lp.status='completed' THEN 'completed_late'
            WHEN lp.status IS NOT NULL THEN 'in_progress' ELSE 'not_started' END
FROM class_curriculum_assignments cca
JOIN student_enrollments se USING (class_id)
LEFT JOIN lessons l ON l.skill_id IN (SELECT id FROM skills WHERE unit_id=cca.unit_id) OR l.id=cca.lesson_id
LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=se.student_id;
```
(Unit-level assignments aggregate over the unit's operational lessons; the differentiation-targeting fields join in once wip-02 F4-1 is fixed.) Cadence: 15-min. `[proposed; query shape verified against schemas above]`

**R2 — Time-on-task by activity type.** Student × week × `activity_type` active minutes from `rollup_user_day`. Blocked on §3.3; interim version may show *lesson/review* time only (computable now from `response_ms`), explicitly labeled partial. Cadence: nightly.

**R3 — Mastery heatmap.** Students × skills (or × can-do statements) colored by `skill_mastery.mastery`, with attempts overlay to distinguish "low mastery" from "not yet practiced" — the exact computation `useClassCanDoMastery.ts` does client-side today `[observed]`, moved into `rollup_skill_user` so it costs one indexed read instead of N queries per teacher pageview. Cadence: 15-min.

**R4 — Intervention flags.** Server-computed nightly into a durable `intervention_flags` table (student, flag_type, opened_at, acknowledged_at) — replacing the client-synthesized, localStorage-read notifications (wip-01a F2.1–F2.3). Launch flag set `[proposed]`: `inactive_7d`; `accuracy_drop` (7d FAA ≥20 pts below the student's own 30d baseline, min 20 attempts); `stalled_lesson` (≥3 sessions on one lesson without completion); `review_backlog` (due cards >50); `assignment_overdue`. Thresholds `[estimated]` — tune against live distributions `[requires validation]`. Teacher acknowledgment emits `teacher.intervention_ack`.

**R5 — WIDA alignment view.** Per class: can-do coverage practiced vs demonstrated per WIDA level and domain, sourced from `can_do_statements(framework='WIDA')` × `content_can_do_map` × `skill_mastery`; plus the external-evidence column (latest uploaded WIDA ACCESS relay per student, `external_document`-labeled) once the transcript RLS fix lands. This is the district-facing differentiator wip-02 §9.5 says to preserve. Cadence: nightly.

### 5.3 Export formats & delivery

- **CSV** (one file per report, UTF-8, stable snake_case headers versioned `report_version` column) — imports cleanly into district SIS/spreadsheet workflows. `[proposed]`
- **PDF** deferred to a later milestone (needs the server-side doc generation built for the Progress Record anyway).
- **No scheduled email delivery at launch** — there is no email infrastructure (wip-01a §2.1); revisit when the notifications workstream lands a channel.
- District admins get school-level CSVs with k≥5 suppression; row-level student exports are teacher-only.

### 5.4 Audit

Every `teacher.report_exported` and district export writes one row to `educational_data_access_audit` (accessor, student set hash, report, timestamp) via a service-role helper — giving the currently writer-less table (wip-01a F3.4) its first real producer and making the `/compliance` Access Audit tab truthful. `[proposed]`

### 5.5 Acceptance criteria — Deliverable 4

- AC4.1: All five reports render for a seeded demo class (30 students, 2 assignments, 4 units) with correct values verified against hand-computed fixtures.
- AC4.2: Teacher dashboard report tiles issue ≤3 queries per render (vs. today's N+1 patterns, wip-02 §4.2), p95 < 500 ms on the seeded class `[estimated target]`.
- AC4.3: R1 statuses change within 15 min of a student completing an assigned lesson.
- AC4.4: Exported CSV for a class the teacher does *not* own is impossible (RLS test) — closes the `generate-teacher-report` hole.
- AC4.5: Every export produces exactly one audit row; the Compliance tab lists it.
- AC4.6: District views suppress any cell with n<5 (fixture test with a 4-student school).

---

## 6. Deliverable 5 — Product-team observability

### 6.1 Error telemetry

Options: **Sentry SaaS** (fastest, mature SDK for React + Deno edge functions; PII risk managed by scrubbing) vs **GlitchTip self-hosted** (data stays first-party; ops burden) vs **first-party table** (no new vendor; no grouping/alerting — rebuilding Sentry badly). **Recommendation: Sentry SaaS with strict scrubbing** `[proposed]`: `sendDefaultPii:false`, no user names/emails (pseudonymous `user_id` only), URL/query scrubbing, error events only (no session replay for learner surfaces — minors). Rationale: error events describing *our code's failures* are a materially different privacy category than behavioral analytics; the D1 first-party rule intentionally does not extend here, but the DPA addition must be disclosed in the district subprocessor list `[requires validation with whoever owns district contracts]`.
Scope: React error boundary (replacing the log-and-stop at `error-boundary.tsx:25-27`, wip-01a F8.1) with per-panel boundaries + error IDs shown to users; edge functions get a shared `captureError` wrapper with `request_id` correlation; the silent-swallow pattern in `serverWrites.ts:14-26` (wip-01a F8.2) reports before returning null.

### 6.2 Provider-cost dashboard

Current: `aiGateway.ts` sets `max_tokens` but **never reads the usage block from responses; no per-call cost record exists anywhere** `[observed — grep this session]`; `api_calls_tracking` is client-written and untrusted (§1). Proposed: `provider_call_log` (service-role-only) written inside `aiGateway.callGateway`, the TTS/STT functions, and realtime session close: `function, provider, model, tokens_in, tokens_out, audio_seconds, latency_ms, http_status, est_cost_usd, user_id, class_id, created_at`. `est_cost_usd` computed from a **single `model_pricing` table** (also fixing the scattered model-id problem, wip-01a F9.7); prices `[requires validation]` against the Lovable gateway's actual billing. Dashboard (admin-only): cost/day by function and model; **cost per active learner per day** (the unit-economics number, target `[estimated]` <$0.10/learner/day at current quotas — validate); anomaly alert at 3× trailing-7-day median; gateway error/fallback rates (single-vendor concentration risk, wip-01a F9.6, becomes a graph instead of a surprise).

### 6.3 Content-quality funnel (gauntlet)

The raw material already exists: every generated item persists `gate_results` jsonb (`author-content/index.ts:131-145`; `exercises.gate_results` at `20260729164446_….sql:98`) `[observed]`. Proposed: nightly `rollup_gate_day` unpacking `gate_results` → funnel views: generation → per-gate pass rate (input_budget, level, solver, pedagogy, bias, duplicate) → gated → human approve/reject → operational, sliced by exercise type, band, language, and `source_model`. Plus the **in-service quality loop** the gauntlet can't see: per-item p-value and discrimination from `rollup_item_stats` (§2.5), with an auto-flag list (p<0.2 or p>0.98, or negative discrimination, n≥30 `[estimated thresholds]`) feeding the authoring review queue — closing the loop from learner data back to content, which wip-01a F3.5 identifies as absent. Also directly measures the F4.5 throughput problem (approval yield per authoring run).

### 6.4 Experiment readiness

Honest scale note first: at early-district scale, per-student randomization detects only large effects (e.g., ~14K students/arm for +2pp on a 50% baseline at 80% power `[estimated]`; classroom-clustered designs need fewer units but more machinery). So: **build assignment + exposure plumbing now, run few, big experiments** `[proposed]`: `experiment_assignments` (user_id, experiment, variant, assigned_at, unit ∈ {user, class}) with deterministic hashing; exposure logged as a `learning_events` row; guardrail metrics (D7 return, lesson completion, error rate) pre-registered in the metrics registry; minors are **never** exposed to experiments that vary safety, quota, or assessment surfaces (policy line, `[proposed]`); a thin config-table feature-flag mechanism doubles as the kill switch (also serving D3's certificate gate).

### 6.5 Acceptance criteria — Deliverable 5

- AC5.1: A thrown error in any learner panel produces a Sentry event with `request_id`, route, and pseudonymous user — and zero name/email/content fields (verified by inspecting 10 sampled events).
- AC5.2: Every AI-touching edge function writes exactly one `provider_call_log` row per provider call, including failures; daily reconciliation query: Σ`est_cost_usd` within ±15% of the gateway invoice `[estimated tolerance; requires validation]`.
- AC5.3: Gauntlet funnel dashboard answers "what % of generated cloze items failed the solver gate last week, by model?" in one view.
- AC5.4: ≥1 flagged item from live psychometrics appears in the authoring review queue within 24h of crossing thresholds (seeded test data).
- AC5.5: A dummy experiment assigns deterministically (same user → same variant across sessions), logs exposures, and its readout query runs from rollups alone.

---

## 7. Dependencies

| Dependency | Direction | Why |
|---|---|---|
| wip-01a P0 #1–#2 (kill `award-xp`, `check-streak`; single XP economy) | **Blocks** all metrics (§3) | Until then `user_progression` numbers are forgeable (F6.1) |
| wip-01a P0 #4 (live-schema dump & reconciliation) | Blocks rollup DDL | Migrations vs types disagree (wip-01a §10); rollups must target the real schema `[requires validation]` |
| `pg_cron` availability on hosted project | Blocks §2.5, §5, §6.3 | No scheduler exists today; also needed by quota resets (F1.1) `[requires validation]` |
| Exercise-engine & mission-runtime plans (frozen tasks #15/#16) | Shapes `exercise.hint`, `mission.*`, modality values | Taxonomy reserves the names; fields ship with those engines |
| Assessment specialist (wip-12a owner + CEFR-mapping reconciliation) | Owns tier-6 instruments | This doc owns display/claims contract only |
| Notifications workstream | R4 flags → out-of-app delivery | Flags table is designed to be its producer |
| Transcript RLS fix (wip-12a improvement #3) | Blocks R5 external-evidence column | Teacher reads return zero rows today |
| District contract/DPA owner | Sentry subprocessor listing; retention windows | §6.1, §2.4.4 `[requires validation]` |

## 8. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Rollup queries degrade prod DB | Medium | Rollups read raw partitions off-peak; dashboards read rollups only (D1 guardrail); revisit ClickHouse at 10M events/day |
| Event taxonomy sprawls into a junk drawer | High (default outcome) | Closed registry + CI gate (AC1.2); additions require named owner + metric consumer |
| Certificate removal upsets existing users | Low–Medium | Progress Record ships in the same release as the flag-off; comms copy explains "more evidence, fewer badges"; old PNGs unaffected |
| Provenance labels ignored by future UI work | Medium | Required-prop type contract (AC3.3), not a style guide |
| Time-on-task gamed by idle tabs | Medium | Server-verified intervals, idle cutoffs, caps (§3.3); XP never tied to time |
| Sentry scrubbing misconfigured → minor PII at vendor | Low | `sendDefaultPii:false` in code review checklist + AC5.1 sampled audit; GlitchTip self-host as fallback plan |
| k≥5 suppression makes small-school district views empty | Medium | Expected and correct; document it in the district onboarding guide rather than weakening the threshold |
| Cost-log pricing table drifts from gateway invoice | Medium | AC5.2 monthly reconciliation; alert on >15% drift |

---

*End of wip-03a. Companion synthesis (doc 00–04 series) should lift §0's D1–D6 as the analytics plank of the overhaul plan.*

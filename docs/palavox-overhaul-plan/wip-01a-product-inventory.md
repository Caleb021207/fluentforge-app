# WIP-01A — Product Inventory: Monetization, Notifications, Analytics, Authoring, Certification, Gamification, Compliance, Resilience, Edge Functions

**Scope:** product areas *not* covered by the PDF/transcript-assessment, voice/realtime, localization, data/RLS/security, or learner+teacher-journey specialists.
**Repo:** `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`.
**Method:** static read of `src/`, `supabase/functions/`, `supabase/migrations/`, `supabase/config.toml`. No code was run, no DB was touched.

**Evidence labels:** `[observed]` = read directly in the repo · `[inferred]` = deduced from observed code · `[estimated]` = my rough numeric judgement · `[requires validation]` = needs a live DB / runtime check before it can be relied on.

**Critical caveat that colors this whole document:** the migration history and the generated types disagree about the live schema in several places (see §1.4 and §10). Several claims below are therefore marked `[requires validation]` against the actual project database (`afswfqougbfiqbkchoqj`, `supabase/config.toml:1`).

---

## 0. Executive summary

Palavox has two products fused into one codebase, built at different times against different assumptions:

1. **A newer, well-engineered curriculum spine** (`courses > units > skills > lessons > exercises`, FSRS vocabulary, server-authoritative grading in `submit-exercise`, an AI authoring gauntlet with 6 independent gates). This layer is genuinely good: answer keys never reach the browser, XP is only awarded for real progress, content cannot reach a learner without human approval. **This is the part worth preserving.**
2. **An older, client-trusting layer** (`user_progression`/`award-xp`, `check-streak`, `student_usage_limits`, certification pages, `fluencyCertification`, localStorage-based "safety modes"). Much of this is either exploitable, broken against the current schema, or asserts claims (certification, COPPA/CIPA compliance) that the underlying evidence does not support.

The overhaul's central product decision is which of the two layers each feature belongs to. Today many features straddle both — there are **two XP systems, two streak systems, two level formulas, and two content-seeding paths**, all live simultaneously.

---

## 1. Subscriptions, tiers, and monetization

### 1.1 What exists

| Element | Location | Status |
|---|---|---|
| `account_tier` enum (`standard`, `premium`) | `supabase/migrations/20251102044050_007855ae-d09e-43e5-9f98-44e69a97ba43.sql:2` | `[observed]` |
| `profiles.account_tier`, default `'premium'` | same file, `:6`, `:9` | `[observed]` |
| Tier granted by **access code metadata** | same file, `:67-70` — `code_record.metadata->>'account_tier'`, defaulting to `premium` | `[observed]` |
| Tier → quota mapping | `supabase/migrations/20251102044432_a83b2413-b9a5-4ec6-8bde-aeb0ab7cf4fd.sql:21-31` | `[observed]` |
| Published pricing | `src/pages/Legal.tsx:190-208` | `[observed]` |
| Billing/payment code | **none anywhere** | `[observed]` |

**There is no billing system.** A repo-wide grep for `stripe`, `paddle`, `checkout`, `payment` returns only vocabulary flashcard content, translation strings, and prose in `src/pages/Legal.tsx` `[observed]`. Monetization is entirely offline: a district is invoiced, an admin issues access codes, and `process_access_code` stamps a tier onto the profile (`20251102044050…sql:67-163`) `[observed]`. That is a defensible model for K-12 — but it means *nothing in the product enforces payment*, and there is no self-serve path at all.

### 1.2 Quota model (the real "tier" mechanism)

Two **entirely separate** quota systems run in parallel:

**System A — `student_usage_limits` (monthly/semester business quotas).**
Standard: 360K TTS tokens, 150K text-practice tokens, 120 min Whisper STT, **0** min realtime voice. Premium: 540K / 300K / 180 min / 15 min (`20251102044432…sql:22-31`) `[observed]`. Read by `src/hooks/useUsageLimits.ts:69-151`; enforced at the point of use in `supabase/functions/text-to-speech/index.ts:67-83` and `supabase/functions/transcribe-audio/index.ts:40-52` `[observed]`.

**System B — `usage_counters` + `consume_rate_limit` (per-user *daily* abuse ceilings).**
`supabase/functions/_shared/authGuard.ts:24-91` and `supabase/migrations/20260729061713_…sql:111-147` `[observed]`. These are anti-abuse limits, not product tiers — they are **identical for standard and premium users** and are hardcoded per function:

| Bucket | Daily limit | Bucket | Daily limit |
|---|---|---|---|
| `submit-exercise` | 800 | `vocab-review` | 800 |
| `text-to-speech` | 400 | `learn-lesson` | 400 |
| `chat-with-tutor` | 300 | `transcribe-audio` | 300 |
| `analyze-pronunciation` | 300 | `custom-realtime-conversation` | 300 |
| `generate-pronunciation-phrase` | 200 | `analyze-conversation-quality` | 100 |
| `analyze-speaking` / `grade-writing` / `grade-assignment` / `analyze-progress` / `generate-study-recommendations` / `generate-personalized-flashcards` | 50 | `author-content` | 40 |
| `generate-teacher-report` / `premium-voice-realtime` | 30 | `analyze-transcript` | 20 |

`[observed]` — collected from the `guardPaidRequest(...)` call in each function.

The guard **fails closed** on RPC error (503, `authGuard.ts:60-69`) and returns 429 with `"Daily limit reached for this feature. Try again tomorrow."` on exhaustion (`:71-79`) `[observed]`. Failing closed is the right call for paid endpoints — a strength.

### 1.3 What happens at limit exhaustion

- **TTS:** server returns `{ limitReached: true }` and the client is expected to fall back to browser speech synthesis; the user gets a destructive toast (`src/components/usage/UsageLimitAlert.tsx:31-38`, `supabase/functions/text-to-speech/index.ts:73-83`) `[observed]`. `src/pages/Legal.tsx:183` promises exactly this ("automatically falls back to free in-browser speech options") — the only monetization claim in Legal.tsx that the code actually backs up.
- **Text messages:** `track-usage` returns HTTP 429 with `reason: "limit_reached"` (`supabase/functions/track-usage/index.ts:61-81`) `[observed]`.
- **Certification attempts:** 3/semester, hard block with a toast (`src/hooks/useUsageLimits.ts:309-343`, `track-usage/index.ts:83-102`) `[observed]`.
- **Daily bucket:** blunt 429; **no UI anywhere translates this into a learner-legible message** — `serverWrites.ts:14-26` swallows every failure into `console.error` and returns `null` `[observed]`. A student who hits `submit-exercise`'s 800/day ceiling sees a generic "Could not submit your answer" (`src/hooks/useLessonRunner.ts:97`) `[observed]`.

### 1.4 Findings

**F1.1 — Monthly quotas appear never to reset. `[observed]` + `[requires validation]`**
`reset_monthly_usage()` and `reset_semester_usage()` exist (`20250729055113-…sql:225-266`) but a repo-wide grep finds **zero callers** in `src/`, `supabase/functions/`, or any migration, and there is **no `pg_cron` schedule anywhere** in `supabase/migrations/` `[observed]`. Both functions also update columns (`current_month`, `current_semester`, `last_reset_month`) that **do not exist** in the consolidated baseline table definition (`20260211195248_…sql:144-163`) nor in the generated types (`src/integrations/supabase/types.ts:1980-1999`) `[observed]`.
*Consequence:* a student who exhausts their monthly TTS/STT/text budget is locked out for the remainder of the license, permanently degraded to browser TTS/STT. *Concerns:* district/school (a class silently loses AI features in November), scalability, monetization credibility.

**F1.2 — Tier-based quota provisioning is broken in two independent ways. `[observed]` + `[requires validation]`**
`src/hooks/useUsageLimits.ts:82-85` calls `supabase.rpc('initialize_student_usage_limits_with_tier', …)` from the browser. (a) `20260729062707_…sql:12` revoked `authenticated` EXECUTE on that function — so the call should fail with permission denied. (b) The function body inserts `academic_year` and uses `ON CONFLICT (student_id, academic_year)` (`20251102044432…sql:33-49`), but the live table has neither the column nor that constraint (`types.ts:1980-1999`, baseline `:144-163` where `student_id` is plain `UNIQUE`). *Consequence:* new students likely never get a tier-differentiated limits row; `usageLimits` stays `null`, so `UsageLimitAlert` never fires and `useUsageLimits.ts:67` silently treats everyone as `'premium'`. The tier distinction that the pricing page sells may be inert in practice.

**F1.3 — The privilege-revocation migration silently skips signature mismatches. `[observed]`**
`20260729062707_…sql:11-12` lists `'initialize_student_usage_limits_with_tier(uuid,text)'`, but the function's second parameter is the `account_tier` **enum**, not `text` (`20251102044432…sql:4`). The `DO` block catches `undefined_function` and only `RAISE NOTICE`s (`:29-30`) `[observed]`, so that REVOKE almost certainly never applied. *Consequence:* if the function is still `PUBLIC`-executable and the schema is ever repaired, a student could call it with `'premium'` to self-upgrade their own quotas. `[inferred]` `[requires validation]` *Concerns:* security/privacy, monetization integrity. The broader lesson is that this lockdown pattern gives no signal when it fails.

**F1.4 — Academic-year keying is calendar-based, not academic. `[observed]`**
`can_start_voice_session` derives the year key as `EXTRACT(YEAR FROM NOW()) || '-' || (YEAR+1)` (`20250729055113-…sql:242-243`), so the key flips on **1 January**, mid-school-year. `Legal.tsx:186` sells "Student access runs August–May". *Concern:* district/school — quotas would reset in January rather than at the license boundary, on any deployment where these columns do exist.

**F1.5 — Pricing claims do not match the code. `[observed]`**
`Legal.tsx:191, 200` advertises **$70 / $100 per student per academic year**; the access-code seed metadata says **"$2.57/student/month"** and **"$4.02/student/month"** (`20251102044050_…sql:15, 18`) — i.e. $30.84/$48.24 annualized. `Legal.tsx:193, 202` names **"GPT-4o-mini + Azure TTS"** and **"GPT-4o Realtime"**, while the code actually calls `google/gemini-2.5-flash` via the Lovable AI gateway (`supabase/functions/chat-with-tutor/index.ts:14-15`), Azure Speech TTS (`text-to-speech/index.ts:87-110`), `gpt-realtime-2025-08-28` (`premium-voice-realtime/index.ts:122`), and — notably — **Gemini, not Whisper, for "Whisper STT"** (`transcribe-audio/index.ts:73`) `[observed]`. *Concerns:* district procurement risk; a quota column literally named `whisper_stt_minutes_*` that bills for a non-Whisper model is the kind of thing a district counsel notices.

**F1.6 — `usage_counters` grows without bound. `[observed]`**
One row per (user, bucket, day), 20 buckets, no TTL, no cleanup job (`20260729061713_…sql:111-121`) `[observed]`. At 10,000 students touching 5 buckets/day × 180 school days that is ~9M rows/year `[estimated]`. *Concern:* scalability, maintenance.

### 1.5 Strengths to preserve
- `guardPaidRequest` is a clean, single-choke-point primitive for cost control on every paid endpoint, and it fails closed `[observed]`.
- Quota counters are service-role-only; students cannot raise their own limits (`20260729061713_…sql:385-392`, `authGuard.ts` doc comment) `[observed]`.
- Routing tier through access codes (rather than credit cards) matches how districts actually buy.

---

## 2. Notifications

### 2.1 What exists

**Teacher notifications** — `src/hooks/useTeacherNotifications.ts` synthesizes three notification types **on the client, on every poll**, from raw queries `[observed]`:
- `new_submission` — last 10 completed `assignment_submissions` (`:49-77`)
- `student_inactive` — `student_metrics.last_activity` older than 7 days (`:88-118`)
- `assignment_due` — assignments due in the next 3 days (`:124-141`)

Polling is `refetchInterval: 60000` (`:151`) `[observed]`.

**Read state** — `src/components/teacher/dashboard/NotificationDropdown.tsx:31, 40-71` stores read IDs in **localStorage** under `teacher_read_notifications` `[observed]`.

**Toasts** — 63 files import `useToast`/`toast` `[observed]`; there are two toast systems in use (`@/hooks/use-toast` shadcn and `sonner`, e.g. `src/pages/Certificate.tsx:10`) `[observed]`.

**Email / push / SMS / in-app persistence: none.** No Resend/SendGrid/SMTP/FCM/APNs/web-push integration anywhere in `supabase/functions/` or `src/`; no `notifications` table in the 77 tables in `types.ts` `[observed]`.

### 2.2 Findings

**F2.1 — Notifications are derived, not events. `[observed]`** There is no notification record, so nothing is durable, nothing can be delivered out-of-app, and nothing can be audited. A submission that arrives and is superseded is simply never surfaced. *Concerns:* pedagogy (teachers miss struggling students), district use.

**F2.2 — Read state is per-browser. `[observed]`** `NotificationDropdown.tsx:31` — a teacher who marks 20 notifications read on a laptop sees all 20 unread on the classroom desktop. localStorage is also commonly wiped by district device management `[inferred]`.

**F2.3 — Polling cost scales with roster size. `[observed]` `[estimated]`** Each 60s tick issues ~6 queries whose result sets scale with classes × assignments × students (`useTeacherNotifications.ts:27-141`). A teacher with 5 classes × 30 students has an ~150-row `student_metrics` scan every minute per open tab; 500 teachers ≈ 3,000 queries/min `[estimated]`. *Concern:* scalability.

**F2.4 — There is no learner-facing notification channel at all. `[observed]`** No "your assignment is due", no streak-save reminder, no teacher-feedback ping. For a product whose retention model is streaks (§6), the absence of any re-engagement channel is a structural gap. *Concerns:* pedagogy, product.

**F2.5 — Two toast libraries. `[observed]`** shadcn `Toaster` mounted at `src/App.tsx:123` plus `sonner` used in pages. Inconsistent styling/stacking and double the a11y surface. *Concern:* maintenance.

---

## 3. Analytics & telemetry

### 3.1 What is captured today

**No third-party analytics or error reporting exists** — no PostHog, Mixpanel, Amplitude, GA, Segment, or Sentry in `package.json`, `index.html`, or `src/` `[observed]`. All telemetry is first-party Postgres.

| Table | Written by | Grain | Evidence |
|---|---|---|---|
| `exercise_attempts` | `submit-exercise` | per item attempt, incl. `response_ms`, `difficulty`, `is_correct` | `submit-exercise/index.ts:86-95` |
| `lesson_progress` | `submit-exercise` | per (user, lesson): attempts/correct/accuracy/status | `:154-168` |
| `skill_mastery` | `submit-exercise` | per (user, skill): mastery, ability, 10-item window | `:108-120` |
| `xp_events` | `_shared/learnerProgress.ts` | per XP award, with `source`/`ref_type`/`ref_id` | `learnerProgress.ts:184-191` |
| `vocab_review_log`, `vocab_card_state` | `vocab-review` | FSRS review grain | `20260729171206_…sql:73-124` |
| `usage_tracking`, `api_calls_tracking` | `track-usage` | session minutes / API token spend | `track-usage/index.ts:44-113` |
| `student_language_metrics`, `student_metrics` | `record-certification-attempt` | rubric scores; aggregate | `record-certification-attempt/index.ts:109-121` |
| `transcript_analyses` | transcript flow (other specialist's scope) | per uploaded transcript | `src/hooks/useProgressData.ts:24` |
| `educational_data_access_audit` | `log_transcript_access` only | FERPA access log | `20251208034729_…sql:75-100` |

`[observed]` throughout.

### 3.2 Findings

**F3.1 — `xp_events` is the only true event stream, and half the product doesn't write to it. `[observed]`** `award-xp` (the legacy path, used by chat, voice, pronunciation, transcript analysis — §6) writes **only** to `user_progression` and never inserts an `xp_events` row (`supabase/functions/award-xp/index.ts:56-97`). So the event log is silently missing every conversational and voice activity. *Concerns:* analytics integrity, pedagogy (you cannot answer "does speaking practice move mastery?").

**F3.2 — No product analytics whatsoever. `[observed]`** Nothing records page views, feature adoption, funnel drop-off, time-to-first-lesson, session length, or abandonment. The only "who used what" signal is `usage_tracking` minutes, which exists for billing, not learning. *Concerns:* the overhaul has no baseline to measure itself against `[inferred]`.

**F3.3 — No error telemetry. `[observed]`** `src/components/ui/error-boundary.tsx:25-27` logs to `console.error` and stops. Every edge function likewise `console.error`s into Supabase logs with no aggregation, alerting, or user/session correlation. A crash in a classroom is invisible to the team. *Concerns:* maintenance, district trust.

**F3.4 — The FERPA audit trail is decorative. `[observed]`** `educational_data_access_audit` has exactly one writer, `log_transcript_access()` (`20251208034729_…sql:75-100`), and **no caller** in `src/` or `supabase/functions/` `[observed]`. Meanwhile `src/utils/safety/ferpaCompliance.ts:29-40` "logs" access to `console.log`, and `chat-with-tutor/complianceUtils.ts:49-52` does the same with a comment saying "in a production environment this would write to a database". `src/pages/Compliance.tsx` renders an "Access Audit" tab over an effectively empty table (`DataAccessAuditLog.tsx:43`). *Concerns:* security/privacy, district use — this is a compliance claim with no evidence behind it.

**F3.5 — Missing learning-analytics primitives.** For a learning product I would expect and do **not** find `[observed]` absence: error-type taxonomy on wrong answers (only `is_correct` + `selected_option_id`), item-level psychometrics (p-value, discrimination) despite `exercise_attempts` having the data to compute them, time-on-task per lesson, hint/scaffold usage, per-can-do-statement coverage rollups, cohort/class-level aggregation views, and any retention/forgetting-curve view outside the vocabulary FSRS deck. *Concerns:* pedagogy, district reporting.

### 3.3 Strengths
- `exercise_attempts` records `response_ms` and `difficulty` per attempt (`submit-exercise/index.ts:93-94`) — enough raw material to build real item analysis later `[observed]`.
- `xp_events` carries `source`, `ref_type`, `ref_id`, `metadata` (`20260729171206_…sql:126-135`) — a sound event shape.
- Teacher RLS on `xp_events`/`learner_streaks` via `is_teacher_of_student` (`:139-143`, `:164-168`) is already the right access model for class analytics.

---

## 4. Content management & authoring

### 4.1 The pipeline that exists

**`/author` (admin-only)** → `src/pages/Author.tsx`, wrapped in `<ProtectedRoute requireRole="admin">` (`:321`) `[observed]`. Admin picks a lesson from the curriculum tree, chooses one of 9 exercise types and a count of 1–8, and runs the gauntlet (`:45-66`, `:16-19`).

**`author-content` edge function** → `supabase/functions/author-content/index.ts` `[observed]`:
1. `guardPaidRequest(…, "author-content", 40)` (`:40`), then an explicit `has_role(admin)` check (`:46-47`).
2. Loads the full pedagogical context — lesson → skill → unit, pulling `cefr_level`, `wida_level`, `can_do_statement`, `key_language_use`, `content_objective`, `language_objective`, `target_grammar_point` (`:63-92`).
3. Loads up to 300 vocabulary lemmas as the known-word baseline (`:74-79`).
4. Generates with `google/gemini-3.6-flash` (`_shared/contentGauntlet.ts:12`).
5. Runs every item through the gauntlet, then inserts with `status: passedAll ? "gated" : "draft"` and the full `gate_results` blob (`:131-145`).

**The gauntlet** (`supabase/functions/_shared/contentGauntlet.ts`) `[observed]` — six gates:

| Gate | Method | Pass rule | Line |
|---|---|---|---|
| `input_budget` | code: comprehensible-input ratio vs known vocab, with stop-word/instruction-word/proper-noun/morphology discounting | ≤30% unknown content words; **waived for flashcards** | `:290-310`, `:366-368` |
| `level` | Flesch–Kincaid **plus** an independent LLM CEFR classifier | FK ≤ band ceiling (only applied at ≥30 words) **and** classified band ≤ target | `:92-119` |
| `solver` | a **different vendor's** model (`openai/gpt-5.4-mini`) solves the item cold | must match the key **and** flag no second defensible option | `:123-149` |
| `pedagogy` | rubric judge on coherence/alignment/distractors/single-point | total ≥15/20 **and** every sub-score ≥3 | `:152-181` |
| `bias` | cultural-sensitivity screen for US middle school | `safe === true` and zero concerns | `:184-198` |
| `duplicate` | embedding cosine vs same-skill siblings | max similarity < 0.92 | `:201-230` |

**Status lifecycle** — `draft → gated → operational → retired`, enforced by a CHECK constraint on all six content tables (`20260729164446_…sql:11, 28, 41, 52, 81, 98`) and by RLS that only exposes `status = 'operational'` to non-admins (`:188-217`) `[observed]`. `preferOperational()` (`_shared/learnerProgress.ts:226-231`) lets the runtime fall back to `gated` content when a lesson has no approved items yet.

**`seed-curriculum`** — one-shot seeder that builds the starter English A1–B1 tree and runs the same gauntlet, with a `resume` mode that tops up 1–3 lessons per invocation to stay inside the request budget (`supabase/functions/seed-curriculum/index.ts:60-90`) `[observed]`.

### 4.2 Findings

**F4.1 — This is the strongest thing in the codebase. `[observed]`** A generate → measure → cross-vendor-verify → human-approve pipeline where nothing auto-publishes, every rejection reason is persisted in `gate_results`, and the reviewer sees the funnel is *better* than what most ed-tech ships. Its design assumptions are also documented in-code (`contentGauntlet.ts:3-10`, `:361-365`). **Preserve this wholesale.**

**F4.2 — `gated` content still reaches learners. `[observed]`** `preferOperational` (`learnerProgress.ts:228-230`) serves `gated` items when no `operational` sibling exists, and `submit-exercise/index.ts:59-61` accepts attempts on both. So "nothing reaches a learner without human approval" — stated at `author-content/index.ts:17-19` — is **not** actually true; the fallback is a deliberate but undocumented product decision. *Concerns:* pedagogy, district trust. Needs an explicit policy: is `gated` a pilot-only state?

**F4.3 — Editing an item does not re-run its gates. `[observed]`** `src/hooks/useCurriculum.ts:156-160` (`updatePrompt`) writes `prompt` directly via the client with **no** `gate_results` invalidation and no status downgrade. `Author.tsx:298-306` lets an admin then click Approve. So a human edit can carry a stale "passed all gates" badge into `operational`. *Concerns:* pedagogy, content integrity.

**F4.4 — There is no versioning, no provenance beyond `source_model`, and no rollback. `[observed]`** `exercises` has `source_model` (`author-content/index.ts:140`) but no `created_by`, no revision history, no "who approved this and when". Retiring is a status flip with no audit row. *Concerns:* district use (curriculum committees expect adoption records), maintenance.

**F4.5 — Authoring throughput is structurally low. `[observed]` `[estimated]`** Max 8 items per run (`author-content/index.ts:53`), 40 runs/day/admin (`:40`), and each item costs 1 author call + 4 judge/solver calls + 1 embedding + N sibling embeddings (`:100-104`, `contentGauntlet.ts:371-386`) — the sibling loop alone re-embeds up to 20 prompts **on every run**, uncached. Ceiling ≈ 320 items/admin/day *before* the gauntlet's rejection rate `[estimated]`. Building a multi-band, multi-language curriculum at this rate is a schedule risk. *Concerns:* scalability, cost.

**F4.6 — Two conflicting seeders; one is dead. `[observed]`** `seed-course-data` writes `courses(name, cefr_min, cefr_max)` and `units(idx, cefr_target)` (`supabase/functions/seed-course-data/index.ts:22-45`), but the live schema is `courses(title, level_band, …)` / `units(position, cefr_level, …)` (`20260729164446_…sql:3-30`). It will fail on the first insert. It also performs **no auth check whatsoever** in its function body — it relies solely on gateway `verify_jwt = true` (`supabase/config.toml`), which any holder of the public anon key satisfies `[inferred]` `[requires validation]`. *Concerns:* security, maintenance. Delete it.

**F4.7 — `seed-curriculum` runs with `verify_jwt = false`. `[observed]`** `supabase/config.toml` sets it false; the function then accepts **either** an `x-seed-token` header matching `SEED_TOKEN` **or** an admin JWT (`seed-curriculum/index.ts:44-56`). That is a deliberate, documented operator escape hatch and it is implemented correctly — but it is the only unauthenticated-at-the-gateway entry point in the system, and it writes content. *Concern:* security/privacy; worth a rotation policy and an explicit note in the ops runbook.

**F4.8 — No import/export, no teacher authoring. `[observed]`** There is no CSV/QTI/Common Cartridge path, no way for a district to bring its own curriculum, and no teacher-level content creation — `/author` is admin-only (`Author.tsx:321`). *Concern:* district use; this is a frequent procurement requirement.

---

## 5. Certificates & certifications

### 5.1 What is claimed vs what backs it

| Claim | Made by | Evidence behind it |
|---|---|---|
| "**Professionally Fluent** — ACTFL Advanced Low (B2)" | `src/utils/fluencyCertification.ts:144, 153` | the **single most recent** transcript analysis having `cefr_level ∈ {B2,C1,C2}` **or** `overall_score ≥ 76` (`:40-50`, `:118-138`) |
| "**Functionally Fluent** — ACTFL Intermediate Mid (B1)" | `:145, 154` | same, `B1` or score ≥ 66 |
| Downloadable PNG certificate with the learner's name and a date | `src/pages/Certificate.tsx:79-94` | client-side `html-to-image` render; filename `Palavox-Certificate-{name}-{level}-Fluency.png` (`:88`) |
| CEFR level from the reading quiz | `supabase/functions/grade-quiz/index.ts:14-28` | % correct on a fixed bank, thresholds 95/88/78/65/50 |
| CEFR score from writing | `supabase/functions/grade-writing/index.ts:50` | one Gemini call, "84-100% C2, 67-83% C1, …" in the system prompt |

`[observed]` throughout.

### 5.2 Findings

**F5.1 — The fluency certificate is an unvalidated claim on a single LLM judgement. `[observed]`** `getCurrentFluencyCertStatus` reads `analyses[0]` — one transcript analysis — and issues an ACTFL-named credential (`fluencyCertification.ts:129-137`). There is no second rater, no rubric anchoring, no sample-length minimum, no proctoring, no expiry, and no verification page (`/certificate` renders purely from the learner's own rows, `Certificate.tsx:37-52`). Naming it "ACTFL Advanced Low" attaches a real, externally-owned credential scale to it. *Concerns:* pedagogy (construct validity), district use, and plausible **legal/trademark exposure** `[inferred]` — ACTFL ratings normally require certified raters.

**F5.2 — CEFR thresholds are three different, mutually inconsistent mappings. `[observed]`**
- `grade-quiz`: C2 ≥ 95, C1 ≥ 88, B2 ≥ 78, B1 ≥ 65, A2 ≥ 50 (`grade-quiz/index.ts:14-21`)
- `grade-writing` prompt: C2 84-100, C1 67-83, B2 50-66, B1 33-49, A2 17-32 (`grade-writing/index.ts:50`)
- `fluencyCertification`: professional ≥ 76, functional ≥ 66 (`:40-50`)
A B2 needs 78% on reading, 50% on writing, and 76% on transcript analysis. *Concern:* assessment coherence; whichever specialist owns assessment should reconcile these, but the certificate layer is where they become a public claim.

**F5.3 — The reading bank is tiny and static. `[observed]`** 45 questions total (`src/components/certifications/data/readingQuestions.ts`), with the server key holding 20 A1 items and only 5 per band for A2–C2 (`_shared/quizAnswerKey.ts`, counted). With a 3-attempts-per-semester allowance (`track-usage/index.ts:91`) and a fixed bank, memorization across attempts is trivial; there is no form-equating and no item rotation. *Concerns:* pedagogy, security of the assessment.

**F5.4 — `grade-writing` degrades to a silent fabricated score. `[observed]`** On JSON-parse failure it returns `{ score: 60, feedback: content }` (`grade-writing/index.ts:70`) — a passing-ish B2-adjacent score invented by an error path, indistinguishable from a real grade downstream. *Concern:* assessment integrity.

**F5.5 — The reading/writing certification pages are language-inverted and probably wrong for the actual audience. `[observed]`** `ReadingCertification.tsx:15-25` and `WritingCertification.tsx:12-17`: if the UI language is English the learner is shown a **Spanish** test; otherwise an **English** test. For an ESL product serving multilingual US middle-schoolers whose UI language is their L1, this happens to work — but it is decided by UI-language string equality, not by the learner's target language, and it hard-codes a two-language world into a 41-language product. *Concerns:* pedagogy, localization coupling.

**F5.6 — `verify-certification-code` and `record-certification-usage` are unauthenticated orphans. `[observed]`** Neither has any auth check in its body (`verify-certification-code/index.ts:12-47`, `record-certification-usage/index.ts:5-33`), neither is listed in `supabase/config.toml` (so gateway `verify_jwt` defaults on, which the public anon key satisfies `[inferred]`), neither is rate-limited, and **neither is invoked anywhere in `src/`** `[observed]`. `verify-certification-code` is a code-validity oracle over `access_codes` — usable to brute-force valid district codes; `record-certification-usage` decrements code uses. *Concerns:* security/privacy, maintenance. Delete or lock down.

**F5.7 — Certificate identity is unverified end to end. `[observed]`** `Certificate.tsx:151` renders `profile.display_name || profile.email`, both self-editable, into a downloadable image with no code, no QR, no server-issued record, and no `/verify` route (`src/App.tsx:66-118` has none). Any recipient of the PNG has no way to check it. *Concern:* district use — a credential nobody can verify is not a credential.

### 5.3 Strengths
- Scores are genuinely server-authoritative: `grade-quiz` keeps the answer key in `_shared/quizAnswerKey.ts` which never enters the client bundle (`:9-11`), and `record-certification-attempt` clamps scores 0-100, validates cert types and CEFR levels, and enforces row ownership with `.eq("user_id", userId)` (`:14-18`, `:47-56`, `:77`) `[observed]`. A student cannot fabricate a grade — a real improvement over the pre-`overhaul` state.

---

## 6. Gamification

### 6.1 Two complete, parallel, incompatible economies

| | **System A (new, server-authoritative)** | **System B (legacy, client-driven)** |
|---|---|---|
| Award path | `_shared/learnerProgress.ts:175-218` (`awardXp`) called only from `submit-exercise`/`vocab-review` | `supabase/functions/award-xp/index.ts`, called from `src/hooks/useGamification.ts:138` |
| XP values | `exercise_first_correct: 5`, `lesson_complete: 20`, `skill_mastered: 30`, `vocab_review: 3`, `vocab_review_lapse: 1` (`learnerProgress.ts:166-172`) | `lesson: 50`, `certification: 200`, `voice: 30 + 10/min`, `premium_voice: 40 + 12/min`, `realtime_ai: 45 + 15/min`, `exam_analysis: 100 + 1.5×score`, `conversation_analysis: 50 + up to 70` (`_shared/levelSystem.ts:61-152`) |
| Level formula | `floor(totalXp / 500) + 1` (`learnerProgress.ts:200`) | `100 × level^1.5` (`_shared/levelSystem.ts:10-20`) |
| Event log | writes `xp_events` (`:184-191`) | **does not** |
| Streak | `learner_streaks` via `touchStreak` (`:89-162`) | `user_progression.current_streak` via `check-streak` |

Both write `user_progression.total_xp` (`learnerProgress.ts:202-215`, `award-xp/index.ts:92-96`) `[observed]`.

### 6.2 Findings

**F6.1 — `award-xp` is directly exploitable. `[observed]` — highest-severity finding in this report.**
`award-xp/index.ts:50-51` reads `{ source, metadata }` straight from the request body and computes `getXPReward(source, metadata)` from **client-supplied** values. It has **no** `guardPaidRequest`, so no daily ceiling (`:1-49`). A student with a valid JWT can POST:

```
{ "source": "certification",
  "metadata": { "certificationScores": { "reading":100,"writing":100,"speaking":100,"listening":100 },
                "difficulty": "advanced" } }
```

`getXPReward` computes `200 + floor(100 × 2) = 400`, then the `advanced` multiplier ×1.5 → **600 XP per request**, unbounded, in a loop (`_shared/levelSystem.ts:69-79`, `:161-164`). `award-xp` also increments `certifications_completed` for `source === 'certification'` (`:88-90`) — so the exploit inflates a *teacher-visible completion counter*, not just a number. And `PremiumVoicePractice.tsx:205, 245` shows the legitimate flow already calls `awardXP('realtime_ai')` / `awardXP('premium_voice')` from the client with no server corroboration. *Concerns:* security, pedagogy (leaderboards become meaningless), district use (teachers make instructional decisions on this data).

**F6.2 — `check-streak` is almost certainly dead, and dangerous in shape. `[observed]` `[requires validation]`**
- It parses the JWT **without verifying the signature** — `getUserIdFromAuthHeader` base64-decodes the payload and trusts `sub` (`check-streak/index.ts:6-22`). Gateway `verify_jwt` is the only thing stopping forgery, and `check-streak` has **no entry in `supabase/config.toml`** `[observed]`.
- It then writes `user_progression` with an **anon-key** client (`:44-52`), but the security pass dropped all INSERT/UPDATE policies on that table, leaving SELECT only (`20260729061713_…sql:429-438`). Those writes should now fail → the function 500s → `useGamification.ts:107-109` swallows it.
*Consequence:* the streak-bonus XP path (up to 100 XP/day, `check-streak/index.ts:122`) is silently broken, while `useGamification.ts:42` still calls it on **every mount of every page that uses the hook**. *Concerns:* correctness, wasted invocations, maintenance.

**F6.3 — Three streak numbers can disagree on one screen. `[observed]`** `src/components/learner/StudentHomePanel.tsx:32-38` reads **both** `user_progression.current_streak_days` and `learner_streaks.current_streak`, preferring the latter (`:59`); `StudentXPDashboard.tsx:86` and `LeaderboardSection.tsx:232-307` read only `current_streak_days`; `get-leaderboard-data/index.ts:164` **sorts** the streak leaderboard by `current_streak_days`. Since only `submit-exercise`/`vocab-review` advance `learner_streaks` and `check-streak` (broken) advances `current_streak_days`, the leaderboard ranks by a field almost nothing writes. *Concerns:* pedagogy (streaks only motivate if they are true), UX trust.

**F6.4 — The two level curves diverge fast. `[observed]`** At 5,000 XP: System A says level 11 (`5000/500 + 1`); System B says level 13 (`100×13^1.5 = 4,687 ≤ 5000 < 100×14^1.5 = 5,238`). `src/utils/levelSystem.ts` and `supabase/functions/_shared/levelSystem.ts` are also **near-duplicates with different field names** (`xpToNextLevel`/`progressPercent` vs `xpProgress`/`progressPercentage`) `[observed]`. `award-xp` writes `current_level` from formula B while `awardXp` writes both `level` and `current_level` from formula A (`learnerProgress.ts:205`) — so the same column is overwritten by two formulas depending on which action the learner last performed. *Concerns:* correctness, maintenance.

**F6.5 — System A's economy is coherent and hard to game; keep it. `[observed]`** XP is awarded only for first-time-correct, first lesson completion, and first skill mastery (`submit-exercise/index.ts:173-196`) — repeat taps earn nothing. Streaks advance **only when XP was actually earned** (`:200`), which is the correct design (`learnerProgress.ts:84-88` documents the intent). Streak freezes (2/month, absorbing a one-day gap, `:139-145`) are a well-understood retention mechanic implemented carefully. This is the model the whole product should converge on.

**F6.6 — Leaderboard privacy and scope. `[observed]`** `get-leaderboard-data` correctly reads through `profile_public_data` rather than `profiles` (`:91-94`, `:185-188`), de-duplicates (`:97`, `:135`), and filters out teachers (`:210`). But `scope: 'global'` applies **no user filter at all** (`:156-158`) — a default global XP ranking across every school in the deployment. For minors in a district product this is a policy decision that should be explicit and probably default to class scope. *Concerns:* security/privacy, district use, pedagogy (cross-school ranking demotivates newcomers).

**F6.7 — Challenge Mode has no distinct reward. `[observed]`** `src/pages/ChallengeMode.tsx` is an assignment-scoped chat runner (`:55-70`); XP flows through the generic chat path. There is no challenge-specific economy, leaderboard, or completion badge. *Concern:* the feature name promises more than it delivers.

---

## 7. Compliance & safety: claimed vs actual

### 7.1 Age gate — the one part that is real

`verify-age` decides minority **server-side** from the submitted birth year, sets `is_minor`/`safety_mode`/`parental_consent_granted`/`age_verified_at` with the service role, and returns **403** for under-13 without consent (`supabase/functions/verify-age/index.ts:50-79`) `[observed]`. `AgeGate.tsx:6-11` documents that dismissing the dialog in the browser cannot grant adult status. This is correctly built.

### 7.2 Findings

**F7.1 — A 403 from `verify-age` blocks nothing. `[observed]`** The under-13-without-consent branch writes `safety_mode = 'strict'` and returns 403 (`verify-age/index.ts:60-78`), and `submitAgeVerification` maps that to `{ allowed: false }` (`src/utils/serverWrites.ts:138-147`). But **no route, no edge function, and no RLS policy reads `safety_mode` or `is_minor`** — a grep for `safety_mode` outside `types.ts`, translations, and the localStorage utilities returns only `verify-age` itself and `serverWrites.ts` `[observed]`. The child keeps full access to chat, voice, and the leaderboard. *Concerns:* COPPA exposure, district use. This is the single largest gap between claim and behavior.

**F7.2 — "Safety mode" and "parental controls" are localStorage. `[observed]`** `src/utils/safety/safetyModes.ts:8-17` reads/writes `localStorage["safetyMode"]`; `parentalControls.ts:19-23, 36-46` gates writes behind `localStorage["parentalControlsLocked"]`. A minor bypasses every one of these with devtools or a different browser, and none of it syncs with the server-side `profiles.safety_mode`. *Concerns:* security/privacy, district use, truthfulness of `src/pages/SafetyPolicy.tsx`.

**F7.3 — The content filter is a substring blocklist that harms the actual users. `[observed]`** `src/utils/safety/contentFilter.ts:7-35` and the server twin `chat-with-tutor/complianceUtils.ts:5-24` blocklist ~90 English terms including `"adult"`, `"private"`, `"personal"`, `"address"`, `"phone"`, `"depression"`, `"suicide"`, `"identity"`, `"dating"`, `"fight"`, `"blood"`. For an ESL curriculum this censors legitimate teaching vocabulary (giving your address, talking about phones, a story with a fight). The Spanish false-positive workaround (`contentFilter.ts:63-70`) **returns `false` for the entire message** if it contains any of six Spanish words — i.e. a message containing "alguna" bypasses filtering completely. And the server-side `filterCipaProhibitedContent`/`containsProhibitedContent` are **defined but never called** anywhere in `supabase/functions/` `[observed]`. Blocklisting `"suicide"` and `"self-harm"` also means a child in crisis is silently censored rather than routed to help — there is **no crisis-escalation path anywhere in the product** `[observed]`. *Concerns:* pedagogy, safety, district use.

**F7.4 — CIPA/FERPA instructions never reach the model. `[observed]`** `getCipaFerpaInstructions()` (`complianceUtils.ts:55-63`) is exported and never imported; the tutor's actual system message (`chat-with-tutor/index.ts:359-379`) contains no safety, no age-appropriateness, and no PII-avoidance instruction. Prompt-injection detection is `console.warn`-only and does not block (`:186-195`). *Concerns:* safety, district use.

**F7.5 — `/compliance` and `/safety-policy` are unprotected routes. `[observed]`** `src/App.tsx:114-116` mounts them with no `ProtectedRoute` wrapper (contrast `/author` at `:115` → `Author.tsx:321`). The underlying tables are admin-RLS'd (`20260729061713_…sql:454-460`), so a non-admin sees empty panels rather than data — but a compliance console that renders for anyone is a bad look in a demo. *Concerns:* security/privacy, district use.

**F7.6 — No data-subject workflows behind the UI. `[observed]`** `DataExportManager.tsx:22-37` reads/writes a `data_export_requests` table with no fulfilment worker anywhere; `DataBreachForm.tsx:41` writes `data_breach_notifications` with no notification pipeline (see §2 — there is no email system). *Concerns:* district use, legal.

### 7.3 Strengths
- Server-side age determination with a privileged-column trigger blocking client writes (`verify-age/index.ts:5-10` documents `protect_profile_privileged_columns`) `[observed]`.
- `AgeGate` re-checks on every auth state change (`AgeGate.tsx:30-33`).

---

## 8. Error handling, degraded/offline behavior, mobile

### 8.1 Findings

**F8.1 — One error boundary for the entire app. `[observed]`** `src/App.tsx:64-121` wraps all routes in a single `ErrorBoundary`; a crash in any panel replaces the whole page with "Something went wrong" and offers reload/home (`error-boundary.tsx:39-58`). No per-panel isolation, no error id, no report action, nothing sent anywhere (`:25-27`). The copy is deliberately simple English for ESL readers (`:15-17`) — a genuinely thoughtful touch worth keeping.

**F8.2 — Client failures are swallowed by design. `[observed]`** `src/utils/serverWrites.ts:14-26` catches every edge-function error, `console.error`s, and returns `null`. Callers such as `useUsageLimits.trackVoiceSession` (`:191-196`) never learn the write failed. Usage minutes can therefore be lost silently — a billing-integrity problem, not just a UX one. *Concerns:* monetization, maintenance.

**F8.3 — There is no offline story. `[observed]`** No service worker, no manifest, no PWA plugin in `vite.config.ts`, nothing in `public/` (`favicon.ico`, `lovable-uploads`, `og-image.png`, `placeholder.svg` only). `useConnectionStatus` exists (`src/hooks/useConnectionStatus.ts`) and is consumed by exactly **two** components (`ConnectionStatusIndicator.tsx`, `AuthenticatedAccuracy.tsx`) `[observed]`. Nothing queues an exercise submission for retry; `useLessonRunner.ts:93-98` surfaces a flat "Could not submit your answer" and drops the attempt. *Concerns:* district use — school wifi is unreliable and 1:1 Chromebooks go offline on the bus. For a drill-based product, offline lesson caching is a natural fit and is completely absent.

**F8.4 — The dead-endpoint fallback chain. `[observed]`** `PremiumVoicePractice.tsx:251-300` has three tiers of usage-tracking fallback. Tier 1 (`useUsageLimits.trackPremiumVoiceSession`, `:373-378`) inserts into `usage_tracking` **directly from the browser**, which the security pass now denies (no INSERT policy, `20260729061713_…sql:418-427`) — so tier 1 always fails `[inferred]`. Tier 3 uses `navigator.sendBeacon` with **no Authorization header** (`:285-289`) against a function that requires one (`track-premium-voice-session/index.ts:15-21`) — so tier 3 always 401s `[inferred]`. Only tier 2 works. Separately, `useVoiceConversation.ts:70` beacons to `/functions/v1/track-session-end`, **a function that does not exist** in `supabase/functions/` `[observed]`.

**F8.5 — Mobile posture is thin. `[observed]`** The viewport meta is present (`index.html:6`) and Tailwind responsive classes are used, but `useIsMobile` is consumed in only **2** files repo-wide, and `NewLayout.tsx` has just 5 responsive breakpoint usages, one of which simply hides the search box below `md` (`:129`) `[observed]`. There is no mobile navigation drawer in the layout, no touch-target audit, and no evidence of testing at 375px. For middle-schoolers, phone is a primary device `[inferred]`. *Concerns:* pedagogy (access equity), district use.

**F8.6 — Loading states are inconsistent.** At least three patterns coexist: `PageLoader` (`App.tsx:46-56`), `AnimatedLoader` (`XPRewards.tsx:19`), and bespoke spinner divs (`Certificate.tsx:104-111`) `[observed]`. Minor, but symptomatic. *Concern:* maintenance.

**F8.7 — Refetch-by-timeout. `[observed]`** `src/pages/Certificates.tsx:30-33` calls `refetch()` at 0ms, 500ms, 1500ms, and 3000ms after a test completes, hoping the write has landed. That is a race condition papered over with sleeps. *Concern:* correctness.

---

## 9. Edge-function inventory (all 37)

Legend — **Guard:** `gPR(bucket,N)` = `guardPaidRequest` with daily limit N · `rU` = `requireUser` · `svc` = service role only, own ad-hoc check · `none` = no in-body auth. **JWT:** value in `supabase/config.toml` (`—` = no entry, gateway default applies). **Client:** invoked from `src/`?

| # | Function | Purpose | Guard | JWT | Provider / model | Client |
|---|---|---|---|---|---|---|
| 1 | `analyze-conversation-quality` | rates a chat transcript's quality | `gPR(…,100)` | true | Lovable gateway | ✅ 1 |
| 2 | `analyze-progress` | narrative progress summary | `gPR(…,50)` | true | Lovable gateway | ❌ **orphan** |
| 3 | `analyze-pronunciation` | scores a pronunciation attempt | `gPR(…,300)` | true | Lovable gateway | ✅ 1 |
| 4 | `analyze-speaking` | speaking-sample analysis | `gPR(…,50)` | true | Lovable gateway | ✅ 1 |
| 5 | `analyze-transcript` | CEFR analysis of an uploaded transcript | `gPR(…,20)` | true | Lovable gateway | ✅ 1 |
| 6 | `author-content` | AI authoring + 6-gate gauntlet | `gPR(…,40)` + `has_role(admin)` | true | `gemini-3.6-flash` / `gpt-5.4-mini` / `gemini-2.5-flash` / `gemini-embedding-001` | ✅ 1 (`Author.tsx:50`) |
| 7 | `award-xp` | **legacy** XP award | **none beyond JWT decode** | true | — | ✅ 1 (`useGamification.ts:138`) |
| 8 | `bulk-create-students` | teacher creates student accounts in bulk | svc + `getClaims` + class-ownership check | true | — | ✅ 1 |
| 9 | `chat-with-tutor` | the core tutor conversation | `gPR(…,300)` | true | `google/gemini-2.5-flash` (+`-lite` fallback) | ✅ **9** |
| 10 | `check-streak` | **legacy** daily streak | **unverified JWT parse** (`:6-22`) | **—** | — | ✅ 1 (`useGamification.ts:89`) |
| 11 | `class-roster` | teacher roster add/lookup by email | `rU` + `is_teacher_of_class` | true | — | ✅ 1 |
| 12 | `cleanup-voice-sessions` | closes orphaned voice sessions | svc | **—** | — | ✅ 1 |
| 13 | `custom-realtime-conversation` | Azure-Speech realtime conversation | `gPR(…,300)` | true | **Azure Speech** (`AZURE_SPEECH_KEY`) | ✅ 1 |
| 14 | `generate-personalized-flashcards` | **stub** — returns "feature removed" (23 lines) | `gPR(…,50)` | true | — | ❌ **orphan** |
| 15 | `generate-pronunciation-phrase` | makes a target phrase to practice | `gPR(…,200)` | true | Lovable gateway | ✅ 1 |
| 16 | `generate-study-recommendations` | study suggestions | `gPR(…,50)` | true | Lovable gateway | ❌ **orphan** |
| 17 | `generate-teacher-report` | class/student narrative report | `gPR(…,30)` | true | Lovable gateway (via helper) | ✅ 1 |
| 18 | `get-leaderboard-data` | XP/streak/lesson leaderboard | svc for authn, then **anon-key client for RLS** | **—** | — | ✅ 1 |
| 19 | `grade-assignment` | grades an assignment submission | `gPR(…,50)` | true | Lovable gateway | ✅ 1 |
| 20 | `grade-quiz` | server-side reading/placement grading | `rU` | true | — | ✅ 1 (`serverWrites.ts:65`) |
| 21 | `grade-writing` | CEFR-scores an essay | `gPR(…,50)` | true | `google/gemini-2.5-flash` | ✅ 1 |
| 22 | `health-check` | gateway connectivity probe | **none** | **—** | Lovable gateway | ❌ **orphan** |
| 23 | `initialize-student-progression` | creates a `user_progression` row | svc | **—** | — | ❌ **orphan** |
| 24 | `learn-lesson` | serves a lesson, strips answer keys | `gPR(…,400)` | true | — | ✅ 1 (`useLessonRunner.ts:63`) |
| 25 | `premium-voice-realtime` | mints an OpenAI realtime session | `gPR(…,30)` | true | **`api.openai.com/v1/realtime/sessions`**, `gpt-realtime-2025-08-28` | ✅ 1 |
| 26 | `record-certification-attempt` | writes attempts/transcripts/metrics | `rU` + ownership | true | — | ✅ 1 (`serverWrites.ts`) |
| 27 | `record-certification-usage` | decrements an access code's uses | **none** | **—** | — | ❌ **orphan** |
| 28 | `seed-course-data` | **stale** seeder (wrong schema) | **none** | true | — | ❌ **orphan** |
| 29 | `seed-curriculum` | starter-curriculum seeder + gauntlet | `SEED_TOKEN` **or** `rU`+admin | **false** | same models as #6 | ❌ operator-only |
| 30 | `submit-exercise` | authoritative grading + mastery + XP | `gPR(…,800)` | true | — | ✅ 1 (`useLessonRunner.ts:93`) |
| 31 | `text-to-speech` | TTS with per-user token quota | `gPR(…,400)` | true | **Azure Speech** neural voices | ✅ **4** |
| 32 | `track-premium-voice-session` | records premium voice minutes | svc + `auth.getUser` | **—** | — | ✅ raw `fetch` ×2 |
| 33 | `track-usage` | usage/quota writer | `rU` | true | — | ✅ 1 (`serverWrites.ts`) |
| 34 | `transcribe-audio` | STT (billed as "Whisper") | `gPR(…,300)` | true | Lovable gateway, **`google/gemini-2.5-flash`** | ✅ 2 |
| 35 | `verify-age` | COPPA age gate | `rU` | true | — | ✅ 1 (`serverWrites.ts`) |
| 36 | `verify-certification-code` | access-code validity oracle | **none** | **—** | — | ❌ **orphan** |
| 37 | `vocab-review` | FSRS queue + grading | `gPR(…,800)` | true | — | ✅ 2 |

`[observed]` for every row (guards from each `index.ts`; JWT from `supabase/config.toml`; client usage from `grep -rn "functions.invoke"` and string-literal search across `src/`).

### 9.1 Findings

**F9.1 — 8 orphans (22% of the surface).** `analyze-progress`, `generate-personalized-flashcards` (a 23-line "feature removed" stub that still burns a quota unit at `:10`), `generate-study-recommendations`, `health-check`, `initialize-student-progression`, `record-certification-usage`, `seed-course-data`, `verify-certification-code` `[observed]`. Each is a deployed, callable HTTP endpoint. *Concerns:* security (attack surface), maintenance, cost.

**F9.2 — 8 functions have no `supabase/config.toml` entry.** `check-streak`, `cleanup-voice-sessions`, `get-leaderboard-data`, `health-check`, `initialize-student-progression`, `record-certification-usage`, `track-premium-voice-session`, `verify-certification-code` `[observed]`. Supabase's default is `verify_jwt = true`, but that is satisfied by the **public anon key**, which is not a user identity `[inferred]` `[requires validation]`. The three that do **no** in-body auth (`health-check`, `record-certification-usage`, `verify-certification-code`) are therefore effectively public.

**F9.3 — One dangling client call.** `useVoiceConversation.ts:70` beacons `/functions/v1/track-session-end`; no such function exists `[observed]`.

**F9.4 — Three different auth idioms.** `guardPaidRequest`/`requireUser` (the good one, `_shared/authGuard.ts`), `auth.getUser(token)` inline (`award-xp:41`, `get-leaderboard-data:41`), and raw base64 JWT parsing (`check-streak:6-22`) `[observed]`. *Concern:* maintenance; the third is unsound.

**F9.5 — Copy-paste debris.** Every function checks `req.method === 'OPTIONS'` **twice** (e.g. `award-xp/index.ts:9` and `:11`; same in ~15 others) `[observed]`. Harmless, but a reliable marker of untended code.

**F9.6 — Provider concentration.** 11 functions route through the **Lovable AI gateway** (`_shared/aiGateway.ts:6`, `https://ai.gateway.lovable.dev/v1`), which is a single vendor, single key (`LOVABLE_API_KEY`), single point of failure for tutoring, grading, authoring, and transcription `[observed]`. Only `premium-voice-realtime` talks to OpenAI directly and only `text-to-speech`/`custom-realtime-conversation` to Azure. *Concerns:* scalability, vendor risk, district procurement (a gateway reseller in the data path is a DPA question).

**F9.7 — Model pinning is inconsistent and partly futuristic.** `contentGauntlet.ts:12-15` pins `google/gemini-3.6-flash`, `openai/gpt-5.4-mini`, `google/gemini-2.5-flash`; `aiGateway.ts:42` special-cases `openai/gpt-5.6`. These identifiers should be validated against what the gateway actually serves `[requires validation]`. There is no central model registry — model ids are scattered across 6+ files `[observed]`. *Concern:* maintenance.

---

## 10. Cross-cutting: the schema-drift problem

Several findings above share one root cause, so it is worth naming separately.

The migration directory contains a consolidated baseline (`20260211195248_…`) that **redefines tables from scratch** without the columns earlier migrations added, and later migrations (`20260729061713`, `20260729062707`) that reference functions whose signatures no longer match `[observed]`. Concretely:

- `student_usage_limits` in the baseline (`:144-163`) has no `academic_year`, `current_month`, `current_semester`, `last_reset_month`, and `student_id` is plain `UNIQUE` — yet `initialize_student_usage_limits_with_tier`, `can_start_voice_session`, and `reset_monthly_usage` all depend on those columns `[observed]`.
- `time_restrictions` is created in `20250729055113-…sql:39`, referenced by `can_start_voice_session` (`:270-280`), **absent from the baseline** (0 occurrences) and **absent from the generated types** `[observed]`.
- `courses`/`units` were redefined by `20260729164446_…` in a shape incompatible with `seed-course-data` `[observed]`.

*Consequence:* the true runtime behavior of the quota system cannot be determined from the repo alone. **Before any monetization or quota work in the overhaul, dump the live schema and reconcile.** `[requires validation]` *Concerns:* maintenance, scalability, monetization correctness.

---

## 11. Consolidated strengths worth preserving

1. **The authoring gauntlet** (`_shared/contentGauntlet.ts`) — cross-vendor solver verification, rubric judging, comprehensible-input budgeting with real morphology/stop-word handling, embedding dedupe, persisted rejection reasons, human-in-the-loop publishing.
2. **Server-authoritative grading and progression** (`submit-exercise`, `_shared/learnerProgress.ts`, `grade-quiz`) — answer keys never leave the server, mastery/XP/streak are all service-role writes, RLS grants students SELECT only.
3. **`guardPaidRequest`** — one primitive, applied to 20 endpoints, fails closed.
4. **The four-state content lifecycle** with RLS enforcement (`draft/gated/operational/retired`).
5. **Server-side COPPA determination** in `verify-age`.
6. **Leaderboard PII hygiene** — reads `profile_public_data`, not `profiles`.
7. **`class-roster`'s narrow service-role escape hatch** — a documented, checked reason for privilege elevation.
8. **In-code design commentary** — most of the newer files explain *why*, which made this audit possible at all.

---

## 12. Prioritized recommendations for the overhaul plan

**P0 — correctness/security, do before anything else**
1. Delete or fully gate `award-xp`; migrate every caller to server-corroborated awards through `_shared/learnerProgress.ts` (F6.1).
2. Delete `check-streak`; make `learner_streaks` the single streak (F6.2, F6.3).
3. Delete the 8 orphan functions, especially `verify-certification-code`, `record-certification-usage`, `seed-course-data`, `health-check` (F9.1, F5.6, F4.6).
4. Dump the live schema and reconcile the migration history before touching quotas (§10).
5. Make `safety_mode`/`is_minor` actually gate features, server-side (F7.1).

**P1 — product integrity**
6. Pick one XP economy, one level formula, one `xp_events` writer (F6.4, F3.1).
7. Fix or explicitly design monthly quota reset; add a scheduled job (F1.1).
8. Decide whether "certification" is a real credential. If yes: item banks, rater agreement, verification codes, expiry. If no: rename it (F5.1–F5.7).
9. Replace the substring content filter with a model-based classifier plus a crisis-escalation path (F7.3).

**P2 — platform**
10. Introduce a durable `notifications` table + one delivery channel (F2.1, F2.4).
11. Add error telemetry and product analytics before the overhaul ships, so it can be measured (F3.2, F3.3).
12. Design the offline/degraded story for 1:1 Chromebooks and phones (F8.3, F8.5).
13. Give authoring versioning, provenance, gate re-validation on edit, and an import path (F4.3, F4.4, F4.8).
14. Reconcile `Legal.tsx` pricing and provider claims with reality before the next district conversation (F1.5).

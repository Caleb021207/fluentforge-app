# 12 — Existing PDF Assessment Workflow: Preservation + Improvement Plan

Author: Existing PDF Assessment Workflow Preservation Specialist (design half)
Repo: `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`
Input read: `docs/palavox-overhaul-plan/wip-12a-assessment-current-state.md` (invariants P1–P8, improvements 1–12); `wip-15a-data-security-current-state.md` (tenancy gaps G1–G4)
Status: PLANNING ONLY — no implementation in this doc's scope.

Labels: `[observed]` verified in repo · `[documented]` external source w/ URL+date · `[estimated]` · `[proposed]` design decision of this doc · `[assumption]` · `[requires validation]`.

**Prime directive (owner):** the externally-produced PDF/score-report upload → server AI extraction → structured results on the learner profile → learner/teacher/institution visibility flow is PROTECTED. It is evidence ingestion, not a test. Nothing in the overhaul may replace it with in-app testing; course performance may *supplement* but never *overwrite or impersonate* it.

---

## 0. Decision headlines

| # | Decision | Recommendation |
|---|---|---|
| D1 | PDF support | **Native multimodal PDF input to the model** (server reads bytes from storage, sends PDF directly to Gemini); fallback = server-side PDF→image. Ship "stop advertising PDF" hotfix first. |
| D2 | UI/DB contract | **Keep narrow table + JSONB; one shared, schema-validated unpacking mapper** used by every reader; re-add a small set of first-class columns (`file_name`, `storage_path`, `status`, `content_hash`, `schema_version`, `model`). Do NOT re-widen to per-field columns. |
| D3 | Teacher/district visibility | **RLS via hardened `is_teacher_of_student`**, gated on doc 15's enrollment-integrity fix (G1). District rollups via a service-role endpoint with explicit tenancy checks — not broad RLS. |
| D4 | Lifecycle | Row created at request start; `uploaded → processing → complete | failed | invalid | duplicate`; client idempotency key + server content-hash duplicate short-circuit; bounded retry. |
| D5 | Output validation | Gateway JSON mode + zod schema; invalid output **quarantined** (`status='invalid'`), never persisted as a real analysis. Quota consumed only after input validation. |
| D6 | Model | Extraction moves to **`google/gemini-2.5-flash`** behind a config knob, pending a golden-set accuracy eval vs. 2.5 Pro; model id must be configuration because the 2.5 family has a published retirement horizon. |
| D7 | Boundary | A read-side **Proficiency Evidence presentation model** with mandatory provenance labels keeps uploaded assessment, placement, course mastery, conversation performance, and certificates distinct everywhere they are shown. |

---

## 1. Preservation invariants as testable contracts

### 1.0 Prerequisite: test infrastructure exists at all

`[observed]` The repo has **no test runner** — `package.json` has no vitest/jest/playwright entries and no `test` script; there is no `supabase/tests/` directory. Characterization tests therefore require a one-time setup task:

- **T0 (effort M):** add `vitest` for TS unit/contract tests; add SQL policy tests (pgTAP via `supabase test db`, or a small Deno test harness hitting a local `supabase start` stack with per-role JWTs); add one CI job. `[proposed]`

### 1.1 Contract test suite (write BEFORE any change)

Two kinds, kept in separate suites so the distinction is mechanical:

- **CHAR-x** — characterization: passes against today's code; any overhaul PR that breaks it is rejected.
- **ACC-x** — acceptance: encodes the *intended* contract where today's behavior is broken; expected to fail now and pass after the mapped fix (§2). Marked `test.fails` until then.

| ID | Invariant | Test (concrete) | Kind |
|---|---|---|---|
| C1.1 | P1 flow exists | E2E (local stack): authed learner uploads a valid JPEG → object exists at `transcripts/{uid}/...`, `analyze-transcript` returns 200, one row appears in `transcript_analyses` with that `user_id`, `/analysis` renders score + CEFR. | CHAR |
| C1.2 | P1 not gated by quiz | Static + E2E: upload path (`TranscriptUpload.tsx` → `analyze-transcript`) has zero references to placement quiz state; a user with no `profiles.placement_cefr` can complete an upload. | CHAR |
| C2.1 | P2 minimum fields | Inserted row has non-null `user_id`, `upload_date`, `analysis_data` containing `strengths/weaknesses/recommendations/detailed_feedback`; `overall_score` ∈ [0,100]. Clamp test: mock model returning `overall_score: 150` → stored `100` (`analyze-transcript/index.ts:97-99` `[observed]`). | CHAR |
| C2.2 | P2 reader parity | Every field the UI `Analysis` type consumes is produced by the shared mapper from a fixture row — i.e., no consumer reads a column that doesn't exist. Fails today (§6.3 break). | ACC → F2 |
| C3.1 | P3 server-only writes | With a learner JWT (not service role): INSERT/UPDATE/DELETE on `transcript_analyses` are all denied by RLS (policy state per `20260729061713:410-417` `[observed]`). | CHAR |
| C4.1 | P4 owner read | Learner JWT SELECT returns own rows only; a second learner's JWT returns 0 of them; admin returns them. | CHAR |
| C4.2 | P4 teacher read | Teacher legitimately linked to student (per doc 15's *hardened* enrollment) SELECTs the student's rows; unlinked teacher gets 0; cross-district teacher gets 0. Fails today (no teacher policy `[observed]`). | ACC → F3 |
| C5.1 | P5 append-only history | Two uploads → two rows; `ProgressTimeline` renders both; no code path deletes or collapses rows; a byte-identical re-upload still leaves a visible history entry (as `status='duplicate'`, §2.4). | CHAR (first half) / ACC (duplicate row) |
| C6.1 | P6 store separation | Completing the placement quiz writes only `profiles.placement_cefr` (`20260730030000_persist_placement_level.sql` `[observed]`); completing a certification attempt writes only `certification_attempts`; neither touches `transcript_analyses`. Grep-level guard: no writer of `transcript_analyses` outside `analyze-transcript`. | CHAR |
| C7.1 | P7 guardrails | Unauthed call → 401; 21st call/user/day → 429; limiter RPC failure → deny (fail-closed, `_shared/authGuard.ts:60-79` `[observed]`). | CHAR |
| C8.1 | P8 consumer smoke | Seed fixture rows; assert non-crash + expected values for: `useProgressData`, `StudentAnalysisView`, `AnalysisResults`, `ProgressTimeline`, `Certificate.tsx`/`fluencyCertification.ts`, `StudentProfile.tsx`, `useStudentProficiency.ts`, `StudentTestScores`, `ClassTestAverages`, `schoolUtils.avgCertificationScore`, `ExportReportButton`→`generate-teacher-report`. | CHAR (crash-free) + ACC (correct values, blocked on F2/F3) |

**Acceptance criterion for this section:** CI runs all CHAR tests green on the unmodified `overhaul` branch before the first flow-touching PR merges; every ACC test is linked to exactly one fix in §2 and flips to must-pass when that fix merges. Effort: **T0 = M, suite authoring = L**.

---

## 2. Fix designs (all flow-preserving)

Effort classes: **S** ≤ 0.5 dev-day · **M** 0.5–2 · **L** 2–5 · **XL** > 5. All estimates `[estimated]`.

### 2.1 F1 — PDF support end-to-end (the client-accepts / server-rejects bug)

**Current (broken):** client accepts `application/pdf` (`TranscriptUpload.tsx:57,232-235`), server allow-list is images-only and requires `data:image/` prefix (`analyze-transcript/index.ts:10,38`) → every PDF fails with 400 after bytes already landed in storage. `[observed]`

**Options:**

| Option | Mechanics | Pros | Cons |
|---|---|---|---|
| A. Server-side PDF→image | Edge function rasterizes page(s) (pdfium/pdf.js in Deno), sends images to the existing vision call | No model/gateway dependency; keeps single vision path | Deno edge runtime constraints (no native binaries; pdf.js is heavy; CPU/memory/time limits `[requires validation]`); multi-page reports need page selection/stitching logic; quality loss on dense tables |
| B. Native multimodal PDF input (**recommended**) | Server sends the PDF itself to Gemini. Gemini API natively accepts PDF (inline or Files API), ≤50 MB / ≤1000 pages, ~258 tokens/page `[documented]` (https://ai.google.dev/gemini-api/docs/document-processing, fetched 2026-07-30) | No conversion code; handles multi-page natively; best table fidelity; text-layer PDFs are cheap | Whether the **Lovable gateway** passes PDF content parts through its OpenAI-compatible endpoint is **`[requires validation]`**; if not, requires a direct `GOOGLE_API_KEY` path (second billing/DPA channel) or fallback to A |
| C. OCR/text-extraction path | Extract text layer (pdf-parse) or third-party OCR, send text to a cheap text model | Cheapest per run; smallest payload | Score reports are tabular/layout-heavy — text extraction scrambles score↔skill association; scanned PDFs need real OCR (new subprocessor in the minors/FERPA DPA chain); worst accuracy risk |

**Recommendation: B**, with a two-step plan and A as the engineered fallback:

- **F1.0 hotfix (S, ship immediately, independent of everything):** remove `application/pdf` from the client dropzone + copy until the server path exists — stop the 100% silent failure. Also align size limits (one constant, see F1.2). *Acceptance:* a PDF drag is rejected client-side with an explicit "PDF support coming" message; zero PDF bytes reach storage; images unaffected.
- **F1.1 ingestion inversion (M):** server stops trusting client base64. Client uploads to storage (as today), then invokes the function with `{storagePath, idempotencyKey}` only; the function downloads the bytes with service role, **magic-byte sniffs** true type (PDF `%PDF-`, JPEG/PNG/WebP signatures), and enforces one canonical size limit. Removes the 10 MB-client/5 MB-server mismatch (`TranscriptUpload.tsx:56` vs `index.ts:9`) `[observed]` and makes the client-declared `fileType` advisory only. *Acceptance:* function rejects a renamed `.exe`→`.png` fixture; base64 no longer appears in the request body; single `MAX_FILE_SIZE` constant shared client/server.
- **F1.2 PDF to model (M–L):** spike (≤0.5 d) proving the gateway passes PDFs (`[requires validation]`); if yes, send `data:application/pdf;base64` (or file part) with page cap (e.g., first 10 pages `[proposed]`); if no, either (a) direct Gemini API call for the PDF branch only (adds `GOOGLE_API_KEY`, flag for DPA doc, §2.8) or (b) implement Option A rasterization. *Acceptance:* golden set of ≥10 real score-report PDFs (text-layer and scanned) analyzes with ≥90% field-level extraction parity vs. human-labeled truth `[proposed threshold]`; PDF re-enabled in the client only in the same PR that makes the server accept it (contract-symmetry rule).
- **Effort total: M–L.**

### 2.2 F2 — UI/DB contract repair (the §6.3 unpacking break)

**Current (broken):** DB row is narrow (`analysis_data` JSONB, `types.ts:2162-2189`); UI `Analysis` type expects wide flat fields; `StudentAnalysisView.tsx:27-38` casts `select('*')` results without unpacking → detailed cards, section-score chart lines, and file names silently render empty. `[observed]`

**Options:**

| Option | Pros | Cons |
|---|---|---|
| A. Reader-side mapper over JSONB (**recommended**) | One writer, one reader contract; no data migration; schema can evolve behind `schema_version` | JSONB fields not directly SQL-aggregatable (acceptable: aggregations only use `overall_score`/`cefr_level`, which stay as columns `[observed]` in `schoolUtils.ts:268-289`) |
| B. Re-widen table to flat columns | SQL-friendly; matches old UI type | Reintroduces the wide/narrow churn that caused this break; every prompt change becomes a migration; two eras of rows to backfill |
| C. DB view / generated columns | Read-side SQL convenience without migration of writes | Another schema surface to keep in sync; doesn't remove the need for a TS-side type guard |

**Recommendation: A + a minimal column restore.**

- One module — `shared/assessment/analysisContract.ts` `[proposed]` — holding the zod schema of `analysis_data` (fields per the prompt at `analyze-transcript/index.ts:44`) and `unpackAnalysis(row): Analysis`. Consumed by **every** reader in §7.1/7.2 of wip-12a; the edge function validates against the same schema before insert (F5). If a single file can't be imported by both Vite and Deno builds, keep two copies with a **parity test** that diffs them in CI. `[proposed]`
- Restore first-class columns (migration): `file_name text`, `storage_path text`, `status text` (F4), `failure_code text`, `content_hash text`, `idempotency_key text`, `schema_version int`, `model text`. `file_name`/`fileType` are received today but never stored (`index.ts:94-102`) `[observed]`; the timeline UI still expects `file_name` (`ProgressTimeline.tsx:252`) `[observed]`.
- Backfill: existing rows get `schema_version=1`, `status='complete'`; mapper tolerates both eras.
- *Acceptance:* C2.2 and C8.1-value tests pass; `AnalysisResults` renders strengths/weaknesses/recommendations from a seeded row; timeline shows non-zero section lines and the file name; `grep` finds zero `as unknown as Analysis` casts. **Effort: M.**

### 2.3 F3 — Teacher/district visibility through the NEW tenancy model

**Current (broken):** the only policy on `transcript_analyses` is owner-or-admin SELECT (`20260729061713:410-417`); every teacher/district surface in wip-12a §7.2 gets zero rows. `[observed]` Meanwhile doc 15a's **G1** shows `is_teacher_of_student` is *satisfiable by self-election + enroll-by-email* today `[observed]` — so naively restoring teacher RLS would hand the G1 attacker uploaded score reports too.

**Options:** (a) RLS policy on `is_teacher_of_student`; (b) service-role read endpoint with explicit checks; (c) hybrid.

**Recommendation: hybrid, sequenced behind doc 15.**

- **F3.1 (blocked on 15's G1 fix — hard dependency):** add SELECT policy `public.is_teacher_of_student(auth.uid(), user_id)` to `transcript_analyses`, mirroring the existing pattern at `20260729061713:423-427` `[observed]`. The helper is already `SECURITY DEFINER, search_path=''` hardened (`wip-15a §2`) — reuse, don't reinvent. Ship in the same release train as 15's enrollment-integrity change (verified/consented enrollment, school scoping), never before it. **Effort: S** (policy) once 15 lands.
- **F3.2 district/school rollups (M):** do **not** grant district-admin row-level SELECT over raw analyses. Instead a service-role endpoint (or extension of `generate-teacher-report`) returns **aggregates only** (latest CEFR distribution, average score per class/school), with an explicit caller-role + same-tenant check using 15's `district_id` spine (`[requires validation]` — spine doesn't exist yet per 15a §3). Rationale: district staff need trends, not each minor's uploaded document contents; data minimization for FERPA/COPPA posture.
- **F3.3 (M):** make `generate-teacher-report` actually include per-student latest `overall_score`/`cefr_level`/`upload_date` from `transcript_analyses` (today it queries a removed source and exports empty CEFR columns, `generate-teacher-report/index.ts:80-81,137,168-169` `[observed]`), labeled in the export as "External assessment (uploaded document)" per §3.
- **F3.4:** replace the N+1 per-student query loop in `StudentTestScores.tsx:139-146` with one `in('user_id', ids)` query when F3.1 lands. **Effort: S.**
- *Acceptance:* C4.2 passes; a teacher of a seeded student sees score trend in `StudentDetailModal`; an unlinked teacher and a cross-district teacher see nothing (RLS-verified, not UI-verified); CSV export contains uploaded-assessment columns with provenance label; every teacher access writes an `educational_data_access_audit` row (closes 15a G3 for this table — coordinate with doc 15). 

### 2.4 F4 — Processing-status lifecycle, retry, idempotency, duplicates

**Current (broken):** no status at all — failures leave no trace; a failed insert still returns `success: true` (`index.ts:102-104`); no retries; double-submit creates two rows and burns two quota units; client shows synthetic 25/50/75/90/100% progress (`TranscriptUpload.tsx:277-288`). `[observed]`

**Design `[proposed]`:**

- **State machine (server-written only):** `uploaded → processing → complete | failed(failure_code) | invalid (F5 quarantine) | duplicate`. Row is created with `status='processing'` immediately after input validation, **before** the model call — so every attempt has a durable record. Terminal update in the same function; `complete` requires the insert/update to succeed — if the final write fails, the response is `success:false` (kills the silent-loss bug).
- **Idempotency key:** client generates a UUID per upload attempt and sends it; unique index `(user_id, idempotency_key)`; a replay returns the existing row instead of reprocessing. Protects against double-submit and network retries.
- **Duplicate detection:** server computes SHA-256 `content_hash` of the bytes (enabled by F1.1). If the same `(user_id, content_hash)` already has a `complete` row: create a `status='duplicate'` row pointing at the original (`duplicate_of uuid`), **no model call, no quota unit**, and return the original analysis with an explicit "already analyzed on {date}" notice. This preserves P5 (append-only, nothing silently discarded) while eliminating duplicate AI spend. Consumers count only `complete` rows in stats.
- **Retry:** (a) in-call: up to 2 retries with backoff on gateway 429/5xx within the function budget; (b) learner-facing: `failed` rows render in the timeline with a "Retry analysis" action that re-invokes with `{storagePath, idempotencyKey:new}` — no re-upload, normal quota rules.
- **Real progress UX:** replace synthetic percentages with the row's actual status (poll or realtime on the learner's own row — owner SELECT already permits this).
- *Acceptance:* double-click submit produces exactly one `processing` row; byte-identical re-upload produces a `duplicate` row and zero gateway calls (assert via mock); forced insert failure → response `success:false` and `status='failed'` with `failure_code='insert_failed'`; failed row visible to learner with retry; C5.1 fully green. **Effort: L.**

### 2.5 F5 — Structured-output validation & quarantine

**Current (broken):** regex-extract + `JSON.parse`; on failure a stub (`cefr_level:'Unknown'`) is persisted as a real analysis; no schema validation of any field except recommendation caps (`index.ts:75-90`). `[observed]` Bad CEFR poisons `useStudentProficiency`, certificates, and district averages downstream. `[observed consumers]`

**Design `[proposed]`:**

- Call through `_shared/aiGateway.ts` `chatJson` with `response_format: json_object` (wrapper already exists and is unused by this function `[observed]` `aiGateway.ts:31-40`). Note: wrapper is text-only today — extend it with multimodal content parts (S).
- Validate with the F2 shared zod schema: `cefr_level ∈ {A1,A2,B1,B2,C1,C2} | null` (normalize case; anything else → null + flag), all scores `0–100 | null`, arrays bounded (≤10 items, ≤500 chars each), strings capped, unknown keys stripped.
- One corrective retry: on schema failure, re-ask once with the validator errors appended. Still invalid → persist `status='invalid'` with the raw text under `analysis_data.raw` for debugging; **never** surfaces as an analysis; UI shows "We couldn't read this document — try a clearer copy," and the learner gets a retry affordance.
- All consumers filter `status='complete'` (via the F2 mapper, one choke point).
- *Acceptance:* fixture of malformed model output → `invalid` row, no XP award, no certificate check, absent from `useProgressData` counts and district averages; `cefr_level='Advanced-ish'` fixture → stored null + `invalid`; zero rows where `status='complete'` and schema-invalid `analysis_data` (SQL audit query ships with the PR). **Effort: M.**

### 2.6 F6 — Quota after validation

**Current:** `guardPaidRequest` consumes a quota unit at line 15, before input validation at line 34 — invalid files burn quota. `[observed]`

**Design:** split the guard into `authenticate()` (JWT, always first) and `consumeQuota()` (called only after magic-byte/size/duplicate checks pass, immediately before the model call). Duplicates (F4) and validation failures cost 0 units; model calls cost 1. Keep fail-closed semantics of the limiter RPC. *Acceptance:* C7.1 still green; an invalid-file request leaves the daily counter unchanged; a duplicate leaves it unchanged; 20 *model calls* remain the daily cap. **Effort: S–M** (guard refactor touches other functions' call sites — verify no behavior change elsewhere via CHAR tests).

### 2.7 F7 — Observability & failure taxonomy

**Current:** `console.log` only; no run record; failures indistinguishable. `[observed]`

**Design `[proposed]`:** an `assessment_runs` table (service-role write, admin read): `id, analysis_id, user_id, stage_timings jsonb` (validate / fetch_bytes / model_call / parse_validate / persist, ms each), `model`, `prompt_tokens`, `completion_tokens` (from gateway usage block `[requires validation]` that Lovable returns `usage`), `failure_code`, `created_at`. Failure taxonomy (closed enum, shared with `transcript_analyses.failure_code`): `upload_missing | invalid_file | oversize | duplicate | quota_exceeded | gateway_error | gateway_timeout | parse_failed | schema_invalid | insert_failed`. Alert: failure-rate > 10% over 1h or p95 model_call > 30s `[proposed thresholds]`. No document content or PII beyond `user_id` in this table. *Acceptance:* every invocation (success or failure) writes exactly one run row; a dashboard query can compute per-stage p50/p95 and failure mix for any day. **Effort: M.**

### 2.8 F8 — Privacy: bucket verification, retention, subprocessors

**Current risk:** legacy migrations flipped the `transcripts` bucket **public** with a bucket-wide read policy (`20250612234158:2-4,25-26`); the 2026 consolidated baseline recreates no bucket or storage policy at all — live state unknown: possibly public learner PII, possibly no bucket (all uploads failing at step 1). `[observed migrations; live state requires validation]` Orphaned bytes accumulate on every failed analysis. `[observed]`

**Design:**

- **F8.1 live audit (S, do first — this is the highest-severity unknown):** against the hosted project, verify bucket exists, `public=false`, only per-user-folder policies present; capture findings in doc 15's audit log. If public: immediate remediation migration + incident note (minors' PII exposure window).
- **F8.2 declarative bucket migration (S):** a 2026-era idempotent migration asserting the bucket private + the four per-user folder policies (pattern from `20250612231123:122-141` `[observed]`), so environments can't drift again.
- **F8.3 retention (M):** scheduled job — delete storage objects for `failed`/`invalid` rows older than 30 days `[proposed]`; delete orphaned objects with no DB row older than 7 days; `complete` documents retained while the account exists, deleted on account deletion (hook into doc 15's DSAR/deletion workstream — currently UI-only `[observed]` 15a G3/§5). Retention windows are policy knobs for district DPAs, stored in config not code.
- **F8.4 subprocessor documentation (S):** the document flows Supabase (storage) → Lovable AI Gateway → Google (Gemini). If F1.2 adds a direct Google path, the chain changes. Feed the actual chain to the district-DPA/compliance workstream (doc 15) — a minors' score report is FERPA-relevant education records. `[proposed]`
- *Acceptance:* signed-URL-only access verified from an anonymous client (fetch of a known object path returns 403); retention job provably deletes a seeded expired orphan; DPA doc lists the exact chain with regions. **Effort total: M.**

### 2.9 F9 — Cost & model choice for parsing

**Documented pricing** (https://ai.google.dev/gemini-api/docs/pricing, fetched 2026-07-30):

| Model | Input /1M tok | Output /1M tok |
|---|---|---|
| Gemini 2.5 Pro (current, `index.ts:51`) | $1.25 (≤200k ctx) | $10.00 |
| Gemini 2.5 Flash | $0.30 | $2.50 |
| Gemini 2.5 Flash-Lite | $0.10 | $0.40 |
| Gemini 3.5 Flash-Lite (successor family) | $0.30 | $2.50 |

PDF pages bill ≈258 tokens/page `[documented]` (document-processing doc, fetched 2026-07-30). Secondary sources report a **retirement date of 2026-10-16 for the 2.5 family** `[documented]` (cloudzero.com/blog/gemini-pricing, fetched 2026-07-30; `[requires validation]` against Google's official deprecation page) — meaning the currently hard-coded model id is a time bomb regardless of choice.

Per-run `[estimated]`: input ≈ 1.5–2.5k tokens (prompt ~300 + 1–8 image-tiles/pages), output ≤2,000 tokens → **Pro ≈ $0.022/run; Flash ≈ $0.0056/run; Flash-Lite ≈ $0.0009/run** (gateway markup, if any, `[requires validation]`). At the 20/user/day cap: worst case ≈ $0.45 vs $0.11 vs $0.02 per user-day.

**Recommendation:** score-report extraction is structured *reading*, not reasoning — default to **`google/gemini-2.5-flash`**, keep Pro as a config-selectable fallback, and make the model id + prompt version configuration (env/table), not code. Gate the switch on a **golden-set eval**: ≥20 labeled real score reports (mixed providers, image + PDF, EN + ES), field-level extraction accuracy within 2 points of Pro on scores and exact-match on CEFR `[proposed criteria]`. Re-run the same eval when migrating off the retiring 2.5 family. *Acceptance:* eval harness committed and repeatable; chosen model recorded per-row (`model` column, F2); cost per run visible from F7 token telemetry. **Effort: M** (eval harness is the bulk).

### 2.10 F10 — `generate-teacher-report` authorization fix

**Current (broken):** `teacherId` comes from the request body and is never compared to the authenticated user (`generate-teacher-report/index.ts:18-38` `[observed]` — `guardPaidRequest` authenticates but the body's `teacherId` drives all queries under service role). Any authenticated user can export any teacher's roster PII.

**Design:** derive teacher identity from `gate.userId`; **ignore** body `teacherId` (or 403 on mismatch unless `has_role(admin)`); verify the caller actually has role `teacher` via the hardened `has_role`; write an audit row per export (doc 15 G3). Same PR closes the sibling hole: `generate-study-recommendations` must verify the `transcriptId` belongs to the caller (`generate-study-recommendations/index.ts:21-27` `[observed]`), and its `/10` vs 0–100 prompt bug (`:32` `[observed]`) — or the function is deleted per the orphan decision (wip-12a §11.12; recommendation: delete both orphaned functions now, resurrect the recommendations loop deliberately later `[proposed]`). *Acceptance:* user B calling the export with `teacherId=A` receives 403; A's own export succeeds; export attempt appears in the audit table. **Effort: S.** **Priority: highest in this doc — live PII exposure.**

---

## 3. Boundary architecture: the Proficiency Evidence presentation model

**Problem `[observed]`:** stores are separate (good) but semantics leak: `useStudentProficiency.ts:39-56` queries `transcript_analyses` under the name `certifications` and labels the source `'certification'`; the downloadable fluency certificate is minted solely from an AI reading of a user-supplied image (`fluencyCertification.ts:55-71`, `Certificate.tsx:36-68`) — a spoofable credential; the word "transcript" means three different things.

**Design `[proposed]` — a read-side presentation model; no storage merge, no new writes:**

```
EvidenceSource = 'external_upload'   // transcript_analyses — uploaded score report
               | 'placement'         // profiles.placement_cefr — self-placement seed
               | 'course_mastery'    // lesson/checkpoint progress (doc 14 mastery model)
               | 'conversation'      // student_metrics / conversation performance
               | 'in_app_assessment' // certification_attempts

EvidenceItem {
  source: EvidenceSource
  verifiability: 'document_submitted'   // external_upload — unverified user-supplied document
               | 'self_reported'        // placement
               | 'system_measured'      // course_mastery, conversation, in_app_assessment
  cefr: CEFR | null
  asOf: timestamp
  detail: ref  // deep link to the source surface
}
```

**Rules (enforced by review checklist + C6.1-style tests):**

1. **One adapter per source, read-only.** A `useProficiencyEvidence()` hook returns `EvidenceItem[]`; each adapter reads exactly its own store. Replaces the mislabeled query in `useStudentProficiency` (source label becomes `'external_upload'`; behavior — external upload outranks placement for conversation-difficulty seeding — is preserved, only truthfully labeled).
2. **No unlabeled aggregation.** Any surface showing a single "level" must name its source inline (learner profile, teacher modal, exports). District aggregates aggregate *within* one source, never across sources.
3. **Teacher/district views show sources as separate columns/sections**: "External assessment (uploaded document)" ≠ "Course level" ≠ "Conversation performance". The CSV export (F3.3) carries a `source` column.
4. **Certificates carry provenance.** Near-term (S): the fluency certificate states "Based on a learner-submitted score report" on its face and in metadata. Later (product decision, out of scope here): corroboration gating (external upload + in-app assessment agreement) may *upgrade* the label — but course performance never *replaces* the uploaded evidence (owner directive).
5. **Naming cleanup, presentation layer only** (no DB renames this phase): uploads = "score report" / "external assessment"; conversation logs = "session transcripts"; `certification_attempts` = "in-app assessments". `[proposed]`

*Acceptance:* a seeded learner with all five sources shows five distinctly-labeled items on the profile and in the teacher modal; grep finds no remaining `source: 'certification'` derived from `transcript_analyses`; certificate PNG contains the provenance line; no store gains a new writer. **Effort: M** (adapters) **+ S** (certificate label).

---

## 4. Anti-requirements — what the overhaul must NOT do

1. **MUST NOT** replace, merge, gate, or precondition the upload flow with the placement quiz or any in-app test. Upload works for a brand-new account with zero course activity.
2. **MUST NOT** let course mastery, conversation performance, quiz results, or any in-app signal write to, overwrite, or masquerade as `transcript_analyses` rows — and vice versa. `complete` rows are immutable.
3. **MUST NOT** introduce any client-writable path (INSERT/UPDATE/DELETE) to `transcript_analyses` — service-role only, forever (P3).
4. **MUST NOT** delete, collapse, or silently dedupe historical uploads (P5); duplicates get their own labeled rows (F4), never vanish.
5. **MUST NOT** build a unified "proficiency" table/score that erases per-row provenance (P6, §3).
6. **MUST NOT** present in-app estimates as external test results in any teacher, district, or export surface — and must not present the uploaded document's AI reading as a *verified* credential without its provenance label.
7. **MUST NOT** make the `transcripts` bucket public, relax per-user folder policies, or put document bytes/URLs in client-reachable public URLs.
8. **MUST NOT** ship any `transcript_analyses` schema change without the reader mapper updated in the same PR (the §6.3 lesson, enforced by C2.2).
9. **MUST NOT** remove or weaken the JWT gate, fail-closed rate limiting, or score clamping (P7).
10. **MUST NOT** enable teacher/district RLS on `transcript_analyses` before doc 15's enrollment-integrity (G1) fix lands.
11. **MUST NOT** break existing image uploads while adding PDF (image path is the only working path today).
12. **MUST NOT** widen model access: no new endpoint may accept arbitrary user-directed prompts against uploaded documents.

---

## 5. Dependencies, sequencing, risks

**Dependencies:**

| On | What | Direction |
|---|---|---|
| Doc 15 (data/security/tenancy) | G1 enrollment-integrity fix; `district_id` spine; audit-log infra; DSAR/deletion backend | Blocks F3.1/F3.2; F8.3/F10 feed it |
| Doc 13 (localization) | i18n of `TranscriptUpload` strings (wip-12a §2.1 regression) | Parallel, S |
| Lovable gateway | PDF pass-through, `response_format`, `usage` reporting, markup | `[requires validation]` spike before F1.2/F5/F7 finalize |
| Live Supabase project | Bucket/policy audit (F8.1) | Do first |
| T0 test infra | Everything in §1 | First PR of this workstream |

**Suggested order:** T0 + CHAR suite → F10 + F8.1 (live security) → F1.0 hotfix → F2 → F4+F5+F6 (one epic: they share the function rewrite) → F1.1/F1.2 → F7 → F9 eval → F3 (when doc 15 lands) → §3 presentation model.

**Risks:**

| Risk | Likelihood | Mitigation |
|---|---|---|
| Gateway can't carry PDFs → F1 slips to rasterization (L) or direct-Google (DPA change) | Medium | 0.5 d spike first; F1.0 hotfix decouples learner trust from the timeline |
| Live bucket is public (minors' PII exposed) | Unknown | F8.1 first; remediation migration pre-written |
| Doc 15 slips → teacher visibility stays dark | Medium | F3.3 report fix can ship earlier via service-role explicit checks (option b) as a stopgap |
| 2.5 model family retirement mid-build | High (documented horizon) | Model id in config + committed eval harness (F9) makes migration a config change + eval run |
| Function rewrite (F4/F5/F6) regresses working image path | Medium | CHAR suite is the gate; feature-flag the new function alongside the old |
| Backfill mismatch between old rows and new mapper | Low | `schema_version` + mapper era-tolerance + C8.1 fixtures from real old-era rows |

**Roll-up acceptance criteria (measurable):**

1. All §1 CHAR tests green before first change; all ACC tests green at workstream end.
2. PDF upload success (valid ≤ limit, text or scanned): ≥95% reach `complete` on the golden set; 0% silent failures (every attempt has a terminal-status row).
3. 0 rows with `status='complete'` failing schema validation (recurring SQL audit).
4. Learner detailed feedback, section-score trends, and file names render for 100% of seeded `complete` rows (was: 0% `[observed]`).
5. Teacher-of-student sees student history; unlinked/cross-tenant access returns 0 rows at the RLS layer; every teacher read/export audited.
6. Duplicate re-upload: 0 model calls, 0 quota units, 1 labeled history row.
7. Invalid input costs 0 quota; cap remains 20 model calls/user/day, fail-closed.
8. Per-run cost visible from telemetry; default-model cost ≤ $0.01/run `[estimated]` at Flash pricing without accuracy regression beyond eval thresholds.
9. Anonymous fetch of any stored document path: 403.
10. Every proficiency number on learner/teacher/export surfaces carries a source label from §3's enum.

# WIP 12a — Existing PDF/Transcript Assessment Workflow: Current State & Preservation Spec

Auditor: Existing PDF Assessment Workflow Preservation Specialist (discovery half)
Repo: `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`
Status: PROTECTED FLOW — externally produced PDF/transcript is uploaded, AI-assessed, and structured results attach to the learner profile, visible to learner and teacher. Must NOT be replaced by an in-app placement test.

Labels: `[observed]` seen in repo · `[inferred]` deduced from code · `[estimated]` order-of-magnitude · `[requires validation]` needs live-system check.

---

## 1. Executive summary

The flow exists end-to-end in code and the **core server-side skeleton is sound** (server-only writes, JWT + daily rate limiting, origin-scoped CORS), but the flow is currently **broken in at least four load-bearing places**:

1. **PDF uploads always fail analysis** — the client accepts PDFs, the edge function rejects them. `[observed]`
2. **The UI's data contract no longer matches the database** — rich analysis fields moved into a JSONB column that no reader unpacks, so section scores, strengths/weaknesses, feedback, and file names silently render as empty. `[observed]`
3. **Teacher and district visibility is dead at the RLS layer** — every teacher-facing query of `transcript_analyses` returns zero rows under current policies. `[observed schema; behavior inferred]`
4. **A failed DB insert still reports success to the learner** — results shown once, then lost. `[observed]`

The adjacent placement quiz and certification flows are cleanly separated at the storage layer (different tables), but entangled at the semantic layer: the uploaded-transcript CEFR silently drives the "fluency certificate," AI conversation difficulty, and district averages.

---

## 2. Entry points and routes

| Route | File | Notes |
|---|---|---|
| `/analysis` | `src/App.tsx:76` → `src/pages/TranscriptAnalysis.tsx:1-7` | Thin wrapper over `StudentAnalysisView` `[observed]` |
| `/progress` | `src/App.tsx:92` → `src/pages/Progress.tsx` | Rebuilt page; upload moved out (see §3.1) `[observed]` |
| `/accuracy` | `src/App.tsx:91` → `src/pages/Accuracy.tsx` | Conversation metrics, **not** part of this flow (§8.3) `[observed]` |
| `/certificate` | `src/App.tsx:83` → `src/pages/Certificate.tsx` | Downstream consumer (§6.3) `[observed]` |
| `/placement-quiz` | `src/App.tsx:101` → `src/pages/PlacementQuiz.tsx` | Adjacent, separate (§8.1) `[observed]` |

### 2.1 The rebuilt Progress page and the prior upload shell
- Current `src/pages/Progress.tsx:156-188` shows a "Transcript analyses" summary card (`totalAnalyses`, `latestScore` from `useProgressData`) with a button navigating to `/analysis` for uploads; comment at `Progress.tsx:26-29` documents that "uploads live at /analysis". `[observed]`
- Prior version (git `ea3ee7f5^:src/pages/Progress.tsx`, commit `ea3ee7f5` "feat: overhaul student-facing UX for ESL learners") hosted an upload shell directly on the Progress page (file input `handleFileSelect`, "uploadTestTranscript" card) using the i18n `t()` helper. `[observed]`
- **Regression note:** the old shell was localized via `t("uploadTestTranscript")` etc.; the current `TranscriptUpload.tsx` is hardcoded English (`src/components/transcript-analysis/TranscriptUpload.tsx:251-311`) despite ~41 language packs in `src/translations/`. `[observed]` — pedagogy/equity concern for ESL users.

---

## 3. Upload interface (learner side)

`src/components/transcript-analysis/TranscriptUpload.tsx` — the only live upload component. `[observed]`

- **Dropzone:** `react-dropzone` (`useDropzone`, lines 230-238) — accepts `image/*` (`.jpeg .jpg .png .webp`) and `application/pdf`, single file, disabled while uploading or unauthenticated. `[observed]`
- **Client validation (inline, lines 55-75):** max 10 MB; allowed MIME types `image/jpeg, image/png, image/webp, application/pdf`. `[observed]`
- **Auth handling:** session check + re-auth redirect to `/auth` (lines 77-90); auth-state listener (lines 32-49). `[observed]`
- **Upload sequence (lines 95-216):**
  1. Path `` `${user.id}/${Date.now()}.${ext}` `` → `supabase.storage.from('transcripts').upload(...)` (lines 100-110).
  2. `FileReader.readAsDataURL` → base64 (lines 114-118, 216).
  3. `supabase.functions.invoke('analyze-transcript', { imageData, fileName, fileType })` (lines 123-129).
  4. `getPublicUrl` computed (lines 140-142) but **unused** — the local `analysisRecord` is built then explicitly voided; persistence is server-side only (lines 145-168, comment at 166-167). `[observed]`
  5. Client-side cert check `checkCertAchievement(...)` (lines 173-176) + `awardXP('exam_analysis', { examScore })` (lines 180-182) + XP/cert notifications (lines 184-199).
- **Progress UX:** synthetic percentage steps (25/50/75/90/100) with staged copy (lines 277-288) — not real progress. `[observed]`

### 3.1 Contract breaks at the upload boundary — CRITICAL

- **PDF is a lie.** Client advertises and accepts PDF (`TranscriptUpload.tsx:57, 232-235`; UI copy lines 253, 295), but the edge function's allow-list is images only — `ALLOWED_MIME_TYPES = ['image/jpeg','image/jpg','image/png','image/webp','image/gif']` (`supabase/functions/analyze-transcript/index.ts:10`) — and additionally requires `imageData.startsWith('data:image/')` (line 38). A PDF becomes `data:application/pdf;base64,...` → **400 "Invalid file type" every time**, after the file bytes were already uploaded to storage. `[observed code; failure behavior inferred]`
- **Size mismatch.** Client allows 10 MB (`TranscriptUpload.tsx:56`); server rejects >5 MB via base64 estimate (`analyze-transcript/index.ts:9,38`). Files 5–10 MB upload to storage then fail analysis. `[observed]`
- **GIF mismatch (reverse direction).** Server allows `image/gif`; client dropzone does not offer it. Harmless but symptomatic. `[observed]`
- **Orphaned bytes.** On any analysis failure (including every PDF), the stored object is never deleted and never referenced (no `file_url` column survives — §5.1). Unreferenced learner PII accumulates in storage. `[observed code; accumulation inferred]`
- **`src/utils/security/fileValidation.ts` is dead code.** `validateFile` / `sanitizeFilename` / `validateBase64Image` (lines 29-139) are imported nowhere (`grep` confirms zero call sites). Its rules also disagree with both the client (5 MB vs 10 MB; allows DOC/DOCX) and the server. Three competing validation "truths." `[observed]`

---

## 4. Storage

- Bucket `transcripts`, private (`public => false`), created in the pre-baseline era: `supabase/migrations/20250612231123-...sql:120`; per-user folder policies (INSERT/SELECT/UPDATE/DELETE scoped to `auth.uid()::text = (storage.foldername(name))[1]`) at lines 122-141. `[observed]`
- The very next legacy migration **flipped the bucket itself to public** — `INSERT ... VALUES ('transcripts','transcripts', true) ON CONFLICT (id) DO UPDATE SET public = true` (`supabase/migrations/20250612234158-...sql:2-4`) — and added a **"Public read access to transcripts"** SELECT policy for the whole bucket (`same file:25-26`). So in the legacy era, uploaded score reports were world-readable at guessable paths (`{userId}/{Date.now()}.{ext}`). `[observed]`
- **However:** the consolidated baseline `20260211195248` recreates the schema from scratch and **no 2026-era migration creates the bucket or any storage policy** (grep over `2026*.sql` for `storage.buckets|bucket_id`: no hits). Whether the hosted project's bucket and which policy set exist today is **`[requires validation]`** — if the old policies survived a partial reset, transcript images (learner PII) are publicly readable; if the bucket was never recreated, every upload fails at step 1.
- `getPublicUrl` on a private bucket (`TranscriptUpload.tsx:140-142`) yields a non-functioning URL even when the bucket exists; the value is discarded anyway. `[observed]`

---

## 5. Processing — `supabase/functions/analyze-transcript/index.ts` (read fully)

- **Gate:** `guardPaidRequest(req, corsHeaders, 'analyze-transcript', 20)` — JWT verification + **20 runs/user/day**, fail-closed on limiter errors (`_shared/authGuard.ts:24-91`; limiter RPC `consume_rate_limit` hardened in `supabase/migrations/20260729062707:20`). Redundant second `getUser` inside the function (lines 26-30). `[observed]`
- **CORS:** origin-allow-listed via `buildCorsHeaders` (`_shared/cors.ts:12-14`). `[observed]`
- **Input validation:** MIME allow-list (images only) + `data:image/` prefix + ~5 MB base64 estimate (lines 34-40). No magic-byte sniffing; trusts client-declared `fileType`. `[observed]`
- **No OCR step:** the raw image goes straight to a vision LLM. **PDF text extraction does not exist anywhere in the function.** `[observed]`
- **Model & prompt:** `google/gemini-2.5-pro` via Lovable AI Gateway (`LOVABLE_AI_URL`, line 6; model line 51), single user message with prompt + `image_url` (lines 44-63), `max_tokens: 2000`, `temperature: 0.3`. Prompt (line 44) requests JSON: `overall_score (0-100)`, `cefr_level`, `reading_listening_score`, `written_production_score`, `spoken_fluency_score`, `test_date`, `test_provider`, `strengths[]`, `weaknesses[]`, `recommendations[]` (told to reference `/practice`, `/voice-chat`, `/pronunciation-practice`, `/lessons`, `/vocabulary`), `detailed_feedback`, `progress_insights`. `[observed]`
  - Note: does **not** use the shared `_shared/aiGateway.ts` wrapper nor its `response_format: json_object` option (`aiGateway.ts:31-40`) — raw fetch + regex extraction instead. `[observed]`
- **Output parsing (lines 75-90):** regex `\{[\s\S]*\}` → `JSON.parse`; on parse failure, degrades to a stub object with `cefr_level: 'Unknown'` and the raw text in `detailed_feedback` — a **stub row still gets persisted** as a real analysis. Only `recommendations` is sanitized (≤10 items, ≤500 chars, lines 88-90); no schema validation of any other field (`cefr_level` could be arbitrary text; section scores unchecked). `[observed]`
- **Persistence (lines 94-102):** service-role insert into `transcript_analyses` — `user_id`, `cefr_level`, `overall_score` clamped 0–100, and the whole parsed object as `analysis_data` JSONB. **`file_name`/`fileType` are received but never stored.**
  - **Silent-loss bug:** `if (saveError) console.error(...)` then still returns `{ success: true, analysis }` (lines 102-104). The learner sees results that were never saved. `[observed]`
- **Error handling:** single try/catch → 500 with message (lines 105-108). **No retries** on gateway failure; **no idempotency/duplicate detection** (same image can be analyzed repeatedly; a double-submit creates two rows and burns two quota units; quota is consumed *before* input validation, so invalid files also consume quota — `index.ts:15` before `:34`). **No status lifecycle** (the old `analysis_status` column is gone; there is no 'pending'/'failed' record — failures leave no trace at all). `[observed]`
- **Cost per run `[estimated]`:** one Gemini 2.5 Pro vision call, image input (~1-2k tokens) + ≤2000 output tokens ≈ $0.01–0.05/run at typical gateway pricing; hard-capped at 20/user/day, so worst case ≈ $1/user/day. `[estimated; gateway pricing requires validation]`

---

## 6. Persistence — `transcript_analyses`

### 6.1 Schema history (three eras) `[observed]`
1. **Wide era** — `20250612231123:3-35`: `file_name`, `file_type`, `file_url`, `upload_date`, `analysis_status`, per-skill scores, `strengths[]`, `weaknesses[]`, `recommendations[]`, `detailed_feedback`, `progress_insights`, `test_date`, `test_provider`, `raw_extracted_data JSONB`. Plus `progress_milestones` (lines 38-48) and a wide `study_recommendations` (lines 51-64). `20251004143750` later added a structured `recommendations` JSONB. `20251004141024:1-11` wiped all rows.
2. **Consolidated baseline** — `20260211195248:239-247`: narrow table `id, user_id, cefr_level, overall_score, analysis_data JSONB, created_at`. `study_recommendations` also narrowed to `recommendation_type, title, description, priority, transcript_id, user_id` (lines 255-266). `progress_milestones` **not recreated**.
3. **Patch** — `20260211222712:186-189` re-adds `upload_date TIMESTAMPTZ NOT NULL DEFAULT now()`.

Current live shape confirmed by generated types (`src/integrations/supabase/types.ts:2162-2189`): `analysis_data, cefr_level, created_at, id, overall_score, upload_date, user_id`. `[observed]`

### 6.2 RLS — current effective policies `[observed]`
- Baseline (`20260211195248:248-249`): owner SELECT + owner INSERT.
- Security pass (`20260729061713:410-417`): **drops both**, leaves exactly one policy — `SELECT` for `auth.uid() = user_id OR has_role(auth.uid(),'admin')`. **No INSERT/UPDATE/DELETE policies → writes are service-role only** (matches the edge function; the client comment at `TranscriptUpload.tsx:166-167` agrees).
- **No teacher policy and no district-admin policy exist in the current era.** The old teacher/district policies (`20250613130151:23-33`, `20250613133327`, `20250613133938`, `20250702013223`, `20250626185331:71-87`) predate the baseline and are not part of the rebuilt schema. Note the security pass grants teachers access to *other* tables via `is_teacher_of_student` (e.g., `usage_tracking`, `20260729061713:423-427`) but deliberately or accidentally not to `transcript_analyses`. `[observed]`
- `study_recommendations`: SELECT owner-only (`20260729061713:406-408`); no client INSERT → server-only writes. `[observed]`
- **History of multiple uploads:** no uniqueness constraint; one row per upload; UI renders history when >1 (`AnalysisResults.tsx:77-79`). `[observed]`

### 6.3 The JSONB unpacking break — CRITICAL `[observed]`
The UI type `Analysis` (`src/components/transcript-analysis/types.ts:1-72`) expects **flat columns**: `file_name`, `reading_listening_score`, `written_production_score`, `spoken_fluency_score`, `strengths`, `weaknesses`, `recommendations`, `detailed_feedback`, plus optional `detailed_analysis`, `cefr_comparison`, `learning_pathway`, `progress_indicators`. But the DB now stores all of that inside `analysis_data`, and `StudentAnalysisView.tsx:27-38` does `select('*')` then `as unknown as Analysis[]` **without unpacking `analysis_data`**. Consequences (all `[inferred]` from the observed mismatch):
- `AnalysisResults.tsx:45-74`: DetailedAnalysis/Breakdown/Recommendations cards never render (fields undefined) — learner sees only overall score + CEFR.
- `ProgressTimeline.tsx:53-60`: reading/writing/speaking chart lines are always 0; `analysis.file_name` (line 252) renders undefined in the timeline.
- `Certificate.tsx`, `StudentProfile.tsx`, `useProgressData.ts` survive because they only touch `cefr_level`/`overall_score`/`upload_date`.

---

## 7. Downstream consumers

### 7.1 Learner-visible `[observed]`
| Surface | File:lines | Reads |
|---|---|---|
| Progress page KPI card | `src/pages/Progress.tsx:156-188` via `src/hooks/useProgressData.ts:23-45` | count, latest `cefr_level`→"Current level", latest `overall_score` |
| Analysis dashboard | `src/components/student/StudentAnalysisView.tsx:21-50` (stats), tabs at 170-194 | full rows (broken unpack, §6.3); `milestones` hardcoded `[]` (line 43) |
| Results tab | `AnalysisResults.tsx` + 10 cards in `components/` (incl. `LearningPathwayCard.tsx`, `CEFRComparisonCard.tsx`) | latest analysis (mostly empty, §6.3) |
| Timeline tab | `ProgressTimeline.tsx:36-288` | recharts score progression + per-upload timeline |
| Fluency certificate | `src/pages/Certificate.tsx:36-68` + `src/utils/fluencyCertification.ts` | latest CEFR/score → Functional (B1) / Professional (B2+) certificate, downloadable PNG |
| Profile | `src/components/profile/StudentProfile.tsx:58-65,98-99` | all analyses → cert badge |
| AI conversation difficulty | `src/hooks/useStudentProficiency.ts:39-62` | latest `cefr_level` (labeled source `'certification'`) drives `getLevelBehavior` via `src/utils/proficiencyMapping.ts` |
| XP | `TranscriptUpload.tsx:180-187` → `useGamification.awardXP('exam_analysis', …)` (`src/hooks/useGamification.ts:113-140`) → `award-xp` fn | server recomputes XP from `source`+`metadata` (`award-xp/index.ts:49-50`) but `examScore` metadata is client-supplied `[observed]` |

Known UI bug: `StudentAnalysisView.tsx:138-158` computes "change from last" using `analyses[analyses.length - 2]` on a **descending** list — compares latest vs second-oldest, not previous. `[observed]`

### 7.2 Teacher-visible — all currently RLS-dead `[observed queries; zero-row behavior inferred from §6.2]`
| Surface | File:lines |
|---|---|
| Student detail modal score trend | `src/components/teacher/dashboard/StudentDetailModal.tsx:81-86,110-113` (`scoreTrends` from analyses) |
| Class performance charts | `src/components/teacher/dashboard/ClassPerformanceOverview.tsx:168-174` |
| Test-score tables | `src/components/profile/StudentTestScores.tsx:139-146,262-268` (N+1: per-student query loop) |
| Class test averages | `src/components/profile/ClassTestAverages.tsx:66` |
| District/school stats | `src/utils/schoolUtils.ts:268-289` (`avgCertificationScore` from latest per-student transcript scores) |
| CSV/JSON export | `src/components/teacher/dashboard/ExportReportButton.tsx:68` → `generate-teacher-report` |

`generate-teacher-report/index.ts` (service role, bypasses RLS) **does not query `transcript_analyses` at all** — its CEFR/ACTFL columns come from a removed "learning profiles" source and are always empty (`index.ts:80-81,137,168-169`). So even the export contains no uploaded-assessment data. `[observed]`
**Security gap:** it takes `teacherId` from the request body and never checks it against the authenticated `gate.userId` (`index.ts:18-38`) — any authenticated user can export any teacher's roster (names, emails, scores). `[observed]`

### 7.3 Orphaned downstream (built, never called) `[observed]`
- `supabase/functions/analyze-progress/index.ts` — summarizes **certification attempts** (`certification_type`, lines 53-66) via `gemini-2.5-flash`; zero frontend call sites.
- `supabase/functions/generate-study-recommendations/index.ts` — takes `transcriptId`, reads the analysis (service role), asks flash for 3-5 recommendations, inserts into `study_recommendations` with a duplicate guard (lines 29-30). Zero frontend call sites; `study_recommendations` is read nowhere in `src/` outside generated types.
  - **Ownership gap:** never verifies `transcriptId` belongs to the caller — any authenticated user can trigger generation against, and receive in the response (`insertedRecs`, line 68), another user's derived assessment data. `[observed]`
  - **Prompt bug:** "Score: ${analysis.overall_score}/10" while scores are 0–100 (line 32). `[observed]`
- `progress_milestones` — not in the current schema; `StudentAnalysisView.tsx:42-43` stubs it.

---

## 8. Adjacent-but-distinct flows — separation map

### 8.1 In-course placement quiz — SEPARATE (good) `[observed]`
`src/pages/PlacementQuiz.tsx`: 12 reading questions sampled from cert question bank, graded server-side (`gradeQuiz` in `src/utils/serverWrites.ts`, `persist: false`), result written to `profiles.placement_cefr` (+ `secureStorage`) per `20260730030000_persist_placement_level.sql`, whose comment explicitly frames placement as "a self-reported starting point, **not a credential**." No writes to `transcript_analyses`. This is exactly the separation the owner wants preserved: **placement seeds a starting point; the uploaded transcript is evidence attached to the profile.**

### 8.2 Certification flows (reading/writing/speaking) — SEPARATE tables, ENTANGLED naming `[observed]`
- `certification_attempts` + `certification_transcripts` (conversation logs, `20260211195248:~220-234`) written via `record-certification-attempt/index.ts:83-107` with server-side ownership checks; read by `analyze-speaking/index.ts:24` and `src/components/certificates/utils/certificateUtils.ts:68`.
- Feeds the can-do readiness projection: `useClassCanDoMastery.ts:85,107,140,151` sources `assessments` from `certification_attempts` — **not** from `transcript_analyses` (`src/utils/benchmarkReadiness.ts` is pure computation and explicitly labels output a projection, header lines 1-12).
- **Entanglement:** (a) the word "transcript" means three different things (uploaded score report, conversation log, quiz attempt); (b) `useStudentProficiency.ts:38-41` queries `transcript_analyses` under the name `certifications` and labels the source `'certification'`; (c) the "fluency certificate" (`Certificate.tsx`) is minted **solely** from uploaded-transcript CEFR (`fluencyCertification.ts:55-71`), i.e., an AI reading of a user-supplied image directly issues a credential — spoofable by uploading a fabricated score report. `[observed mechanics; spoofability inferred]`

### 8.3 Accuracy page — SEPARATE `[observed]`
`src/components/accuracy/AuthenticatedAccuracy.tsx` reads `student_language_metrics`/`student_metrics` (conversation-derived), never `transcript_analyses`. Its "generate metrics" path analyzes a **hardcoded mock conversation** (lines 172-187) — a fake-data smell, but outside this flow.

---

## 9. Strengths worth preserving

1. **Server-only persistence of proficiency claims** — no client INSERT on `transcript_analyses`; explicit rationale in code (`analyze-transcript/index.ts:92-93`, `TranscriptUpload.tsx:166-167`). Prevents grade tampering. `[observed]`
2. **Fail-closed per-user daily rate limiting on the paid endpoint** (`authGuard.ts:60-79`), bounding cost and abuse. `[observed]`
3. **Origin-allow-listed CORS** (`_shared/cors.ts:12-14`). `[observed]`
4. **Score clamping** 0-100 on write (`analyze-transcript/index.ts:97-99`) and recommendation length caps (lines 88-90). `[observed]`
5. **Multiple-upload history as first-class data** — append-only rows, timeline UI, improvement deltas (`ProgressTimeline.tsx`). Pedagogically right: growth over time, not a single snapshot. `[observed]`
6. **Per-user storage folders on a private bucket** (`20250612231123:122-141`) — correct pattern, needs re-verification (§4). `[observed/requires validation]`
7. **Placement vs. evidence separation** (§8.1) — placement writes to `profiles`, uploaded assessment to `transcript_analyses`; the overhaul must keep these distinct. `[observed]`
8. **Graceful-degradation stub on unparseable AI output** (`index.ts:79-86`) — right instinct (never crash the learner), wrong persistence (stub saved as real analysis). `[observed]`
9. **XP recomputed server-side** from source+metadata rather than trusting client amounts (`award-xp/index.ts:49-50`). `[observed]`

---

## 10. PRESERVATION SPEC — invariants any overhaul MUST keep

**P1. The flow itself.** Learner (or teacher on learner's behalf — today learner-only) uploads an externally produced score report (image; PDF intended) → file bytes land in private per-user storage → server-side AI extraction → structured result persisted server-side → result attached to the learner's profile history → visible to the learner and (by design intent) their teacher. It is **evidence ingestion, not a test**. It must never be replaced by, merged into, or gated behind the in-app placement quiz. `[observed intent; owner directive]`

**P2. Data contract (minimum persisted fields).** Per upload, one immutable row containing at least: `user_id`, upload timestamp, `overall_score` (0-100, clamped), `cefr_level`, and the full structured extraction (today `analysis_data`: section scores, strengths, weaknesses, recommendations, detailed_feedback, progress_insights, test_date, test_provider). Any schema change must ship with a reader-side unpacking layer **in the same change** (the §6.3 break is the cautionary tale). File identity (`file_name`, storage path) should be restored to the row — it existed in the wide era and the timeline UI still expects it.

**P3. Write path.** Inserts remain service-role-only from the analysis function; no client-writable path to `transcript_analyses` may ever be introduced (it is a proficiency credential source). RLS keeps owner SELECT.

**P4. Visibility rules.** Learner sees own full history. Teacher-of-student sees enrolled students' results (this is currently broken and must be restored via `is_teacher_of_student`-style policy or a service-role endpoint with an explicit teacher-of-student check — pattern already exists at `20260729061713:423-427`). Admin retains oversight. Nobody else.

**P5. History semantics.** Multiple uploads per learner, append-only, ordered by upload time; downstream consumers use "latest" for current level and the full series for trends. No dedup logic may silently discard an upload.

**P6. Separation from placement & certifications.** `profiles.placement_cefr` (self-reported seed), `certification_attempts` (in-app assessments), and `transcript_analyses` (external evidence) remain three distinct stores. Anything that merges them (e.g., a unified "proficiency" service) must keep provenance per source.

**P7. Cost/abuse guardrails.** Authenticated JWT + per-user daily quota on the AI call, fail-closed, stay in place.

**P8. Downstream consumers that must keep working** (regression checklist): `useProgressData`, `StudentAnalysisView`/`AnalysisResults`/`ProgressTimeline`, `Certificate.tsx` + `fluencyCertification.ts`, `StudentProfile.tsx`, `useStudentProficiency.ts`, teacher surfaces in §7.2, `schoolUtils.ts` school averages.

---

## 11. Ranked improvement opportunities (flow-preserving)

1. **Restore PDF support end-to-end** — either server-side PDF→image/text conversion (or a model/gateway path that accepts PDFs), or honestly drop PDF from the client until then. Today's silent 100% PDF failure is the single worst learner-facing defect. (`TranscriptUpload.tsx:57` vs `analyze-transcript/index.ts:10,38`) `[observed]` — pedagogy, trust.
2. **Fix the JSONB unpacking contract** — one shared mapper from `analysis_data` → `Analysis`, used by every reader; restore `file_name`/storage path on the row. (§6.3) `[observed]` — maintenance, pedagogy.
3. **Restore teacher/district read access by policy** — add `is_teacher_of_student` SELECT (and a scoped district-admin path) to `transcript_analyses`, mirroring `20260729061713:423-427`; then make `generate-teacher-report` actually include latest score/CEFR per student. `[observed gap]` — district use.
4. **Close the security holes in downstream functions** — `generate-teacher-report`: enforce `teacherId === gate.userId`; `generate-study-recommendations`: verify transcript ownership. (`generate-teacher-report/index.ts:30`, `generate-study-recommendations/index.ts:21-27`) `[observed]` — security/privacy (FERPA-relevant for districts).
5. **Make persistence transactional with the response** — if the insert fails, return failure (or retry) instead of `success: true`; write a row with a `status` ('processing'/'failed'/'completed') at request start so failures are visible and recoverable; surface real status in the upload UI instead of synthetic percentages. (`index.ts:94-104`; `TranscriptUpload.tsx:277-288`) `[observed]` — reliability, status UX.
6. **Structured-output validation** — use the gateway's JSON mode (`_shared/aiGateway.ts:38`) plus a schema validator (CEFR ∈ {A1..C2}, scores 0-100 or null, arrays bounded); persist stub/parse-failure results with a distinct status rather than as real analyses; consider a second-pass extraction retry. (`index.ts:75-90`) `[observed]` — reliability, pedagogy (bad CEFR poisons `useStudentProficiency`, certificates, district averages).
7. **Idempotency + duplicate handling** — content-hash the file; short-circuit re-analysis of an identical upload; consume quota only after validation; debounce double-submit client-side. (`index.ts:15,34`) `[observed gaps]` — cost, scalability.
8. **Privacy hardening** — `[requires validation]` audit the live bucket: confirm it exists, confirm the legacy public-read policy is gone; add retention/cleanup for orphaned uploads and failed analyses; document the third-party processing chain (Supabase → Lovable gateway → Google) for district DPAs; stop sending the image as client-provided base64 and instead have the function read from storage (removes trust in client bytes and enables magic-byte checks). — security/privacy, district use.
9. **Re-examine credential derivation** — the downloadable "fluency certificate" minted purely from an AI reading of a user-supplied image is spoofable (§8.2c). Keep the certificate feature, but gate it on corroborating evidence (e.g., transcript + in-app certification attempt) or label it "based on self-submitted documents." `[observed mechanics; policy proposal]` — pedagogy, integrity, district trust.
10. **Observability & cost accounting** — structured logs/metrics per run (duration, model, token usage, parse success, insert success), an `analysis_runs` audit trail, and alerting on failure-rate spikes; today the only telemetry is `console.log`. `[observed]` — maintenance, cost.
11. **Fix small learner-facing bugs** — previous-score comparison (`StudentAnalysisView.tsx:141`), localize `TranscriptUpload` strings through the i18n system (§2.1), eliminate the dead `getPublicUrl`/`analysisRecord` code (`TranscriptUpload.tsx:139-168`), delete or wire up `fileValidation.ts`. `[observed]` — maintenance, equity.
12. **Decide the fate of orphaned pieces** — `analyze-progress`, `generate-study-recommendations`, `study_recommendations` table: either wire the recommendations loop into the results UI (it fits P2's recommendations field and the platform's route-referencing prompts) or remove them; keeping dead paid-AI endpoints deployed is attack/cost surface. `[observed]` — maintenance, security.

---

## 12. Concern cross-reference (per major finding)

| Finding | Scalability | Pedagogy | District/School | Security/Privacy | Maintenance |
|---|---|---|---|---|---|
| PDF rejected server-side (§3.1) | — | Learners blocked from primary format | Districts often only have PDFs | Orphaned PII bytes | Contract drift |
| JSONB unpack break (§6.3) | — | Learners lose all detailed feedback | Teacher views empty | — | Type-cast hides break |
| Teacher RLS gap (§6.2/7.2) | N+1 queries moot while 0 rows | Teachers can't act on evidence | Core district feature dead | Over-restriction (safe direction) | Silent empty states |
| Silent insert failure (§5) | — | Lost learner history | Wrong averages | — | Undetectable data loss |
| `teacherId` unverified export (§7.2) | — | — | Roster PII exposure | **High** (FERPA) | — |
| Cert-from-upload spoofability (§8.2) | — | Credential integrity | District trust in reports | Forgeable credential | — |
| No idempotency/status (§5) | Duplicate AI spend | Confusing failures | — | — | No audit trail |
| Bucket/policy uncertainty (§4) | — | Upload may fail at step 1 | — | Possible public PII | Needs live audit |

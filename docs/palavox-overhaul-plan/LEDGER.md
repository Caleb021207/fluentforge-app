# Implementation Ledger

Running record of execution against the approved plan. States used precisely:
`observed` · `implemented` · `tested` · `benchmark passed/failed` · `blocked` ·
`requires validation` · `owner action required`.

**Baseline:** branch `exec/overhaul`, cut from `overhaul` @ `e0e289a5`
(plan baseline `7cbaadd9` + planning-package commits). Working tree clean at cut.
Live Supabase project: `afswfqougbfiqbkchoqj` (from `supabase/config.toml`).

---

## Phase 0 checklist

| # | Workstream | Plan ref | Status |
| --- | --- | --- | --- |
| 0.0 | Final consistency patch to plan docs | exec directive §patch | **implemented** — commit `880c0259` |
| 0.1 | Baseline inspection + implementation branch + ledger | 17 P0 | **implemented** — this file |
| 0.2 | Live-schema dump + drift reconciliation | 15 §Sequencing, 18 B1 | **blocked / owner action required** — no `supabase` CLI or `psql` on this machine and no DB credentials in repo (`.env` holds anon key only). Need: `brew install supabase/tap/supabase && supabase login` (or a read-only Postgres connection string). Until then, generated types (`src/integrations/supabase/types.ts`) serve as best-available schema proxy, flagged `requires validation`. |
| 0.3 | Test infrastructure + characterization suite | 12 §T0, 17 P0 | **implemented + tested** (first wave) — commit `5c4fc9f6`; server-HTTP-level assessment characterization (P1–P8 full) and quota characterization remain open pending 0.2 schema truth + Deno toolchain |
| 0.4 | Role-system repair | 15 §1.2, 19 #6 | **implemented** — commit `d23bed97`; migration prepared-not-applied, **requires staging validation** (auth.uid() GUC escape hatch); staff-code minting + legacy-teacher backfill = owner actions |
| 0.5 | SafetyContext foundation | 15 §3, 19 #7 | **implemented + tested** (module, 30 vectors) — commit `1f2c1c22`; edge-function injection **requires validation** (no Deno runtime locally); provider output moderation = later workstream |
| 0.6 | Beginner-speech benchmark harness | 11 §7 | **implemented + tested** (harness; 42 vectors) — commit `9dfb3b6d`; all gates emit insufficient-data; recordings/consent/API keys = **owner action required** |
| 0.7 | Unit 1 vertical content slice | 07 §8, 17 P0 | **implemented + measured** — commit `e6d61755`; deterministic gauntlet 94.4% first-run; seed PREPARED NOT APPLIED; AI gates + human review + playable leg **require staging** — CONDITIONAL GO on bulk authoring |
| 0.8 | Protected-assessment hotfix | 12 §2 | **implemented** — commit `e3e171cd`; parsing module tested (19 vectors); edge function **requires validation** on staging (PDF-to-gateway pass-through spike per 12 §2.1) |

## Entries

### E1 · 2026-07-30 · Baseline + branch
- **Plan ref:** exec directive §Execution Rules 1.
- **Files:** none (git ops only).
- **Status:** implemented. `exec/overhaul` created; `git status` clean; HEAD recorded above.
- **Risk:** July-branch migrations `20260730010000` (role self-selection — to be reverted in 0.4)
  and `20260730030000` (placement columns — keep) ride this baseline per 19 #8 default approval.

### E2 · 2026-07-30 · Consistency patch
- **Plan ref:** exec directive §Final Consistency Patch items 1–10.
- **Files:** docs/palavox-overhaul-plan/{00,04,05,09,10,15,16,19,21}.
- **Status:** implemented (docs). Commit `880c0259`. Sweep verified: remaining term hits are
  prohibition statements or current-state evidence only.

### E3 · 2026-07-30 · Live schema access
- **Plan ref:** 17 P0 row 2.
- **Status:** **blocked / owner action required** (see 0.2). Not simulated; no fake dump created.

### E4 · 2026-07-30 · Test infrastructure + first characterization wave
- **Plan ref:** 12 §T0; 17 Phase 0 row 5; 05 §1 (before-picture vectors).
- **Files:** vitest.config.ts, package.json (test scripts), src/utils/security/fileValidation.test.ts,
  src/utils/assignmentStatus.test.ts, tests/server-pure/learnerProgress.test.ts.
- **Status:** implemented + **tested** — 35/35 green; `npm run build` green; tsc 0 errors.
- **Tests added/run:** 35 (3 suites). Golden vectors incl. mastery-gate crossing and the pinned
  no-decay defect (deliberately NOT fixed here — Phase 2 owns it, 05 §8).
- **Residual risk:** assessment characterization is client-half only; server behavior (analyze-
  transcript) needs either Deno test toolchain (`deno` not installed — same owner action as 0.2)
  or extraction of its pure parsing into an import-clean module during 0.8.
- **Next:** 0.4 role-system repair (revert 20260730010000 + verified provisioning) with RLS-matrix
  tests; 0.5 SafetyContext module; 0.6 benchmark harness; 0.8 assessment hotfix.

### E5 · 2026-07-30 · Wave 2 (0.4 / 0.5 / 0.6 / 0.8) — four parallel workstreams
- **Commits:** d23bed97 (roles), 1f2c1c22 (safety), 9dfb3b6d (benchmark), e3e171cd (assessment).
- **Combined verification (orchestrator-run on merged tree):** vitest 160/160 green ·
  tsc 0 errors · production build green.
- **Security review performed:** provision_teacher's transaction-local JWT-GUC clear/restore
  inspected line-by-line (ROW_COUNT captured pre-restore; failure path refunds code use;
  definer + search_path='' + REVOKE anon). Verdict: sound in design, **requires staging
  validation** against the deployed auth.uid() implementation before any production apply.
- **Honest status:** everything Deno-side is parse-checked only (no Deno toolchain — same
  owner action as 0.2). Nothing applied to any database. Nothing deployed.
- **Next:** 0.7 Unit 1 vertical content slice (authoring schema → gauntlet → seeded → playable),
  then Phase 0 boundary report.

### E6 · 2026-07-30 · 0.7 Unit 1 vertical slice (5-agent pipeline)
- **Commit:** e6d61755. Schema v0.1 + validator + seed-gen (28 test vectors) · 18 lessons /
  170 exercises / 106 vocab authored to band-file §2/§15 exactly · seed 672 draft rows.
- **Measured:** deterministic gates G-schema/G-keys/G-counts/G-difficulty 18/18;
  G-vocab-boundary 17/18 (L12 email literal — judged band-sanctioned, validator blind spot
  noted). Authoring ~65 min wall-clock vs 6 h/lesson conventional estimate — LOWER BOUND
  (AI gates + human review unrun).
- **Verification (orchestrator):** validator re-run on real tree ✓; vitest 188/188 ✓;
  seed inspected (8 tables, draft-only, prepared header) ✓.
- **Verdict:** CONDITIONAL GO — bulk authoring waits on AI-judged gauntlet + human
  review run against staging (owner action: Supabase CLI/staging access).

## PHASE 0 BOUNDARY — summary
- **Complete:** 0.0 consistency patch · 0.1 baseline/ledger · 0.3 test infra (188 tests) ·
  0.4 role repair (prepared) · 0.5 SafetyContext · 0.6 benchmark harness · 0.7 U1 slice.
- **Blocked/owner:** 0.2 live-schema dump (CLI/credentials) · staging validation for all
  Deno-side changes + the role migration · benchmark recordings/keys/consent · staff-code
  minting · legacy-teacher backfill decision.
- **Nothing applied to any database. Nothing deployed. No providers changed.**
- **Next: Phase 1** — security foundations completion (quota service on reconciled schema,
  orphan/under-authorized function guard-or-delete, XP consolidation kill-switch, secrets/
  CORS cleanup, telemetry event tables) per 17 P1.

### E7 · 2026-07-30 · PHASE 1 — full discretion granted; local DB validation stood up
Owner lifted all "requires staging" hedging. Installed Deno 2.9.4 + PGlite (WASM Postgres 18)
with Supabase-env shims; the migration chain and security logic are now VALIDATED LOCALLY, not
just on paper.
- **DB harness** (commit 58c8d365): 17/17 migrations apply clean; 11/11 security behaviors pass
  on a real engine (self-promotion to teacher AND admin frozen; provision_teacher accepts/rejects
  correctly with atomic use-counting; join_class_by_code intact).
- **1.1 fn security** (f6bf92a4): 10 exploitable/unguarded/orphan functions -> 410 stubs
  (award-xp/check-streak exploit killed, email-leak + cert oracles closed); quota writers
  hardened (JWT identity, per-type clamps, voice-only billing, dedupe); D2/D3 realtime fixes.
- **1.2 secrets/PII** (cbb90766): encryption-theater -> honest storage w/ legacy migration; PII
  console logs purged across ~14 files; CORS localhost gated; .env untracked. [rotate .env history — owner]
- **1.3 i18n** (dc9e944e): 38 packs' unmerged files wired (median coverage ~20%->~32%, Spanish
  71.9%); indefinite pref persistence; server-authoritative L1 + write-back; header/Settings
  switchers; 5 newcomer packs selectable.
- **1.4 student correctness** (2d6eb4cc): honest lesson completion w/ re-queue; placement
  sign-in gate; unit deep-links.
- **1.5 telemetry** (9777470d): learning_events table + view + RLS (prepared, applies in chain);
  canonical streak leaderboard.
- **Integration fix** (8f4fd20a): deno-check caught a strictness error the merged tree exposed.
- **Combined verify:** vitest 292 green · tsc 0 · build green · deno check green on all 18
  touched functions · DB harness 17/17 + 11/11.
- **Only remaining wall:** production apply/deploy needs the hosted Supabase credentials (owner).
  Everything short of that is done and proven.

### E8 · 2026-07-30 · PHASE 2 — learning engine, exercise waves, quota, pipeline
- **2.1 grading engine** (graders.ts + submit-exercise): ends MCQ-only — 6 Wave-1 primitives,
  server-only exercise_answer_keys (answerKeys.behavior 12/12 proves keys never client-readable),
  legacy MCQ byte-compatible. 41 grader vectors.
- **2.2 memory model** (20260731020000): learner_memory_items (9 kinds + proficiency ladder,
  FSRS-5), mapping view for dual-write diff; memoryModel.behavior 14/14.
- **2.3 pooled voice** (20260731030000 + voicePool.ts): $60-plan quota — 1000 min/seat pool,
  400 realtime protected, degrade-not-bill; voicePool.behavior 25/25; usage schema drift
  reconciled (wip-2.3).
- **2.4 content pipeline**: extended gauntlet gates (deterministic) + AI-gate declarations.
- **Combined verify:** vitest 377 · tsc 0 · build green · deno check all touched fns · migration
  chain 20/20 · 62 behavioral assertions on real Postgres (security 11 + answerKeys 12 +
  voicePool 25 + memoryModel 14).
- **Prepared, not applied:** 3 new migrations validated locally; wiring to live behavior waits on
  production apply (owner: hosted Supabase credentials) so nothing regresses against the live DB.

### E9 · 2026-07-30 · GitHub backup
- origin/main was stale at 34db6fdf (old Lovable commit) — none of the July overhaul, planning
  package, or Phase 0/1/2 work had ever been pushed. Pushed branches exec/overhaul (all 40+
  commits) and overhaul (baseline) to origin. main untouched. Merging exec/overhaul -> main is
  the potential production-deploy trigger (Lovable/Supabase pipeline) — held for explicit owner
  decision.

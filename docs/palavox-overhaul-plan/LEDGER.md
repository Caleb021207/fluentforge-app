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
| 0.7 | Unit 1 vertical content slice (authoring schema → gauntlet → seeded → playable) | 07 §8, 17 P0 | pending |
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

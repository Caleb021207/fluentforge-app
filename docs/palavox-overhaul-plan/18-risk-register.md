# 18 · Risk Register

Risks are scored Impact × Likelihood (H/M/L). "Owner" = decision or budget needed from the
owner; "Plan" = mitigated by plan design; "Validate" = requires measurement before commitment.
Sources: discovery audits (01, 02, wip-*), design docs (05–15), voice research (11).

## A. Security & safety (pre-existing, in production today)

| ID | Risk | I×L | Mitigation | Type |
|----|------|-----|------------|------|
| A1 | Self-promoted "teacher" reads any student's PII/grades via email enrollment (wip-15a G1) | H×H | Phase 0: re-freeze role, verified teacher paths, tenant-guard rosters (15 §Roles) | Plan |
| A2 | `safety_mode`/`is_minor` never reach AI behavior; no output moderation; no crisis path | H×H | Phase 0: server-resolved SafetyContext, fail-closed strict, layered moderation (15 §safety) | Plan |
| A3 | Exploitable XP endpoint + unsigned-JWT streak fn inflate teacher-visible metrics | M×H | Phase 0: retire legacy endpoints (03 row 12) | Plan |
| A4 | Under-authorized service-role functions (roster export, cert oracles, student-email reads) | H×M | Phase 0 guard audit (15 §R4) | Plan |
| A5 | Protected assessment flow silently fails (PDF rejection, stub persistence) — trust damage with schools | H×H | 12's repair plan, characterization tests first | Plan |
| A6 | LLM-minted "ACTFL Advanced Low" certificates create a false-credential liability | H×M | Claims policy (wip-03a); disposition is an owner decision (19 #4) | Owner |

## B. Technical architecture

| ID | Risk | I×L | Mitigation | Type |
|----|------|-----|------------|------|
| B1 | Migrations vs live DB schema drift — repo cannot predict quota/roster behavior | H×H | Dump live schema before ANY DDL (15 §Sequencing); reconcile as Phase 1 gate | Plan |
| B2 | Supabase Deno cannot host realtime agent workers — new infra component (LiveKit or self-host) adds operational surface | M×H | 11 §Hosting: managed first, OSS self-host preserved as exit | Plan |
| B3 | Voice provider bets fail beginner/child speech (no vendor publishes L2/child WER) | H×M | Benchmark-gated migration; go/no-go thresholds (11 §7: ≤12% EN / ≤14% ES WER, equity bound ≤1.4×) | Validate |
| B4 | Gemini Live concurrency contradiction (docs 1,000 vs enforced ~50) blocks the cheapest S2S | M×M | Not on critical path; Pattern D primary doesn't depend on it | Plan |
| B5 | School networks (filtered UDP, proxies) break WebRTC | H×M | TURN/TLS-443 fallback + Pattern F text floor; pilot network test | Validate |
| B6 | No test infrastructure exists — every refactor is uncharacterized | H×H | Phase 1: test runner + characterization tests before behavior changes (12 §T0) | Plan |
| B7 | The July 2026 `overhaul` branch (UI + fixes + 6 migrations) is committed but undeployed/unreviewed — divergence from production grows | M×H | Owner decision on disposition (19 #8) | Owner |

## C. Curriculum & pedagogy

| ID | Risk | I×L | Mitigation | Type |
|----|------|-----|------------|------|
| C1 | Content production at ~480 lessons × 2 directions overwhelms authoring capacity or budget | H×M | Gauntlet-gated generation pipeline + vertical-slice-first (07/08 workload estimates); phased authoring | Plan |
| C2 | Lesson counts/hours drift into marketing fiction (10-min lessons ≠ instructional hours) | M×M | Time accounting by activity type is contractual in analytics (wip-03a §2) | Plan |
| C3 | Interaction contracts on paper but conversations degrade into decorative chat in practice | H×M | Mission contracts are machine-enforced (09); SLA reviewer + skeptical review challenge this specifically | Plan |
| C4 | L1-parameterized contrastive content quality varies wildly across 41 L1s | M×H | Tiered localization (13 §5): priority L1s human-reviewed, tier-3 glosses-only until reviewed | Plan |
| C5 | A2 "definition of done" gets conflated with CEFR certification claims | H×M | Claims policy separation (wip-03a §3); graduation ≠ credential | Plan |

## D. Commercial & institutional

| ID | Risk | I×L | Mitigation | Type |
|----|------|-----|------------|------|
| D1 | No billing exists; institutional licensing/invoicing unbuilt (price is fixed and flat at $60/activated-student/yr, no discounts — 16 §10, 19 §5) | M×H | Build institutional billing in Phase 6 alongside district systems | Plan |
| D2 | District sales blocked on tenancy/consent/audit gaps regardless of product quality | H×H | 14's five-bucket gap analysis sequences this; no pilot before the 12 pre-pilot items | Plan |
| D3 | Voice COGS drift (routing skewing toward realtime beyond the funded floor) erodes margin | L×M | Pattern-D router config + pooled allowances + soft-degrade (16 §7); margin is 88–95% even under heavy usage, so this is a monitoring concern, not an existential one | Plan |
| D4 | Rostering/SSO expectations (Clever/ClassLink) exceed MVP | M×H | OneRoster CSV baseline first (14 §2) | Plan |

## E. Program/process

| ID | Risk | I×L | Mitigation | Type |
|----|------|-----|------------|------|
| E1 | Session interrupts / usage limits killing long agent runs (observed twice in planning) | L×H | Workflow resume-from-cache discipline; artifacts write-as-you-go | Plan |
| E2 | Plan approved wholesale without the owner making the load-bearing decisions | H×M | 19 enumerates decisions; roadmap Phase 0 blocks on them | Owner |
| E3 | Scope creep: rebuilding healthy systems (grading spine, gauntlet, brand) instead of reusing | M×M | 01 §3 strengths list is explicit; skeptical reviewer checks for it | Plan |

## Highest-risk assumptions (carried into 21)

1. Beginner/child L2 speech recognition meets the WER thresholds on real pilot audio — **untested**.
2. The live database matches neither migrations nor types; true quota/roster behavior unknown until dumped.
3. Institutional *usage* assumptions — 65% engagement rate, voice minutes per engaged student,
   and the native-real-time share of speaking time — are unvalidated and drive every margin line
   (price itself is fixed and flat at $60/activated student — not a variable, per 19 §5).
4. LiveKit Scale's 600-concurrent envelope behaves as documented under synchronized-classroom bursts.
5. Curriculum production estimates (hours/lesson) hold once the gauntlet's rejection rate on generated content is measured.

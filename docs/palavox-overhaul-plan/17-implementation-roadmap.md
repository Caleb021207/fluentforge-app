# 17 · Implementation Roadmap

Dependency-aware plan. Roadmap **direction** (Option B) is approved per 19 #10; staffing/cost
detail below is still open. Effort units: senior-engineer-weeks (ew) and content person-hours
(ch); all [estimated] with the assumptions in §5. Sequencing rules inherited from the design
docs: live-schema dump before any DDL (15); characterization tests before behavior changes
(12 §T0); security Phase 0 before feature work (15); benchmark gate before voice migration
(11 §7); vertical content slice before bulk authoring (07/08).

## 0. What AI-accelerated founder-led development changes — and what it doesn't

The phase effort figures below (§§Phase 0–8) assume conventional professional staffing (2–3
engineers, 2–3 curriculum writers, a review pool) and are the right basis for a
**fully-validated, district-production-ready** system. They are not a prediction of what a
founder building solo with heavy AI assistance (Claude Max / agent-based development, Lovable,
AI-assisted curriculum drafting) will actually spend — that path is faster and cheaper on the
work AI genuinely accelerates, and unchanged on the work it cannot touch.

**Compresses significantly under AI-accelerated founder-led development:**
- Engineering implementation of the designs in 04–06, 09–10 (the specs are already
  implementation-ready; a capable agent-assisted developer executes them far faster than a
  from-scratch design-then-build cycle).
- First-draft curriculum generation against the authoring schema and content gauntlet (07 §10 /
  08 §11's authoring-hour estimates assume human-only drafting; generation-assisted drafting was
  already flagged there as a 30–50% reduction candidate, [requires validation] at the P0 slice).
- Routine refactors, test scaffolding, documentation, and migration authoring.

**Does not compress — these are fixed, real-world costs regardless of who or what writes the
first draft:**
- **Reviewing and validating ~3,600 curriculum items** (both directions combined) — answer
  keys, distractors, translations, audio, progression dependencies. A human (or a second,
  independent AI review pass treated as a human-equivalent gate) must check every one against
  the gauntlet and the unified schema; this is a fixed volume of judgment calls, not typing.
- **Beginner and child speech-recognition validation** (11 §7) — requires real consented
  recordings from the actual learner population; no amount of engineering speed produces that
  data faster.
- **Privacy and security verification** (15) — the role-system fix, safety enforcement, and
  tenancy migration need real adversarial testing, not just code that matches the design.
- **Running a classroom pilot** (14 §7) — calendar time with real students and teachers; cannot
  be parallelized away.
- **Human review across priority learner languages** (13) — L1 contrastive content and
  translation quality require native-speaker judgment per language.

**Practical implication:** treat this roadmap as two tracks that can be pursued in either order
or in parallel, decided once the P0 vertical slice reports real gauntlet pass-rates and
review load:

| Track | What it produces | What it does *not* produce |
| --- | --- | --- |
| **Founder-built, pilot-ready** | A working system on one ESL band (or similar narrow slice), enough content to run the Phase 8 classroom pilot, core security/safety fixes in place | District-scale content coverage, full localization, validated speech-recognition quality at scale, formal review trail across languages |
| **Fully-validated, district-production** | Everything in the phase table below, at the effort/calendar figures stated | — this is the target state for paid district deployment |

The pilot-ready track can plausibly move at a fraction of the stated engineering-week figures;
the fully-validated track should still be estimated at the conventional-staffing figures below,
because the parts that don't compress (content review volume, speech validation, security
testing, pilot calendar time) dominate its actual cost and duration.

---

## Phase 0 — Owner decisions + proofs of concept *(2–4 wk, mostly parallel)*

| Work | Deliverable | Effort |
| --- | --- | --- |
| Owner decisions 1–12 (19) | signed decisions | owner |
| Live-schema dump + drift reconciliation report | schema truth baseline | 1 ew |
| Beginner-L2 speech benchmark harness + consented recordings | go/no-go data for 11 §7 gates | 2–3 ew |
| Vertical content slice: 1 ESL unit (U1) through authoring schema → gauntlet → seeded → playable | measured gauntlet pass-rate, h/lesson actuals | 2 ew + 150 ch |
| Test infrastructure (runner + first characterization tests: assessment flow P1–P8, grading, quotas) | CI green baseline | 2 ew |

**Blocks everything.** Exit: decisions signed; benchmark data collected; slice metrics inform C1/E-costs.

## Phase 1 — Security foundations + architectural spine *(4–6 wk)*

Critical security (15 §Phase 0 backlog): re-freeze role + verified teacher paths (R1); safety_mode
SafetyContext enforced at every AI call + moderation + crisis runbook (R2); guard/delete
under-authorized + orphan functions (R4, 03 row 29); secrets/CORS/encryption-theater cleanup (R8);
kill award-xp/check-streak exploits via System-A consolidation stubs (05 §7).
Plus: unified quota service on reconciled schema; telemetry/event tables (wip-03a); July-branch
disposition executed (19 #8). **Effort ≈ 10–14 ew.** Exit: pre-pilot security items (14) green.

## Phase 2 — Learning engine + content infrastructure *(6–9 wk, overlaps P1 tail)*

`learner_memory_items` unified FSRS model + server-derived grading (05); `submit-attempt` grading
service + answer-key table + renderer shell + **primitive Wave 1** (cloze, retrieval, sentence
construction, meaning recognition, error-spot — ends MCQ-only with zero new vendors) (06);
content pipeline productionized from the P0 slice (authoring schema, gauntlet extensions, seeder
unification); L1 gloss table + locale registry + free-win pack wiring (13). **≈ 12–16 ew.**

> **Amendments from the skeptical review (20):** Phase 3 entry requires the validator's
> D1–D5 + counting-policy fixes and the S1 listening-floor/hours-wording corrections applied to
> 07/08; Phase 4 entry adds AI-rater calibration as a blocking dependency (n≥100 double-rated,
> κ≥0.7, drift monitoring); 05's memory-kind rollout is phased (vocab/chunks/grammar/errors
> first; phoneme kinds with the Azure-PA wave).

## Phase 3 — A1 curriculum + embedded interaction *(8–12 wk engineering-light, content-heavy)*

ESL Units 1–6 + Checkpoint 1 authored/generated/gated (~2,600 ch); mission runtime v1
(text-first contracts per 09) + primitive Wave 2 (listening, dictation) + Azure PA drills behind
benchmark gate; Spanish Units 1–6 start (staggered −4 wk, ~1,400 ch); voice Pattern C for drills.
**≈ 8–10 ew + ~4,000 ch.** Exit: an absolute beginner completes A1 end-to-end with embedded
written+spoken interaction.

## Phase 4 — A2 + conversational progression *(8–12 wk)*

ESL Units 7–12 + Checkpoint 2 + graduation experience; guided→open conversation runtime on
Pattern D (LiveKit component stood up; OpenAI path as control per 11 §6.3); error→review
pipeline live (05 §6); Spanish A2 authoring continues. **≈ 10–14 ew + ~4,500 ch.**

## Phase 5 — Post-course conversation-led system *(4–6 wk)*

Graduation evaluation + outcome routing; post-course home (missions, interests, adaptive
listening, targeted writing); micro-lesson remediation loop; B1 ramp triggers (10). **≈ 6–8 ew.**

## Phase 6 — Teacher + district systems *(6–10 wk, parallelizable with 4–5)*

Tenancy model migration (15 §1, staged + characterization-tested); consolidated assignments with
submission tracking (03 rows 13–14); teacher dashboard redesign + needs-grading queue +
accommodations flags (14); OneRoster CSV import + Google SSO; assessment teacher-visibility
restoration (12); reporting pack (wip-03a §4). **≈ 12–16 ew.**

## Phase 7 — Localization, accessibility, performance, hardening *(4–6 wk, overlaps 6)*

Core-surface i18n remediation + ICU migration + RTL + fonts (13); WCAG pass on learner core;
school-network/Chromebook performance; degraded modes; DSAR/retention flows (15 §4); load tests
to Scale-tier envelope. **≈ 8–12 ew.**

## Phase 8 — Pilot, measure, revise, roll out *(6–8 wk)*

One-classroom ESL pilot per 14 §7 (entry-gated, hard-fail on data-visibility incidents);
benchmark reconciliation (cost estimator ±10%, latency, WER); content fixes from pilot telemetry;
district-paid gate review (14 bucket 2); institutional billing/licensing live. **≈ 4–6 ew + iteration.**

---

## 3. Three options compared

| | **A · Lean pilot** | **B · Recommended production path** | **C · Aggressive full build** |
| --- | --- | --- | --- |
| Scope | ESL A1 only (U1–6), text+drill voice (Pattern C), 1 classroom pilot; Spanish + A2 + district deferred | Everything above, phased; ESL leads Spanish by ~4 wk; district-ready after P6 | Both directions + district in parallel teams |
| Team [assumption] | 1–2 eng + 1 curriculum lead + contract writers | 2–3 eng + 2–3 writers + review pool | 4–6 eng + dual curriculum teams |
| Calendar | **~4–6 mo to pilot** | **~9–11 mo first paid school · ~12–15 mo district-sellable** | ~8–10 mo to both, compressed |
| Cost (eng + content, [estimated]) | ~$180–280k | ~$600–900k | ~$900k–1.4M |
| Technical risk | Low (defers voice migration) | Medium (gated) | High (parallel migrations, thin review) |
| Curriculum risk | Medium (A1 only proves half the thesis) | Low–medium (slice-gated) | High (review pool thins) |
| District readiness | Not attempted | Full path | Rushed procurement risk |
| Revenue readiness (institutional) | Pilot only, unbilled | First paid deployments in-year | Faster but higher delivery risk |
| Maintainability | Debt if A2 greenlit later | Best | Integration debt likely |

**Recommendation: B.** A is attractive only if funding requires a pilot artifact in <6 months —
its deferred voice migration and missing A2 mean the conversation-first thesis stays unproven.
C's parallelism multiplies exactly the risks (provider bets, content quality, tenancy migration)
that the gates exist to contain.

## 4. Rollback strategy (all options)

Every phase lands behind flags with its predecessor as control: voice per 11 §6.4 triggers;
engine migrations dual-write with nightly diff + old-column retention (05 §8); tenancy staged
with characterization suite; content versions immutable (draft→gated→operational already).
Kill-switch: any phase reverts to previous stable in <1 day [proposed acceptance criterion].

## 5. Estimate assumptions (no false precision)

Senior-eng week ≈ 1 experienced full-stack person; content hours from 07 §10 / 08 §11 with the
±30–50% generation-assist uncertainty unresolved until P0; calendar assumes 70% focus factor;
costs at $45–75/h content, $150–200k loaded/yr engineering [assumption]; provider prices as of
2026-07-30; nothing here is a commitment — P0 exit re-baselines all downstream estimates.

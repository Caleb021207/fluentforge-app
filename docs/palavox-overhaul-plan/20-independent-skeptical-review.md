# 20 · Skeptical Review

**Process disclosure:** the owner directed that this pass be performed by the principal planning
architect (me) rather than an independent agent, to conserve usage capacity. That weakens
independence; to compensate, this review (a) leans on the two adversarial inputs that *were*
independent — the cross-course validator (`wip-07-08-consistency-report.md`, 22 ranked defects)
and the learning-science reviewer (`wip-20a-learning-science-review.md`, S1/S2/S3 findings) —
and (b) includes a conflict-of-interest disclosure (§G). Where I accepted criticism, the
required change is recorded here and reflected in 21; curriculum-content fixes become
**pre-authoring entry conditions** on roadmap Phases 0/3/4 rather than silent edits to the maps.

---

## A. Curriculum — verdict: sound with mandatory revisions

**Accepted, severity-1 (must fix before any authoring):**
1. **Listening comprehensibility floor.** 07's ≥70% known-vocabulary floor for passages
   contradicts the comprehension research (Hu & Nation 2000; van Zeeland & Schmitt 2013 —
   ~95–98% coverage needed) and was independently flagged by both reviewers (SLA S1-1 ≡
   validator D5). **Required:** adopt 08's banded 95/93/90 floors in 07; floor becomes
   per-course config under the unified schema.
2. **Hours honesty.** 07's ~117 h median to "strong A2" sits far below the 180–200
   guided-learning-hour conventions and carries no L1-distance adjustment (SLA S1-2). The
   owner's 100–165 h remains the *design envelope*, but **required:** publish per-L1-tier
   percentile ranges, fix 07's false "range 95–150 inside the 100–165 envelope" sentence (D8),
   pilot-gate any public time-to-ability statement, and never market hours as instructional
   equivalency (already claims-policy; now cross-referenced).

**Accepted, major (pre-authoring conditions):** D1 unified authoring schema v0.1 is the single
contract (both maps repoint); D2 recompute 08's arithmetically impossible per-lesson load
ceilings; D3 unify vocabulary counting policy on 08's (07 restates 1,800 with its
productive/recognition split shown); D4 16-field interaction contract with non-empty
`failure_handling`; SLA S2 items — U8 formulaic past preview + U7–U8 receptive planting;
checkpoint accuracy sub-bars on 3sg-s/do-support demoted to monitored trends (processability
research); **AI-rater calibration elevated to a blocking dependency** (n≥100 double-rated
samples, κ≥0.7, drift monitoring) — added to Phase 4 entry criteria.

**Accepted, moderate/minor:** validator D6–D22 (enum unifications, id regimes, cognate-status
placement, arithmetic slips, config-not-constant declarations) — mechanical; bundled into the
Phase 3 content-pipeline setup ticket. SLA S3 advisories (prompt-escalation alongside recasts,
fluency strand, review-time budget reconciliation, /θ/ lab vs intelligibility policy) —
accepted as authoring-guideline amendments.

**Rejected / defended:** the ~220–228 core-lesson counts vs the ~240 working target — both maps
documented the deviation with quality rationale exactly as the owner instructed; padding to a
number would be Duolingo-imitation. The SLA certified the mission design as genuinely TBLT and
found Duolingo residue only at platform level (XP/streaks/leaderboard) — already being
consolidated, and never feeding proficiency claims.

## B. Voice & cost — verdict: sound, validation-gated

Marketing-acceptance audit: 11 consistently separates [documented]/[reported]/[estimated];
the Gemini enforced-concurrency contradiction was surfaced, not smoothed; the ElevenLabs
historical cap was checked against current docs rather than assumed. My cross-checks: 07 §10.4
per-session costs reconcile with 11's per-minute math; one clarification recorded — **in-course**
open conversation runs the cascade (09 §O-3) while realtime-mini is reserved for post-course/
premium (11), which is consistent but must stay explicit in the router config. Sensitivity: if
late-A2's 30% open share dominated MAU mix, blended COGS rises ~45% (16 §5) — steady-state MAU
skews early-band, so the blend holds [assumption, flagged]. The classroom-burst and beginner-WER
gates (11 §7) remain the two make-or-break validations; **no voice migration decision is final
until they pass — correctly gated.**

## C. District — verdict: honest about distance

The five-bucket gap analysis does not pretend readiness; pre-pilot gate correctly blocks on the
role/safety fixes. Watch-item added: security-questionnaire/SOC2-style posture is unaddressed
(fine pre-pilot, needed for paid districts — noted in 14's bucket 2 by reference). Rostering
scope (OneRoster CSV first) resists integration sprawl appropriately.

## D. Protected assessment — verdict: preserved

12 defines anti-requirements; 10's graduation certificate carries exact permitted/forbidden
language and contract-tested storage separation from `transcript_analyses`; 04's provenance
panel keeps evidence types distinct. The SLA's catch that current certificates claim CEFR
evidence without measuring reading strengthens decision 19 #4 (strip claims) — no conflict
with the protected flow.

## E. Complexity attack — one trim ordered

Challenged as possible over-engineering: the 9-kind memory model (05), Beta-posterior mastery,
22 primitives, unified schema, tenancy rebuild. Findings: primitives are already wave-gated;
Beta-posterior fixes a real never-decay defect; schema v0.1 is the *anti*-complexity move
(prevents two content pipelines); tenancy is Phase-6-gated. **Accepted trim:** memory-kind
rollout phased — vocab/chunks/grammar/error-patterns first; pronunciation-target and
phoneme-contrast kinds land with the Azure-PA wave, listening/writing micro-targets only when
their evidence sources exist. Recorded as an amendment to 05's migration plan.

## F. Assumption inventory — confirmed explicit

The five load-bearing unknowns (18 §final): beginner-WER, live-schema truth, price tolerances,
classroom burst behavior, gauntlet pass-rate. All carry validation plans; none are silently
load-bearing. False-precision check on 16/17: estimates carry assumptions and re-baseline at
P0 exit — pass.

## G. Conflict-of-interest disclosure

This plan preserves substantial July-2026 work authored by the same agent writing this review
(UI system, fixes, six migrations). Mitigations: the data-security specialist independently
recommended **reverting one of those migrations** (`20260730010000`, role-selection) and the
plan adopts that reversal (19 #6); the July branch's disposition is an explicit owner decision
(19 #8), not an assumption; and the quarantined WIP engine branch is superseded by 05/06 rather
than merged. The residual bias risk is that current-stack retention (Supabase/React) received
less challenge than provider choices did; noted for the owner.

## Verdict

**Plan approved-with-revisions by this review.** No finding blocks the recommended direction;
every accepted finding is bound to a roadmap gate: S1 fixes + D1–D5 + counting policy →
Phase 0/3 content-pipeline entry; rater calibration → Phase 4 entry; memory-kind phasing →
05 amendment; hours-claims policy → immediate wording fixes (07 §1/§7, 19 #3). 21 reflects all
of the above.

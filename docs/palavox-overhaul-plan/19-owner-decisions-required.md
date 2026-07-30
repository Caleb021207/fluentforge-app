# 19 · Owner Decisions

Numbering is stable and cross-referenced throughout the plan (other docs cite "19 #6" etc.) —
**do not renumber**, even as items move from open to approved over time.

Four items are **already settled** by explicit owner direction and are recorded here as
**approved directives**, not open questions — an implementation agent should treat them as
fixed and not reopen them. The remaining items still need your call.

| # | Decision | Status |
| --- | --- | --- |
| 1 | Overall product direction | ✅ **APPROVED** |
| 2 | Voice architecture and providers | Open — benchmark-gated |
| 3 | Curriculum scope | ✅ **APPROVED** |
| 4 | Certificates disposition | Open |
| 5 | Pricing & packaging | ✅ **APPROVED** |
| 6 | Role-system repair | Open |
| 7 | Safety enforcement scope | Open |
| 8 | July-branch disposition | Open |
| 9 | Pilot commitment | Open |
| 10 | Roadmap direction | ✅ **APPROVED** (Option B; staffing/cost detail still open — see note) |
| 11 | Localization investment tier | Open |
| 12 | Analytics/telemetry stack | Open |

---

## Approved directives (settled — do not reopen)

**1. Product direction — APPROVED.**
Conversation-first finite A1→A2 course (two directions), graduating into a conversation-led
system, per docs 04–10. Implementation should proceed against this direction without
re-litigating it.

**3. Curriculum scope — APPROVED.**
As mapped: ESL 220 core lessons (~240 scheduled sessions), 1,800 items; Spanish 228 lessons,
1,825 items; both A1/A2 splits inside your ranges with deviations documented
(validator-verified arithmetic). Hours: ~117 h (EN) / ~122 h (ES) *median design estimates
inside your 100–165 envelope* — per the skeptical review (20 §A), public time-to-ability
statements are pilot-gated and published as per-L1-tier percentile ranges, never as flat
promises (external GLH conventions run 180–200 h). Approval includes the mandatory
pre-authoring revisions in 20 §A (unified schema, listening floors 95/93/90, counting-policy
unification, load-ceiling recompute, 16-field contracts, past-tense runway) — those are
execution conditions on an approved scope, not open questions about the scope itself.
*Unblocks: content production start; Phase 3.*

**5. Pricing & packaging — APPROVED.**
**$60 per activated student per year — flat, for every institution, regardless of size.** No
volume discounts, no usage overages, no consumer plans, no freemium tiers, no alternate
per-seat rates, no minimum deployment size (16 §10). Implementation, migration, training,
customization, and other professional services may be priced separately as delivery costs —
they are not alternatives to the license price. Small pilots are negotiated as fixed-fee
engagements ($3,000–$7,500 typical), not discounted per-seat rates. Hold $60 flat through the
first district wave; earn the right to charge more later via efficacy evidence — and even then,
the plan is additional separately-priced capabilities layered on the $60 foundation, not a
different per-seat rate (16 §10).
*Unblocks: institutional billing build (Phase 6) can proceed against a fixed price.*

**10. Roadmap direction — APPROVED (Option B; detail still open).**
Recommended production path (doc 17) is the approved direction over the Lean-pilot and
Aggressive-build alternatives. **Open within this:** the roadmap's staffing/cost/calendar
figures (~$600–900k, ~12–15 months) assume conventional professional staffing and should be
read as the **fully-validated district-production estimate**, not a prediction of founder-led,
AI-accelerated build cost. See 17 §0 for the split between what an AI-accelerated founder build
can compress (engineering, first-draft content generation) and what it cannot (the ~3,600-item
curriculum review load, beginner/child speech validation, security and privacy verification,
classroom piloting, human review across learner languages) — decide staffing model once that
split is reviewed.
*Unblocks: Phase 0 can begin against Option B now; staffing-model choice can trail without
blocking Phase 0.*

---

## Open decisions

**2. Voice architecture and providers.**
Recommendation: Pattern D hybrid on LiveKit Cloud — deterministic-first + cached Azure TTS for
drills/scripted work; streaming STT → small LLM → Azure TTS for guided conversation;
`gpt-realtime`-mini reserved for native real-time open conversation; Azure Pronunciation
Assessment for phoneme scoring; benchmark-gated migration with the current OpenAI path as
control (doc 11). Alternatives: stay OpenAI-realtime-only (simpler, 2–4× voice COGS, no phoneme
data); all-cascade (cheapest, loses lowest-latency open conversation).
*Blocks: Phases 2+ voice work; the beginner-speech benchmark (11 §7) must pass before migration.*

**4. Certificates disposition.**
Recommendation: strip CEFR/ACTFL proficiency language from all in-app certificates now; rename to
"course achievement" records; formal proficiency claims remain exclusively with the protected
uploaded assessment. Alternatives: keep current certificates (carries false-credential risk, A6);
build a proctored assessment product (out of scope).
*Blocks: claims policy rollout (wip-03a); trivial engineering either way.*

**6. Role-system repair, including reverting one July migration.**
Recommendation (15): fully re-freeze `profiles.role` — which means **reverting the July 30
migration `20260730010000_allow_student_teacher_role_selection.sql`** (made during the earlier
work session, currently committed on `overhaul`, undeployed) — and replacing self-serve teacher
selection with verified paths (staff code / admin invite / domain verification).
*Blocks: Phase 0 security work; the pre-pilot gate in 14.*

**7. Safety enforcement scope for minors.**
Recommendation (15 §3): fail-closed strict SafetyContext injected into every AI call, provider
input+output moderation for minors, human-readable crisis-escalation runbook. Decide: moderation
budget (~[estimated] in 16) and whether strict mode also applies to unverified-age accounts
(recommended: yes).
*Blocks: Phase 0; any school conversation features.*

**8. Disposition of the July 2026 `overhaul` branch (pre-freeze work).**
The branch holds the UI overhaul, ~20 bug fixes, and 6 migrations — committed, never deployed,
and written before this planning mandate. Options: (a) treat as the Phase-1 starting point after
review [recommended — the fixes are real, but two migrations need changes per 15]; (b) cherry-pick
fixes only; (c) hold entirely. Also: the quarantined `wip/conversation-engine-preplanning` branch
— recommendation: keep as reference, do not merge; supersede with docs 05/06 designs.
*Blocks: what "current state" means for Phase 1.*

**9. Pilot commitment.**
Recommendation (14 §7): one ESL classroom, 4–6 weeks, entry gated on the 12 pre-pilot items,
hard-fail criterion on any data-visibility incident. Decide: timing, school relationship, and
consent handling for the beginner-speech benchmark recordings (needed for decision 2's gate).
*Blocks: Phase 8 planning; benchmark data collection.*

**11. Localization investment tier.**
Recommendation (13): free coverage-wiring + core-surface localization + RTL enablement in scope;
priority-L1 human review for contrastive content; tier-3 languages glosses-only until reviewed.
Decide: budget for human translation review (per-L1 [estimated] in 16) and whether the Spanish
course ships English-instruction-only (recommended: yes).
*Blocks: Phase 3 content pipeline configuration.*

**12. Analytics/telemetry stack.**
Recommendation (wip-03a): in-Postgres event tables + rollups now (FERPA-conscious, no external
processors), revisit external analytics at scale. Decide: acceptance of provider-cost telemetry
retention (30/90 days [proposed]).
*Blocks: Phase 1 observability work.*

---

### Standing constraints (not decisions — restated for the record)

- The uploaded-PDF assessment flow is preserved per doc 12; course performance supplements but
  never overwrites or impersonates it.
- No CEFR/ACTFL proficiency claims from XP, streaks, completion, recognition, exposure, or time.
- $60 per activated student per year, flat, no volume discounts, no consumer product (§5 above).
- No implementation, migration, provider replacement, launch, or deployment occurs until you
  approve the remaining open decisions above.

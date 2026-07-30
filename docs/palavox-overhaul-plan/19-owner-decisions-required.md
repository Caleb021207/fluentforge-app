# 19 · Owner Decisions Required

Numbered decisions only you can make. Each lists the recommendation, the alternatives, and what
blocks on it. Nothing in this plan is implemented until you approve; several items below are
prerequisites for Phase 0 of any roadmap option.

---

**1. Approve the overall product direction.**
Conversation-first finite A1→A2 course (two directions) graduating into a conversation-led
system — per docs 04–10. *Blocks: everything.*

**2. Voice architecture and providers.**
Recommendation: Pattern D hybrid on LiveKit Cloud — deterministic-first + cached Azure TTS for
drills/scripted work; streaming STT → small LLM → Azure TTS for guided conversation;
`gpt-realtime`-mini reserved for premium open conversation; Azure Pronunciation Assessment for
phoneme scoring; benchmark-gated migration with the current OpenAI path as control (doc 11).
Alternatives: stay OpenAI-realtime-only (simpler, 2–4× voice COGS, no phoneme data);
all-cascade (cheapest, loses lowest-latency open conversation).
*Blocks: Phases 2+ voice work; the beginner-speech benchmark (11 §7) must pass before migration.*

**3. Curriculum scope confirmation.**
Recommendation: as mapped — ESL 220 core lessons (~240 scheduled sessions), 1,800 items;
Spanish 228 lessons, 1,825 items; both A1/A2 splits inside your ranges with deviations
documented (validator-verified arithmetic). Hours: ~117 h (EN) / ~122 h (ES) *median design
estimates inside your 100–165 envelope* — per the skeptical review (20 §A), public
time-to-ability statements are pilot-gated and published as per-L1-tier percentile ranges,
never as flat promises (external GLH conventions run 180–200 h). Approval includes the
mandatory pre-authoring revisions in 20 §A (unified schema, listening floors 95/93/90,
counting-policy unification, load-ceiling recompute, 16-field contracts, past-tense runway).
*Blocks: content production start; Phase 3.*

**4. Certificates disposition.**
Recommendation: strip CEFR/ACTFL proficiency language from all in-app certificates now; rename to
"course achievement" records; formal proficiency claims remain exclusively with the protected
uploaded assessment. Alternatives: keep current certificates (carries false-credential risk, A6);
build a proctored assessment product (out of scope).
*Blocks: claims policy rollout (wip-03a); trivial engineering either way.*

**5. Pricing & packaging — PRICE ALREADY DECIDED BY OWNER.**
Settled: **institutional-only** (no consumer product or consumer sales) at a fixed **$60/student/year**. Modeled throughout at that price; no alternatives are analysed.
Still open for your call — the *packaging* around it (16 §10 recommends): a $15,000 minimum contract, volume banding (1k+ $54 · 5k+ $48 · 25k+ $42, all still ≥93% margin), 3-year lock with ~5% discount, **no overage billing** (soft-degrade at pool exhaustion instead), and professional-service fees priced separately (small-deployment implementation $2,500; premium $7,500).
*Blocks: institutional billing build (Phase 6); nothing in Phases 0–2.*

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

**10. Roadmap option selection** (doc 17): Lean pilot vs Recommended production path vs
Aggressive full build — with the time/cost/staffing comparison.
*Blocks: everything after Phase 0 sequencing.*

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
- No implementation, migration, provider replacement, launch, or deployment occurs until you
  approve the relevant decisions above.

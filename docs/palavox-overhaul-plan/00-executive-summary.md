# 00 · Executive Summary

**Assignment:** planning-only due diligence and implementation-ready overhaul plan for Palavox —
a conversation-first language platform (ESL through ~41 instruction languages; Spanish for
English speakers), honest A1→strong-A2 outcomes, school-district viability, preserved
PDF-assessment flow. **No implementation, migration, provider change, or deployment occurred.**

**Method:** 31 specialist agents across five workflows (discovery ×6, voice research ×3,
curriculum ×11, systems design ×11) + principal-architect synthesis, adversarially checked by a
cross-course validator, a learning-science reviewer, and a skeptical pass (20; performed by the
architect at owner direction). ~30 artifacts, evidence-labeled, at commit `7cbaadd9`.

## The product today (01, 02)

Two products fused: a well-engineered learning spine (curriculum schema, server-side grading,
content gauntlet, FSRS core, hardened RLS) inside an older client-trusting shell with serious
defects — self-promotable teacher role exposing minors' records; safety flags no code reads;
the protected assessment flow rejecting the PDFs it exists for; MCQ-only lessons; localization
at ~20% median coverage with zero i18n in the rebuilt core; two XP economies; no analytics;
no tenancy; LLM-minted "ACTFL" certificates.

## The plan

- **Curriculum (07/08):** ESL 220 core lessons / 1,800 items / ~117 h; Spanish 228 / 1,825 /
  ~122 h; 12 units each; checkpoints + performance-gated graduation; every unit embeds written
  and spoken AI interaction under 16-field contracts; progressive release verified within the
  owner's band ratios. Two adversarial reviews accepted-with-revisions (unified authoring
  schema, listening floors, counting policy, hours honesty — all pre-authoring gates).
- **Learning engine (05/06):** unified FSRS-5 memory model over phased item kinds; server-derived
  grading; 22 exercise primitives in 5 rollout waves ending MCQ-only in wave 1; one grading
  service; single XP economy.
- **Conversation (09/10):** contract-compiled missions on a hybrid runtime; anti-decorative-chat
  guarantees; graduation → conversation-led post-course loop with error-driven micro-remediation
  and a measured B1 ramp.
- **Voice (11, 16):** Pattern-D hybrid on LiveKit (deterministic-first + cascade + reserved
  realtime + Azure Pronunciation Assessment). Blended ~$0.013–0.022/min; consumer margins >85%;
  district viability achievable only with this routing. Benchmark-gated migration; OpenAI path
  as control.
- **Trust & institutions (12/13/14/15):** tenancy with service-stamped school keys; verified
  teacher onboarding; enforced SafetyContext for minors; restored consent/audit/DSAR scaffolding;
  assessment-flow repair under preservation invariants; language-pair localization architecture
  (free coverage-doubling first); five-bucket district gap analysis with a hard pre-pilot gate.

## Numbers that matter

One-time: ~9,000 content person-hours (~$410–670k at assumed rates) + engineering per option.
Run-rate at 10k MAU expected usage: ~$9–15k/mo AI/voice COGS. Roadmap Option B (recommended):
~7–9 months to consumer beta, ~12–15 months to district-sellable, ~$600–900k total [estimated,
re-baselined at Phase 0 exit].

## Decision

Approve Option B; sign decisions 19 #1–3, 6, 7 to unblock Phase 0 (schema dump, speech
benchmark, U1 content slice, test infra, security fixes). Full rationale: 21. Risks: 18.
Everything gated on measurement where evidence is missing.

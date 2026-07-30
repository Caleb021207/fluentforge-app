# 21 · Final Recommendation

*(Revised after the learning-science review, the cross-course validator, and the skeptical
pass — see 20 for what changed and why.)*

## Recommendation

**Approve the overhaul on roadmap Option B (Recommended production path), with Phase 0
starting on the four proofs (live-schema dump, beginner-speech benchmark, U1 vertical content
slice, test infrastructure) and the security Phase-0 items sequenced before any feature work.**

The evidence supports three headline conclusions:

1. **The bones are worth keeping.** The curriculum spine, server-authoritative grading, content
   gauntlet, FSRS core, L1-scaffolding prompts, and hardened RLS baseline are genuinely good
   engineering (01 §3). The overhaul is a rebuild *around* the spine — a strangler migration,
   not a rewrite. Rewriting from scratch would discard the best 20% and re-earn the same
   security scars.

2. **The dangerous gaps are trust boundaries, not features.** Self-promotable teachers with
   access to minors' records, safety flags nothing reads, a protected assessment flow that
   rejects PDFs, illusory quotas, and LLM-minted proficiency credentials (01 §2). These are
   Phase 0/1 items precisely because no curriculum or voice work makes the product sellable —
   or defensible — while they stand.

3. **At $60/student/year the full conversational promise is affordable — and that is the test
   that matters.** The curriculum specifies 1,920 live speaking minutes across the ESL course;
   delivering every one of them costs ≈$29 per learner over the ~2.5 years they take to finish,
   against ~$150 of license revenue — **80.8% gross margin on the most engaged learner**.
   District-average annual margin is **93.0%**. Allowances are therefore sized to the curriculum
   (1,000 pooled minutes/student/year, including a **protected 400-minute native-realtime
   floor**), not to a budget. Hybrid Pattern-D routing remains correct because it buys *more*
   realtime where it matters and because no S2S vendor returns phoneme data — not because
   realtime is unaffordable (11, 16).

## What the product becomes

A finite, honest, conversation-embedded A1→A2 course in two directions (ESL through any of the
supported L1s; Spanish for English speakers), graduating on demonstrated performance into a
conversation-led continuation system with error-driven review and micro-remediation — with the
externally-produced uploaded assessment preserved as the only formal proficiency evidence, and
in-product claims strictly provenance-labeled.

## Conditions attached (from review)

- Curriculum authoring begins only after the unified schema + S1/major fixes land (20 §A).
- Voice migration proceeds only through the benchmark gates; the OpenAI path remains the
  control until they pass (11 §7).
- Public time-to-ability claims are pilot-gated, per-L1-tier, never flat hours (20 §A2).
- AI-rater calibration is a blocking dependency for checkpoint/graduation scoring (20 §A).
- District sales wait for the 14 bucket-2 gate regardless of demand.

## Confidence

High on: current-state diagnosis (three independent auditors converged), architecture direction,
curriculum structure (two adversarial reviews), cost *structure*.
Medium on: absolute cost levels (provider prices move), content-production estimates (±30–50%
until the P0 slice), calendar estimates.
Low until measured: beginner/child speech recognition quality, classroom concurrency behavior,
district price tolerance — all gated, none silently load-bearing (18 §final).

## The ask

Decisions 1–12 in doc 19. With #1, #2, #3, #6, #7 signed, Phase 0 can start immediately;
the rest can trail by up to a month without blocking the critical path.

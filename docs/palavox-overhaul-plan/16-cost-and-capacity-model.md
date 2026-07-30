# 16 · Cost and Capacity Model

Consolidates the unit economics across voice (11 §4 — authoritative formulas), curriculum
production (07 §10, 08 §11), and platform operations. Everything here is [estimated] from
[documented] unit prices captured 2026-07-30 unless labeled otherwise; provider prices change —
reconcile monthly against invoices (11 §telemetry).

---

## 1. Cost structure at a glance

| Bucket | Type | Magnitude |
| --- | --- | --- |
| Voice/AI runtime (STT, TTS, LLM, PA, S2S) | variable, per active minute | **$0.022/min active blended → $0.013 optimized** (11 §4.5) |
| Agent hosting/orchestration | step-fixed | LiveKit Cloud Scale **$500/mo flat to 600 concurrent agents** [documented] |
| Pre-generated lesson audio | one-time per course version | **≈ $25–60 total** for ~18–20k renders across both courses at ~$15/1M chars Azure committed [estimated] — negligible |
| Content production (both directions) | one-time investment | **≈ 9,000 person-hours** (ESL ≈5,500 · Spanish ≈3,500) |
| Supabase / web infra | fixed-ish | current plan + growth headroom; no step change until >50k MAU [assumption] |
| Moderation (minors) | variable | provider moderation endpoints ≈ $0.0002–0.002/1k tokens [documented range]; ≈ $0.01–0.03/learner-month at expected usage [estimated] |
| Uploaded-assessment processing | variable | ≤ $0.02/analysis at current model choice (wip-12a) [estimated]; 20/user/day cap already fail-closed |

**The two numbers that matter:** voice runtime dominates variable cost; content production
dominates one-time cost. Everything else is noise at planning precision.

## 2. Voice runtime (summary of 11 §4)

Per-minute blended, recommended Pattern-D routing:

| Mode | Active hosting | Optimized (reserved/self-host + committed TTS) |
| --- | --- | --- |
| Drills / scripted (deterministic-first, cached TTS) | ~$0.008–0.012 | ~$0.005–0.008 |
| Guided conversation (STT → mini-LLM → TTS) | ~$0.018–0.025 | ~$0.011–0.016 |
| Open conversation (realtime-mini) | ~$0.020–0.030 | ~$0.018–0.025 |
| Pronunciation-assessed fraction (Azure PA add-on) | +$0.0217/assessed-min | same |
| **Blended (expected mix)** | **~$0.022** | **~$0.013** |

Per-session costs (07 §10.4): written interaction ≈$0.01 · spoken guided 4–8 min ≈$0.03–0.08 ·
spoken mission 8–12 min ≈$0.05–0.28 · 15-min graduation conversation ≈$0.30–0.50.

### Concurrency scenarios

$/wall-clock-hour at blended active rates (details 11 §4.2):

| Concurrent sessions | 10 | 50 | 100 | 500 | 1,000 |
| --- | --- | --- | --- | --- | --- |
| $/hour [estimated] | ~$13 | ~$66 | ~$132 | ~$660 | ~$1,320 |
| Hosting adequacy | Ship tier | Ship/Scale | Scale | Scale (600) + shard | self-host or enterprise [requires validation] |

Synchronized classroom: 30 concurrent × C-heavy routing ≈ **$15–22/classroom-hour active**
[estimated]; one active school ≈ 300 concurrent fits inside one Scale tier.

### Monthly at 10,000 MAU

| Usage profile | Voice min/learner/mo | Monthly voice COGS (active → optimized) |
| --- | --- | --- |
| Light | 20 | $4.4k → $2.6k |
| Expected | 60 | $13.2k → $7.8k |
| Heavy | 120 | $26.4k → $15.6k |

Plus hosting ($0.5–1k), LLM text chat (≤$0.4k), moderation (≤$0.3k), assessment processing
(≤$0.2k) → **total expected AI/voice COGS ≈ $9–15k/mo at 10k MAU** [estimated].

## 3. Unit economics

**Consumer** ([assumption] $8–15/mo price band, decision 19 #5):
expected-usage COGS ≈ $0.90–1.40/MAU-month optimized → **gross margin comfortably >85%** on
paid users even with free-tier drag at 5:1 free:paid [assumption]. Metered voice minutes are
the natural premium boundary; structured lessons are cheap enough to be generous.

**District** ([assumption] $4–8/student/yr — i.e., $0.33–0.67/student-month revenue):
viable **only** with the four levers (11 §4.5): C-heavy classroom routing, cached curriculum TTS,
enforced speaking-minute allocations (20–30 min/student/mo), reserved/self-host at volume →
COGS ≈ **$2.00–4.30/student/yr** vs $4–8 revenue — thin at $4, workable at $8.
**S2S-only architectures are unsellable at district price points.** Break-even allocation
ceiling at $6/student/yr ≈ 50 voice-min/student/mo.

## 4. Content production investment (one-time per course version)

| Direction | Authoring | Review/QA | Pilot iteration | Total |
| --- | --- | --- | --- | --- |
| ESL (incl. 10-L1 human translations + L1 contrast notes) | ≈4,150 h | ≈1,040 h | ≈300 h | **≈5,500 h (~3.3 person-years)** |
| Spanish (English-only instruction — deliberately cheaper) | ≈2,209 h | ≈990 h | ≈200–300 h | **≈3,500 h (~2.1 person-years)** |

At [assumption] $45–75/h blended contractor rates: **≈ $250k–410k ESL · ≈ $160k–260k Spanish**.
Generation-pipeline assistance may cut authoring 30–50% but grows review — net savings
[requires validation] via the vertical-slice pilot (17 Phase 0). Long-tail L1 translations ride
MT + 10% human spot-check (~120 h) — quality tiering per 13 §5.

Audio: ~18–20k pre-generated renders both courses ≈ **$25–60 one-time** + QA-listening
(~10% sample ≈ 60–80 h). Re-render on content change is near-free (cache-keyed).

## 5. Sensitivity and controls

Biggest swings on the 10k-MAU expected case:
1. **Routing mix** (open-conversation share 10%→30% ≈ +45% voice COGS) → progressive-release
   ratios are also the cost governor; enforce via mission contracts.
2. **Provider price moves** → abstraction layer (11 §6) + monthly invoice reconciliation
   (alert at estimator error >±10%).
3. **Runaway sessions** → hard per-session and per-day minute caps (real ones — the current
   caps are illusory, wip-11a D1), server-measured durations.
4. **Free-tier abuse** → voice gated to a small daily allowance on free tier; text/browser-TTS
   floor (Pattern F ≈ $0.01/lesson) as the unlimited tier.
5. **Content rework** → gauntlet rejection rate measured in Phase 0 vertical slice before bulk
   authoring [requires validation].

## 6. What must be validated before these numbers are load-bearing

1. Beginner/child WER benchmark (decides STT/PA vendor mix — 11 §7).
2. Live-schema dump (quota system truth — B1).
3. Real district price tolerance and consumer conversion (D1/D3 [assumption]s).
4. LiveKit burst behavior under 30-student classroom sync (B4/B5).
5. Gauntlet pass-rate on generated lesson content (C1).

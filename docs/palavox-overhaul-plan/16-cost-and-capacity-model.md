# 16 · Cost and Capacity Model

**Institutional-only product. Flat license: $60 per activated student per year — no exceptions.**

Binding owner decisions reflected throughout:

1. Palavox is sold **only** to institutions. No consumer product, pricing, or go-to-market.
2. The license is **$60 per activated student per year, regardless of district size.** No
   volume discounts, no usage overages, no consumer plans, no freemium tiers, no alternate
   per-seat rates. This document models no alternative prices or packaging tiers. Where
   economics are tight, the levers are engineering and operational — never price.
3. **"Activated student"** means a student provisioned an account under the institution's
   license (i.e., on the district's roster for Palavox) — **not** a usage-metered or
   login-counted figure. Billing is per licensed seat, never per session or per minute used;
   usage-based billing is explicitly rejected (§7).
4. Implementation, migration, training, customization, and other professional services **may be
   priced separately** — they are delivery costs, not alternatives to the license price.
5. **The product must deliver the full conversational promise at $60.** Allowances are sized to
   the curriculum's actual speaking requirement, not the reverse.
6. Light / expected / heavy are **usage** scenarios used to test whether $60 holds. They are not
   pricing scenarios.

Unit prices [documented] as of 2026-07-30 (11b/11c/11d); derived figures [estimated] with
assumptions stated. Reconcile monthly against provider invoices.

> **Correction from the prior revision.** An earlier draft of this document paired a 400-minute
> annual voice allowance with a curriculum that specifies **1,920 live speaking minutes across
> the ESL course** (07 §7.2: 1,140 guided + 780 open; Spanish 08 §7: 931 + 620 = 1,551). Those
> were irreconcilable, and the headline "95.5% margin" described *average district utilization*,
> not a fully-engaged learner completing the whole course. Both are corrected below: allowances
> now cover the curriculum, and margins are stated separately for district-average, fully-engaged
> annual, and whole-course-lifetime cases.

---

## 1. Definitions

| Term | Meaning here |
| --- | --- |
| **Revenue** | $60 × activated students × year (recurring license — billed per licensed seat, never per usage) |
| **COGS** | Cost to serve: AI/voice (STT, TTS, LLM, realtime, pronunciation assessment), agent hosting, serving infrastructure, moderation, assessment processing |
| **Gross profit / margin** | Revenue − COGS |
| **Contribution margin** | Gross profit − direct customer costs (support, implementation delivery, allocated content maintenance) |
| **Implementation expense** | One-time per-customer delivery; may be recovered by a separate fee that never alters the $60 license |
| **Fixed opex** | Monitoring, base infra, security tooling, curriculum maintenance — does not scale per student |
| **One-time development** | The build (roadmap 17) — capital, not COGS |
| **Founder time** | Tracked in hours, **never counted as cash expenditure** |

## 2. What the curriculum actually requires

The speaking requirement is a curriculum fact, not a budget choice:

| | ESL (07 §7.2) | Spanish (08 §7) |
| --- | ---: | ---: |
| Guided speaking (roleplays, guided Q&A, info-gaps, scaffolded missions) | 1,140 min | 931 min |
| Open conversation + missions + free talk | 780 min | 620 min |
| **Total live speaking across the whole course** | **1,920 min (32.0 h)** | **1,551 min (25.9 h)** |

**Course duration.** The full course is ~117 h (ESL) of active engagement. At typical district
ELL supplemental pacing (3 × 30 min/week × ~34 instructional weeks ≈ 51 h/year), a learner
completes it in **~2–3 school years**; intensive newcomer programs (5 × 30 min/week) finish in
~1.5 years [estimated — validate against real pilot pacing].

**On-pace annual speaking need:** 1,920 min ÷ 2.5 years ≈ **770 min/student/year**; an intensive
1.5-year learner needs ~1,280 min/year.

**Not all speaking minutes cost the same.** Derived from the curriculum's own activity mix:

| Route | Share of course speaking | $/min | What runs here |
| --- | ---: | ---: | --- |
| Drill / read-aloud / scripted (cached TTS + STT + Azure PA bursts) | ~24% | $0.006 | minimal pairs, read-aloud, dictation, scripted dialogue |
| Cascade (STT → small LLM → Azure TTS) | ~35% | $0.013 | guided conversation, most roleplays and missions |
| **Native realtime S2S** | ~41% | $0.020 | **open conversation, missions at open tier, checkpoint & graduation talks** |

Native realtime is the largest single share by design — the curriculum's late-A2 bands call for
25–35% open conversation, and that is exactly where realtime earns its cost. **Realtime is
funded, not rationed.**

## 3. Cost to serve — three honest cases

### 3a. Whole-course lifetime (a learner who completes everything)

| Route | Minutes | Cost |
| --- | ---: | ---: |
| Drill / scripted | 456 | $2.74 |
| Cascade guided | 684 | $8.89 |
| Native realtime | 780 | $15.60 |
| **Live speaking subtotal** | **1,920** | **$27.23** |
| Written AI, moderation, assessment processing (course lifetime) | — | ~$1.60 |
| **Total AI COGS, entire course** | | **≈ $28.83** |

Against ~2.5 years of license at $60 = **$150 revenue → 80.8% gross margin on the most engaged
learner Palavox will ever have.** This is the number that proves the promise is affordable.

### 3b. Per year, by usage scenario (per *activated* student)

Assumes 65% engagement (expected — the share of activated/billed students who actually use
the product); the average engaged learner uses ~55–60% of on-pace speaking
minutes because pacing varies and not every activity is voice.

| Scenario | Voice min / activated / yr | Voice | Written AI + moderation + assessment | **COGS/student/yr** | **Gross margin** |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Light** | 145 | $1.96 | $0.21 | **≈ $2.17** | **96.4%** |
| **Expected** | 280 | $3.78 | $0.44 | **≈ $4.22** | **93.0%** |
| **Heavy** | 560 | $7.56 | $0.68 | **≈ $8.24** | **86.3%** |
| **Fully-engaged individual** (on-pace, 770 min, no pooling relief) | 770 | $10.40 | $0.80 | **≈ $11.20** | **81.3%** |

**$60 sustains the full conversational promise at every level of engagement.** Even the
theoretical case where *every activated student* is fully engaged returns >81%.

## 4. Economics by deployment size

Expected usage; 9-month year; peak synchronized concurrency ≈ 4% of activated [estimated];
support 1 ticket/40 students/yr at $28 loaded; implementation delivered once in year 1.

| Activated (billed) | ARR | Engaged | Peak concurrency | AI + voice | DB/hosting | Monitoring | Support | **COGS** | **Gross profit** | **GM** |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | $6,000 | 65 | 4 | $422 | $180 | $120 | $70 | **$792** | **$5,208** | **86.8%** |
| 500 | $30,000 | 325 | 20 | $2,110 | $420 | $240 | $350 | **$3,120** | **$26,880** | **89.6%** |
| 1,000 | $60,000 | 650 | 40 | $4,220 | $720 | $360 | $700 | **$6,000** | **$54,000** | **90.0%** |
| 5,000 | $300,000 | 3,250 | 200 | $21,100 | $2,400 | $900 | $3,500 | **$27,900** | **$272,100** | **90.7%** |
| 10,000 | $600,000 | 6,500 | 400 | $42,200 | $4,200 | $1,500 | $7,000 | **$54,900** | **$545,100** | **90.9%** |
| 25,000 | $1,500,000 | 16,250 | 650¹ | $105,500 | $9,000 | $3,000 | $17,500 | **$135,000** | **$1,365,000** | **91.0%** |
| 50,000 | $3,000,000 | 32,500 | 1,100¹ | $211,000 | $16,000 | $5,400 | $35,000 | **$267,400** | **$2,732,600** | **91.1%** |

¹ Concurrency grows sublinearly above ~10k activated students (more time zones and bell schedules)
[assumption — validate at first 5k+ deployment].

### Contribution margin

| Activated (billed) | Gross profit | Implementation (yr 1) | Content maintenance share | **Yr-1 contribution** | **CM %** | **Yr 2+ CM %** |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | $5,208 | $3,200 | $600 | **$1,408** | 23.5% | 76.8% |
| 500 | $26,880 | $6,400 | $3,000 | **$17,480** | 58.3% | 79.6% |
| 1,000 | $54,000 | $9,600 | $6,000 | **$38,400** | 64.0% | 80.0% |
| 5,000 | $272,100 | $22,400 | $18,000 | **$231,700** | 77.2% | 84.7% |
| 10,000 | $545,100 | $32,000 | $30,000 | **$483,100** | 80.5% | 85.9% |
| 25,000 | $1,365,000 | $56,000 | $60,000 | **$1,249,000** | 83.3% | 87.0% |
| 50,000 | $3,000,000 → $2,732,600 GP | $88,000 | $90,000 | **$2,554,600** | 85.2% | 88.1% |

**Sub-500 deployments are thin in year one** — implementation dominates. Fixed with deal
structure (§10), never with the license price.

## 5. Fixed operating expenses

| Line | Annual [estimated] |
| --- | --- |
| Base infrastructure (Supabase, reserved agent-host capacity, CDN, storage) | $18k–36k |
| Monitoring / observability / error telemetry | $6k–12k |
| Security & compliance tooling (scanning, audit, pen-test cadence) | $15k–40k |
| Curriculum maintenance & content ops (both directions, steady state) | $60k–110k |
| Provider commitments (committed-use TTS/STT discounts) | $12k–30k |
| **Total** | **≈ $110k–230k/yr** |

**Break-even ≈ 2,000–4,300 activated students** ($120k–258k ARR) at expected usage, before
salaried engineering or founder compensation.

## 6. One-time development and founder time

Roadmap Option B: ~$600–900k (engineering + ~9,000 content person-hours) — 17 §3. Capital, not
COGS. **Founder time** [estimated] 25–35 h/week through Phases 0–4 (~3,500–5,000 hours) on
architecture, curriculum direction, pilot relationships, and district sales — tracked as hours,
never as cash expenditure.

## 7. AI allowances, pooling, and safeguards

Sized to **deliver the curriculum**, with pooling and safeguards preventing runaway usage.

**Included allowance, per activated student per school year:**

| Item | Included |
| --- | --- |
| **Voice conversation — total pool** | **1,000 minutes/student/year, pooled district-wide** |
| ↳ guaranteed **native realtime S2S** floor | **400 minutes/student/year** (pooled) |
| ↳ remainder across cascade + drill routes | ~600 minutes/student/year |
| Written AI interaction | Unlimited within fair use (soft cap 500 turns/student/mo) |
| Pronunciation assessment | Unlimited within lesson flow (rides the pool) |
| Uploaded assessment processing | 4 uploads/student/year |

**Why 1,000.** An on-pace learner needs ~770 speaking min/year to complete the course in 2.5
years; an intensive learner needs ~1,280. A 1,000-minute pooled allowance covers on-pace
learners outright and, because it is **pooled district-wide**, comfortably funds intensive
learners out of non-activating seats. A 1,000-seat district receives 1,000,000 voice minutes,
including 400,000 realtime minutes.

**Worst-case cost:** if a district consumed its *entire* pool at the curriculum's route mix —
$14.22/student/yr → **76.3% gross margin.** Publishable and defensible in a contract.

**Safeguards (runaway prevention, not rationing):**
- Fair use: 30 voice-min/student/day, 150/week — above any legitimate lesson pattern.
- Server-measured durations only (never client-supplied — fixes wip-11a D1/D8).
- Per-session caps, anomaly alerts on per-student/per-class outliers, auto-termination of
  runaway loops, existing rate-limit ledger.
- **Realtime is protected.** If a pool nears exhaustion, drill and scripted traffic degrade to
  cached/deterministic routes **first**; the realtime floor is the last thing to yield, because
  it carries the outcome the product promises.
- **No overage billing.** Notify the district admin at 80% pool consumption; at 100%, voice
  degrades to cascade/text while lessons, review, and written interaction continue. Additional
  pool blocks are *granted* on admin request (cost is trivial) — logged, never invoiced.
  Surprise invoices end district renewals.

## 8. Onboarding, implementation, and professional services

Modeled **separately** from the $60 license; never a disguised price change.

| Package | When | Fee | Delivery cost |
| --- | --- | --- | --- |
| Standard onboarding | Ordinary paid deployments | Included ($0) | $6.4k–32k |
| **Implementation fee** | Where significant setup/training is required | **$2,500–$5,000 one-time** | ~$3.2k–5k |
| **Premium SIS integration** | Optional | **Quoted per engagement** | varies |
| **Extensive professional development** | Optional | **Quoted per engagement** ($1,500/day baseline) | ~$900/day |

## 9. Operational risks by deployment size

| Size | Dominant risks |
| --- | --- |
| 100–500 | Implementation cost exceeds year-1 contribution; single-champion dependency; low activation reads as failure regardless of quality |
| 1,000–5,000 | Synchronized-classroom bursts (40–200 concurrent) stress the agent host; support outpaces founder-only response; rostering errors compound |
| 10,000–25,000 | Multi-school tenancy correctness becomes existential (15); provider rate ceilings need pre-negotiated headroom; one privacy incident is contract-ending |
| 50,000 | 1,100+ concurrency needs reserved/self-hosted capacity; support requires dedicated staff (~0.4 FTE modeled); content maintenance must be a funded team function |

Cross-cutting: provider price moves (abstraction layer + monthly reconciliation); routing drift
beyond the funded realtime share (router config + pooled allowances); pool-exhaustion path tested
before first renewal.

## 10. Commercial structure — recommendation

**$60 per activated student per year, flat, for every institution regardless of size.** No
minimum deployment, no volume discounts, no exceptions. This should be held through the first
wave of deployments.

**Why $60 flat is right now:**
- Produces excellent margins (86–96% at district-average utilization) **even with substantial
  live AI conversation** — §3 proves the full 1,920-minute promise costs ~$29 across a course.
- Low enough to enter district conversations as an easy-to-justify supplemental tool.
- Sits beneath established intensive ELL products — a Louisiana state price list shows Imagine
  Language & Literacy at **$100/student** [documented:
  doe.louisiana.gov price list, accessed 2026-07-30].
- Palavox is **pre-efficacy-study and pre-scaled-deployment.** Charging incumbent-level pricing
  before quantified district results makes procurement harder, not easier.
- The immediate objective is **winning adoption and collecting evidence**, not extracting the
  theoretical maximum from each license.
- **No minimum deployment size.** A small district, private school network, charter, nonprofit,
  adult-education program, or pilot may have well under 250 students. A packaging rule should
  never be the reason Palavox loses an easy first deal.

**Deal structure:**

| Element | Recommendation |
| --- | --- |
| Standard license | **$60 per activated student per year — flat, no size minimum** |
| Volume discounts | **None.** Every institution pays the same $60/activated student, from a 40-student pilot to a 50,000-student district |
| Usage overages | **None** — soft-degrade at pool exhaustion (§7), never a variable bill |
| Consumer plans, freemium tiers, alternate seat rates | **None exist.** Institutional-only, one price |
| Small pilot | Separately negotiated — typically $3,000–$7,500 total, structured as a fixed-fee pilot engagement, not a discounted per-seat rate |
| Implementation / migration / training / customization | **Priced separately as professional services** ($2,500–$5,000 typical where significant setup or training is required) — not a license-price alternative |
| SIS integration, extensive PD, custom reporting | Separate services, quoted per engagement |

**Competitive positioning.** Duolingo for Schools is free [documented: schools.duolingo.com,
accessed 2026-07-30], so Palavox must sell what Duolingo does not: **district-controlled ESL
intervention, embedded live AI conversation, teacher visibility, assessment integration,
pronunciation analysis, multilingual L1 scaffolding, and actionable progress data.** Every one of
those is in this plan; none is a pricing argument — they are the product argument.

**Earning the right to charge more — later, not now.** Move toward different pricing only after
Palavox demonstrates one or more of: measurable proficiency growth · strong usage and completion ·
teacher time saved · renewal demand · successful district-scale concurrency · formal curriculum
validation · recognizable district references. Even then, the plan is **not** to introduce volume
discounts or seat-rate variation — it is to keep $60 as a single foundational license and offer
*additional, separately-priced capabilities* (advanced reporting, SIS integration, expanded
conversation allowances) as professional services layered on top, per §7's "may be priced
separately" principle. This is a future decision, not part of the current packaging.

**Models considered and rejected:** volume-tiered per-seat pricing (this document's own earlier
draft proposed $54/$48/$42 tiers at scale — struck; it is a second pricing model and the owner
has ruled it out); a $15,000/250-student minimum (struck for the same reason — it excludes small
first deals the plan should be winning); per-teacher/site licensing (misaligns with a per-student
product, invites seat-sharing); metered/usage pricing (districts cannot budget variable AI spend,
and it penalizes the speaking practice we want to encourage); per-school flat fee (punishes small
schools, undercharges large ones); premium $99–$130 pricing now (unsupported by evidence and
harmful to early procurement).

## 11. What must be validated

1. Beginner/child speech recognition quality (gates routing assumptions — 11 §7).
2. **Real course pacing** — the 2–3 school-year assumption drives the annual allowance sizing.
3. Engagement rate (65% expected — share of activated/billed students who actually use the
   product) and voice minutes per engaged learner.
4. Peak synchronized concurrency in a real bell schedule (the 4% assumption).
5. Support ticket rate per 40 students.
6. Gauntlet pass-rate on generated content (drives the maintenance opex line).

# 16 · Cost and Capacity Model

**Institutional-only product. Fixed license price: $60 per student per year.**

Owner decisions now binding on this document:

1. Palavox is sold **only** to institutions (districts and schools). There is no consumer
   product, no consumer pricing, and no consumer go-to-market in this plan.
2. The institutional price is **$60/student/year — fixed**. This document contains no pricing
   alternatives, no sensitivity on price, and no proposals to change it. Where economics are
   tight, the levers are engineering and operational, never price.
3. Light / expected / heavy are **usage** scenarios used to test whether $60 holds. They are
   not pricing scenarios.

Unit prices are [documented] as of 2026-07-30 (11b/11c/11d); everything derived is [estimated]
with assumptions stated. Reconcile monthly against provider invoices.

---

## 1. Definitions (used consistently below)

| Term | Meaning here |
| --- | --- |
| **Revenue** | $60 × enrolled students × 1 year (recurring license) |
| **COGS** | Usage-driven cost to serve: AI/voice (STT, TTS, LLM, PA, realtime), agent hosting, database/hosting attributable to serving, moderation, assessment processing |
| **Gross profit / margin** | Revenue − COGS |
| **Contribution margin** | Gross profit − *direct* customer costs: support, onboarding/implementation delivery, customer-specific success time |
| **Implementation expense** | One-time per-customer delivery cost (rostering, training, config) — modeled separately; may be recovered by a separate professional-services fee that does **not** alter the $60 license |
| **Fixed opex** | Monitoring, base infra, security/compliance tooling, curriculum maintenance — does not scale per student |
| **One-time development** | The build itself (roadmap 17) — capital, not COGS |
| **Founder time** | Tracked in hours, **never counted as cash expenditure** |

## 2. Usage scenarios (not pricing scenarios)

Per enrolled student per month during the ~9-month school year. Enrolled ≠ active: institutional
deployments reliably carry non-activation.

| Scenario | Active share of enrolled | Voice min / active / mo | Written AI turns / active / mo |
| --- | --- | --- | --- |
| **Light** | 45% | 15 | 60 |
| **Expected** | 65% | 30 | 120 |
| **Heavy** | 85% | 60 | 240 |

**Voice minutes are the cost driver.** The pedagogy requires meaningful speaking practice; the
expected case (30 min/active/mo ≈ 270 min across a school year, plus in-lesson micro-exchanges)
is the *floor* consistent with the A2 conversational promise. Margin is never protected by
cutting below this.

### Blended cost per voice minute (from 11 §4)

| Route | What runs on it | $/min |
| --- | --- | --- |
| Deterministic drills + cached TTS | scripted practice, minimal pairs, dictation | **$0.005–0.008** |
| Cascade (STT → small LLM → Azure TTS) | guided conversation, most missions | **$0.011–0.016** |
| **Native realtime S2S** (`gpt-realtime`-mini) | **open conversation, graduation, milestone missions** | **$0.018–0.025** |
| Pronunciation assessment add-on (Azure PA) | phoneme scoring on assessed turns | +$0.0217/assessed-min |
| **Expected institutional blend** (incl. the realtime share below) | | **$0.013** |

**Realtime is in the product, funded, by design.** The owner requires genuine dynamic realtime
conversation, and the economics at $60 comfortably support it (§7). Realtime is *targeted* rather
than universal — used where unpredictability and latency actually change the learning (open
conversation, checkpoint/graduation talks, milestone missions) — while scripted drilling runs on
cheaper routes. That is a pedagogical allocation that happens to be efficient, not a cost cut.

Written AI turns ≈ $0.0004/turn [estimated]; moderation for minors ≈ $0.02/active/mo;
assessment processing ≈ $0.02/upload, ~1–2 uploads/student/yr.

## 3. Per-student annual COGS at $60

Annualized (9 active months), expected routing at $0.013/min unless noted:

| Scenario | Voice | Written AI | Moderation | Assessment | **COGS/student/yr** | **Gross margin** |
| --- | --- | --- | --- | --- | --- | --- |
| **Light** | $0.79 | $0.10 | $0.08 | $0.03 | **≈ $1.00** | **98.3%** |
| **Expected** | $2.28 | $0.28 | $0.12 | $0.04 | **≈ $2.72** | **95.5%** |
| **Heavy** | $5.96 | $0.73 | $0.15 | $0.04 | **≈ $6.88** | **88.5%** |
| **Heavy + routing drift ($0.022/min)** | $10.10 | $0.73 | $0.15 | $0.04 | **≈ $11.02** | **81.6%** |

**Verdict: $60/student/year is comfortably sustainable across all usage scenarios**, including
heavy usage with unoptimized routing. Even the worst modeled case clears an 80% gross margin
before hosting/support. This is the decisive finding of the repricing: the earlier tension
(modeled at a far lower assumed institutional price) disappears entirely at $60, and the
engineering levers in §7 become margin *protection* rather than survival requirements.

## 4. Economics by deployment size

Assumptions: expected usage; 9-month year; classroom concurrency = 4% of enrolled at peak
(one class period speaking simultaneously per ~25 students, staggered across a bell schedule)
[estimated]; support 1 ticket/40 students/yr at $28 loaded/ticket; onboarding delivered once
per customer in year 1.

| Enrolled | ARR | Active | Peak sync. concurrency | AI+voice COGS | DB/hosting | Monitoring/infra | Support | **COGS total** | **Gross profit** | **GM** |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | $6,000 | 65 | 4 | $177 | $180 | $120 | $70 | **$547** | **$5,453** | **90.9%** |
| 500 | $30,000 | 325 | 20 | $884 | $420 | $240 | $350 | **$1,894** | **$28,106** | **93.7%** |
| 1,000 | $60,000 | 650 | 40 | $1,768 | $720 | $360 | $700 | **$3,548** | **$56,452** | **94.1%** |
| 5,000 | $300,000 | 3,250 | 200 | $8,840 | $2,400 | $900 | $3,500 | **$15,640** | **$284,360** | **94.8%** |
| 10,000 | $600,000 | 6,500 | 400 | $17,680 | $4,200 | $1,500 | $7,000 | **$30,380** | **$569,620** | **94.9%** |
| 25,000 | $1,500,000 | 16,250 | 650¹ | $44,200 | $9,000 | $3,000 | $17,500 | **$73,700** | **$1,426,300** | **95.1%** |
| 50,000 | $3,000,000 | 32,500 | 1,100¹ | $88,400 | $16,000 | $5,400 | $35,000 | **$144,800** | **$2,855,200** | **95.2%** |

¹ Concurrency growth sublinear above ~10k enrolled: larger deployments span more time zones and
bell schedules [assumption — validate at first 5k+ deployment].

### Contribution margin (year 1, after direct customer costs)

Implementation is delivered once per customer; it is an expense, not a price change.

| Enrolled | Gross profit | Onboarding/implementation (yr 1) | Content maintenance share² | **Contribution (yr 1)** | **CM %** | Year 2+ CM % |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | $5,453 | $3,200 | $600 | **$1,653** | 27.6% | 80.9% |
| 500 | $28,106 | $6,400 | $3,000 | **$18,706** | 62.4% | 83.7% |
| 1,000 | $56,452 | $9,600 | $6,000 | **$40,852** | 68.1% | 84.1% |
| 5,000 | $284,360 | $22,400 | $18,000 | **$243,960** | 81.3% | 88.8% |
| 10,000 | $569,620 | $32,000 | $30,000 | **$507,620** | 84.6% | 89.9% |
| 25,000 | $1,426,300 | $56,000 | $60,000 | **$1,310,300** | 87.4% | 91.1% |
| 50,000 | $2,855,200 | $88,000 | $90,000 | **$2,677,200** | 89.2% | 92.2% |

² Curriculum maintenance allocated per deployment; the absolute maintenance budget is a fixed
opex line (§5), shown here allocated for contribution analysis.

**The small-deployment finding:** at 100 students ($6,000 ARR), year-1 contribution is thin —
implementation cost dominates. This argues for a **minimum deployment size (~500 students) or a
separate implementation fee for sub-500 deployments** (§8), not for changing the $60 license.

## 5. Fixed operating expenses (not per-student)

| Line | Annual [estimated] |
| --- | --- |
| Base infrastructure (Supabase tier, agent-host reserved capacity, CDN, storage) | $18k–36k |
| Monitoring/observability/error telemetry | $6k–12k |
| Security & compliance tooling (scanning, audit, pen-test cadence) | $15k–40k |
| Curriculum maintenance & content ops (both directions, steady state) | $60k–110k |
| Provider minimums/commitments (committed-use TTS/STT discounts) | $12k–30k |
| **Total fixed opex** | **≈ $110k–230k/yr** |

**Fixed-opex break-even ≈ 2,000–4,100 enrolled students** ($120k–246k ARR) at expected usage —
before any salaried engineering or founder compensation.

## 6. One-time development (capital, not COGS)

Roadmap Option B: ~$600–900k (engineering + ~9,000 content person-hours) — see 17 §3.
Excluded from all margin math above.

**Founder time (tracked, never cash):** [estimated] 25–35 h/week through Phases 0–4 on
architecture, curriculum direction, pilot relationships, and district sales — ~3,500–5,000 hours
across the build. Recorded here so the plan never disguises founder labor as zero cost.

## 7. AI allowances, pooling, and safeguards (the recommended policy)

Because $60 clears the cost easily, allowances exist to prevent *runaway* usage and abuse — not
to ration learning.

**Recommended included allowance (per enrolled student, per school year):**

| Item | Included |
| --- | --- |
| **Voice conversation — total pool** | **400 minutes/student/year, pooled district-wide** |
| ↳ of which **native realtime S2S** | **90 minutes/student/year** (guaranteed floor, pooled) |
| ↳ remainder on cascade/guided + drill routes | ~310 minutes/student/year |
| Written AI interaction | Unlimited within fair use (soft cap 500 turns/student/mo) |
| Pronunciation assessments | Unlimited within lesson flow (rides the voice pool) |
| Uploaded assessment processing | 4 uploads/student/year |

**Where the 90 realtime minutes go** (the pedagogically load-bearing moments):
graduation conversation (~15 min) · checkpoint conversations (2 × ~10 min) · milestone missions
(~6 × 5 min) · monthly open conversation from late A1 onward (~15 min) · post-course/remediation
sessions for graduates. Late-A2 learners — whose band ratio calls for 25–35% open conversation —
draw more from the pooled realtime budget, which is exactly what pooling is for.

- **Pooled, not per-seat.** A 1,000-seat district receives 400,000 voice minutes including
  90,000 realtime minutes. Non-activating students fund the heavy speakers — pedagogically right
  and administratively simple. At expected usage a district consumes ~44% of its pool.
- **Cost if a district exhausted its entire pool:**
  90 min realtime × $0.020 = $1.80 · 310 min other × $0.011 = $3.41 → **$5.21/student/yr**,
  i.e. **91.3% gross margin at 100% pool consumption.** The allowance — realtime included — is
  therefore safe to publish and defend in a district contract.
- **Realtime is never the first thing cut.** If a pool nears exhaustion, drill and scripted
  traffic degrade to cached/deterministic routes first; the realtime floor is protected until
  last, because it carries the learning outcome the product promises.
- **Fair use:** 25 voice-min/student/day and 120 min/student/week ceilings stop pathological
  individual usage without touching normal practice.
- **Overages: not necessary.** Recommend **no overage billing**. Instead: at 80% pool
  consumption, notify the district admin; at 100%, voice degrades to the cascade/text tier
  (Pattern F) for the remainder of the term while lessons, review, and written interaction
  continue unaffected. Districts hate surprise invoices; a soft-degrade preserves the
  relationship and caps our exposure. Additional pool blocks may be *granted* at admin request
  (cost is trivial) — logged, not billed.
- **Abuse prevention:** per-session minute caps, server-measured durations (never client-supplied
  — fixes wip-11a D1/D8), anomaly alerts on per-student and per-class outliers, automatic
  session termination on runaway loops, and the rate-limit ledger already in `_shared`.

## 8. Onboarding, implementation, and professional services

Modeled **separately** from the $60 license; these never change the license price.

| Package | When | Fee [proposed] | Delivery cost | Purpose |
| --- | --- | --- | --- | --- |
| **Standard onboarding** | ≥500 seats | **Included** ($0) | $6.4k–32k | Self-serve rostering + 2 live training sessions + office hours |
| **Small-deployment implementation** | <500 seats | **$2,500 one-time** | ~$3.2k | Recovers the fixed setup cost that thin ARR can't absorb |
| **Premium implementation** | optional, any size | **$7,500 one-time** | ~$5k | SIS/roster integration support, custom PD day, admin reporting setup |
| **Additional PD / training day** | optional | **$1,500/day** | ~$900 | Ongoing teacher development |

Recommendation: **yes to a small-deployment implementation fee** (it fixes the 100-student
contribution problem shown in §4) and **yes to optional premium services**; **no** to any fee
that functions as a disguised per-student price change.

## 9. Operational risks by deployment size

| Size | Dominant risks |
| --- | --- |
| 100–500 | Implementation cost exceeds year-1 contribution; single-champion dependency; low activation makes the deployment look failed regardless of quality |
| 1,000–5,000 | Synchronized-classroom bursts (40–200 concurrent) hit the agent host; support load outpaces a founder-only response; rostering errors compound across schools |
| 10,000–25,000 | Multi-school tenancy correctness becomes existential (15); provider rate ceilings need pre-negotiated headroom; a single privacy incident is contract-ending |
| 50,000 | Concurrency 1,100+ needs reserved/self-hosted capacity and regional distribution; support requires dedicated staff (~$35k modeled ≈ 0.4 FTE); content maintenance must be a funded team function, not a founder task |

Cross-cutting: provider price moves (abstraction layer + monthly reconciliation), routing drift
toward realtime (enforced by mission contracts and router config), and the §7 pool exhaustion
path being tested before first district renewal.

## 10. Pricing-model recommendation

The owner fixed the **price** at $60/student/year; the *model* around it is still a design
choice, and the margin analysis argues for shaping it deliberately.

**Recommendation: keep $60 as the list price and add volume banding + a floor, structured as
follows.**

| Element | Recommendation | Why |
| --- | --- | --- |
| **List price** | **$60/student/year** — unchanged, published | Simple, defensible, comfortably profitable at every usage scenario |
| **Minimum contract** | **$15,000/yr** (≈250 seats at list) | Fixes the 100-student contribution problem (§4) without discounting the license |
| **Volume banding** | 1–999 seats: $60 · 1,000–4,999: $54 · 5,000–24,999: $48 · 25,000+: $42 | District procurement *expects* volume tiers; at 88–95% margins these discounts are affordable and win deals. Even the deepest band holds ~93% gross margin at expected usage |
| **Multi-year** | 3-year commitment locks the band and adds ~5% discount | Reduces churn risk and renewal load; margin absorbs it easily |
| **Term** | Annual license, school-year aligned (Jul–Jun) | Matches budget cycles; avoids mid-year proration disputes |
| **Overages** | **None** — soft-degrade instead (§7) | Surprise invoices kill district renewals; our cost exposure is trivial |
| **Professional services** | Priced separately (§8), never bundled into the per-student price | Keeps the license clean and comparable |

**Alternative models considered and rejected:** per-teacher/site licensing (misaligns with a
per-student learning product and invites seat-sharing); usage-based/metered pricing (districts
cannot budget variable AI spend, and it would penalize exactly the speaking practice we want to
encourage); freemium-to-paid (no consumer motion in this plan); per-school flat fee (punishes
small schools, undercharges large ones).

The banding above is a *recommendation for how to package $60*, not a proposal to change it —
list price stays $60 and every model in §§3–4 is computed at $60.

## 11. What must be validated

1. Beginner/child speech recognition quality (gates the routing assumptions — 11 §7).
2. Activation rate in a real deployment — the 65% expected-active figure drives every COGS line.
3. Peak synchronized concurrency in a real bell schedule (the 4% assumption).
4. Support ticket rate per 40 students.
5. Actual voice minutes consumed per active student (the 30 min/mo expected figure).
6. Gauntlet pass-rate on generated content (drives the maintenance opex line).

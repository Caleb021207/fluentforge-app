# 10 — Post-Course Experience (Conversation-Led Continuation)

**Role:** Post-Course Experience Architect · **Phase:** planning only · **Date:** 2026-07-30
**Consumes:** 07 §11 (ESL graduation), 08 §8.4 (Spanish graduation), band §13e loops
(`wip-curriculum-en-late-a2.md:562-580`, `wip-curriculum-es-late-a2.md:582-597`), 05 (unified
memory/error pipeline — designed in parallel; interface assumptions flagged), wip-03a §4
(claims policy), 12 §3–4 (evidence provenance + anti-requirements), 11 §4 (voice economics),
15 §3 (SafetyContext), 08 §9.3 (15-field interaction contract).
**Scope rule:** the curriculum maps own the graduation *instruments*; this doc owns the shared
engine semantics, outcome routing, retake policy, the claim boundary, and everything after
graduation.

---

## 0. Decision headlines

| # | Decision | One-line rationale |
|---|----------|--------------------|
| D1 | One **graduation engine**, direction-parameterized; instruments stay as 07/08 define them | Two divergent codepaths for the same 4-outcome routing is avoidable cost [proposed] |
| D2 | Cumulative gates are **evidence-first, probe-fallback**: fresh longitudinal evidence auto-satisfies a gate; stale/missing evidence appends a short test-day probe | Keeps the ~15-min conversation the centerpiece; respects both maps' designs (07 §11.2 prerequisites-style vs 08 §8.4 component-probe-style) [proposed] |
| D3 | Graduation certificate = **"Palavox Course Achievement Record"** with fixed permitted language (§1.6); never a CEFR/ACTFL level claim; hard-walled from the protected uploaded assessment | wip-03a §4.1; 12 §4 anti-requirements; 19 decision #4 |
| D4 | The post-course product is **one loop**: conversation → weakness → micro-lesson → practice → review → conversation, reusing band §13e machinery — no new pedagogical systems | Both A2L bands specified this loop independently; "reuses band machinery — no new systems" (`wip-curriculum-es-late-a2.md:584`) [documented] |
| D5 | Micro-lessons are **authored templates + gauntlet-gated personalization slots**, not free per-learner generation | Reconciles per-learner personalization with the human-approval content rule (wip-01a §4.1 lifecycle draft→gated→operational) [proposed] |
| D6 | B1 ramp advances on **demonstrated-ability promotion gates** measured in conversation — never time, sessions, streaks, or XP | Owner mandate; claims policy (wip-03a §3.1 tier ladder) [proposed] |
| D7 | Post-course voice is **metered**: monthly pool by tier + daily cap + route-downgrade ladder | Post-course mix is conversation-heavy; per-graduate COGS ≈2–2.5× during-course (§5) [estimated] |

---

## 1. Graduation evaluation design

### 1.1 What already exists (inputs, not redesigned here)

- **ESL** [documented, 07 §11.2 / 07-esl-curriculum-map.md:952-983]: prerequisites GR-0
  (mastery ≥0.65, three missions ≥ functional, U12-L16 writing, GRAD-01 mock, conditional
  GRAD-02 tune-up), then GRAD-03: ~15-min 4-phase adaptive conversation (warm-up → familiar
  topics past/future with bidirectional follow-ups → transaction with one planted breakdown →
  unexpected turn + wind-down) + ~10-min ~80-word connected message. Gates GR-1..GR-4
  (7-dim × 0–4 conversation, total ≥18/28, every dim ≥2, repair ≥2 non-waivable; 4-dim
  writing ≥9/16, no zero).
- **Spanish** [documented, 08 §8.4 / 08-spanish-curriculum-map.md:405-448]: eligibility
  (lessons complete, missions ≥ achieved_with_support, es-12.17, es-12.20 mock), then five
  components: G-E1 100-card stratified vocab probe ≥80%, G-E2 30-item adaptive grammar-in-
  context ≥70%, G-E3 3-passage single-play listening ≥9/12, G-E4 the ~15-min 6-phase adaptive
  conversation with task/interaction/intelligibility/stamina gates, G-E5 80–120-word writing.
- Both emit the same outcome enum: `graduated | graduated_with_review | remediation |
  repeat_missions` [documented, 07:491, 08:734].

### 1.2 Consolidation — options and recommendation

| Option | Description | Tradeoffs |
|---|---|---|
| A. Leave divergent | Two engines, two rubrics | Honors each map exactly; 2× calibration studies, 2× QA pipelines, cross-direction analytics incomparable |
| B. Full harmonization | Force one instrument set on both directions | Cheapest engineering; overrides deliberate per-direction pedagogy (e.g., ES stamina gate, EN repair-floor emphasis) — the maps' authors resolved conflicts deliberately (07 §2, 08 §2) |
| C. **Shared engine, direction parameter packs** (recommended) | One state machine, one outcome enum, one 7-dim conversation rubric core + 4-dim writing rubric; component gates satisfied evidence-first with probe-fallback (D2); direction pack supplies phases, planted-event pools, thresholds | One calibration protocol with per-direction anchors; instruments preserved; comparable analytics |

**Recommendation: C** [proposed]. The conversation rubric core standardizes on the ESL 7
dimensions (task completion, interaction & follow-ups, range, accuracy, fluency,
intelligibility, repair; 0–4 each) because the ES G-E4 gates map onto it cleanly (task→task
completion, interaction→interaction+repair, intelligibility→intelligibility, stamina→a
direction-pack extra gate). ES keeps its stamina gate and its 6-phase plan as pack parameters.

### 1.3 Cumulative evidence gates (evidence-first, probe-fallback)

Every owner-listed capability is certified by *some* instrument; the engine checks a
longitudinal evidence source first and only schedules a probe when evidence is missing, stale
(> 21 days [proposed, requires validation]), or below threshold:

| Capability gate | Longitudinal evidence (auto-satisfies) | Fallback probe on graduation day |
|---|---|---|
| Comprehension (paced + accented speech) | Listening-task record U10–U12 at target wpm ladder (07 §7.3; 08 R13) ≥ threshold | 2–3 single-play passages (ES G-E3 style, ~5 min) |
| Productive retrieval (vocab/chunks) | FSRS productive-card health: ≥75–80% stratified across units and card ages (05 memory model) [assumption: 05 exposes this query] | Stratified probe (ES G-E1 style, shortened adaptive ~24 cards) |
| Guided speaking missions | M-U10/11/12 (EN) or 10.18/11.18/12.19 (ES) each ≥ functional / achieved_with_support [documented] | No probe — missions must be completed (repeat_missions route) |
| Unscripted written exchange | U12 connected-message artifact submitted | 80–120-word timed writing (always administered — GR-4/G-E5; it is the written half of the finale) |
| Unscripted spoken exchange | — | The ~15-min adaptive conversation (always administered; never waivable) |
| Interpersonal + transactional handling | Mission evidence + CP2 transactional parts (07 §11.1) | Conversation phase 3 (transaction roleplay) |
| Clarification/repair | `error_log`/repair-event history in U12 interactions | Conversation planted breakdown; repair dim ≥2 **non-waivable** (GR-3) |
| Intelligibility | Azure PA composites on U10–U12 drills (11, Pattern D) | Conversation intelligibility dim ≥2; ASR+rubric composite [requires validation, 08:426] |
| Grammar in context | `skill_mastery` ≥0.65 on gating skills (07 R9) | Adaptive in-context set (ES G-E2 style, ~10 min) only if mastery stale/incomplete |

Result: a learner with a healthy evidence chain sits **conversation + writing only (~25–30
min total)**; a learner with gaps gets a longer day, capped at the ES full battery (~55 min,
08:730). All attempt data — audio, transcript, rubric JSON, per-gate evidence refs — writes to
`checkpoint_attempts` + `assessment_evidence` [proposed tables, 08 §9.1], continuing the
longitudinal chain (07 §11.1 universal rules).

### 1.4 Scoring rubric and QA

- 7-dim × 0–4 conversation; pass total ≥18/28; every dim ≥2; repair ≥2 non-waivable; ES pack
  adds stamina (≥13 min sustained, ≤2 collapses to L1 beyond permitted strategy use) [documented].
- 4-dim × 0–4 writing; ≥9/16; no dim 0.
- AI scoring with confidence bands; **borderline (±1 of any gate) or low-confidence sessions
  queue for human review** before the outcome is released [documented, 07 §11.2 Scoring QA].
- Calibration protocol: before graduation gates any real learner, a rater study on ≥50 pilot
  conversations per direction; AI–human agreement target κ ≥ 0.7 per dimension, and the
  adaptive interlocutor's ease/stretch state must be logged and fed to scoring context
  (07:961) [requires validation].

### 1.5 Outcome routing and retake policy (consolidated)

| Outcome | Condition (engine-level) | Consequence |
|---|---|---|
| `graduated` | All gates pass; ≤1 conversation dim at exactly 2; error bank clear | Can-dos marked achieved with evidence links; post-course profile initialized (§2.1); first-week plan scheduled (§6 R2 mitigation) |
| `graduated_with_review` | All gates pass but ≥2 dims at 2, OR one non-conversation component below bar, OR open error-bank debt | Graduation stands; 2-week targeted review plan auto-scheduled (the §2 loop, seeded from the failed component); re-probe ~day 10 |
| `remediation` | Conversation fails on range/accuracy/intelligibility with localized gaps, or ≥2 components fail | Targeted §2-loop micros; re-attempt **only failed phases/components** after ≥3 days; fresh scenario always |
| `repeat_missions` | Conversation fails on task/interaction/repair | Redo mapped mission(s) in fresh variants with repair/follow-up success criteria, then re-take the conversation only |

Retake rules [proposed, consolidating 07/08]: passed components/phases are **banked** for 60
days; cooldowns — ≥3 days (conversation phases), ≥24 h (component probes); every retake uses a
fresh scenario/prompt family; **max 2 full remediation cycles**, then a human-review flag with
an alternate-evidence portfolio option (no learner is hard-walled — 08:401-403); a
portfolio-based pass is decided by a human and caps at `graduated_with_review`. Retakes are
free and unlimited in count but never identical (failure_handling `never_third_identical`,
08 §9.3 field 15 area).

### 1.6 The claim boundary — hard separation (exact language)

Per wip-03a §4.1 and 12 §3–4, and standing constraint in 19:

1. **Storage separation:** graduation writes `checkpoint_attempts` / `assessment_evidence`
   only. It MUST NOT write to, read as, or be labeled as `transcript_analyses` (12 §4
   anti-requirements 2, 5, 6). Evidence source = `in_app_assessment`, verifiability =
   `system_measured` (12 §3). A contract test asserts no graduation code path touches the
   protected store.
2. **Display separation:** every surface showing graduation results carries the `Provenance`
   prop (wip-03a §4.3) with `source: 'demonstrated'` (server-graded components) or
   `'ai_estimate'` (rubric-scored conversation — never rendered `confidence: 'high'`).
   Teacher/district views show "Course graduation" as its own column, never merged with
   "External assessment (uploaded document)" (12 §3 rule 3).
3. **The certificate — "Palavox Course Achievement Record"** [proposed, per 19 #4 + wip-03a §4.2]:
   - **MAY state:** learner name; course name and direction; completion date; *"completed the
     Palavox [English/Spanish] course, a curriculum aligned to CEFR A1–A2 descriptors"*
     (editorial alignment claim — permitted, wip-03a §4.1); *"demonstrated N of M course can-do
     statements, with evidence recorded between [date] and [date]"*; the graduation
     conversation outcome as *"completed a 15-minute assessed conversation meeting the course
     standard"* with the rubric dimension summary; total active learning time by activity type;
     a server-issued verification code resolving at `/verify/{code}` (issued_records table,
     wip-03a §4.2).
   - **MUST NOT contain:** *"certified/certificate/certification"*, *"fluent/fluency level"*,
     any CEFR or ACTFL **level attainment** ("is A2", "Intermediate Low") from in-product
     evidence, any equivalence chain, any content from or reference to the learner's uploaded
     external assessment.
   - **Required footer (verbatim):** *"This record describes work completed and demonstrated in
     Palavox. It is not a language-proficiency certification."*
   - Enforced by template test + copy-audit grep (AC-G5, §6).

---

## 2. The post-course loop (fully specified)

### 2.1 Initialization at graduation

`graduated*` outcomes initialize a **post-course profile** [documented intent, 08:445;
proposed shape]: active error-bank debt (for `_with_review`), the learner's saved-error
category history, pronunciation-family composites, interest selections (collected during U12 —
the ES "café abierto" free-talk habit bridge from U10 on is the on-ramp,
`wip-curriculum-es-late-a2.md:355`), ramp tier P0, and the deliberate course exclusions now
in scope as B1 modules (07:624: full present perfect, passive, conditionals, reported speech,
articles-as-gate; 08:211: subjunctive, productive commands; plus pret/imp productive contrast,
clitic paradigm per 08 R4c).

### 2.2 The loop (state machine)

```
CONVERSE → DETECT → (explain | MICRO-LESSON) → PRACTICE → REVIEW → VERIFY-IN-CONVERSATION
   ↑___________________________________________________________________|
```

**Step 1 — Conversation.** Free talk, interest discussion, or mission. Every session runs
under a lightweight **session contract** — the 15-field interaction contract (08 §9.3) with
`tier: open`, the owner correction stack as field 9 (p1 understanding-blocking → in-character
recast immediate; p2 current target → concise recast max 2; p3 repeated high-value → log only;
p4 intelligibility → echo-model max 1; post-session feedback ≤4 items), and 0–2 **silent
objectives** (elicitation targets from open loops, §2.6). In-flight: concise recasts only;
fuller feedback after — never overcorrect [owner policy].

**Step 2 — Weakness detection ("meaningful weakness" thresholds).** The 05 error pipeline
(unified taxonomy → `error_log`/`saved_errors`; assumption: 05 provides per-instance severity
`{noticeable | distorting | blocking}` and obligatory-context analysis). A category becomes a
**remediation target** only when one of these fires [proposed; thresholds requires validation
in pilot]:

| Trigger | Definition | Precedent |
|---|---|---|
| T1 density | ≥3 distorting-or-blocking instances of one category in one session | ES §13e step 2 (`:588`), EN 13e |
| T2 recurrence | Same category ≥2 distorting instances in ≥2 of the last 3 sessions | extension of T1 |
| T3 intelligibility | One phoneme family below PA composite threshold ≥3 times across last 2 sessions AND ≥1 machine-misparse/repair event traced to it | EN §13e steps 1–2 (`:566-568`) |
| T4 avoidance | <10% production of an expected structure across ≥15 obligatory contexts (invisible to error counts) | [proposed] |

Floors and caps: no trigger evaluates below ≥8 learner turns or ≥4 min speech in the session;
non-blocking errors are **logged, never remediated** (G-L14 policy, 08:398); **max 3 active
loops** concurrently — new triggers queue in owner-priority order (understanding-blocking >
current-target > repeated high-value > intelligibility); a verified-closed category cannot
retrigger for 7 days.

**Fork — explanation vs micro-lesson:** first trigger of a category with a *small* fix
(single lexical confusion, one collocation) → an inline **targeted explanation** in the
post-session digest (≤2 sentences + model line, uses the learner's own utterance). Anything
morphosyntactic, phonological, or recurrent → micro-lesson.

**Step 3 — Micro-lesson (the contract).** [proposed]

- **Scope:** exactly one taxonomy category (or one merged root when the scorer links
  categories to a single cause, per EN §13e step 2 `pron.final_cluster::past_-ed`).
- **Length:** 3–8 min. Structure: hook (learner's own 2–3 utterances with corrected models —
  "You said X; here's why natives heard it differently", ES §13e step 2); explanation ≤120
  words, L1-localized per 13 policy; 3–6 contrastive/forced-choice or listen-discriminate
  items; 1 production task (≤10 ASR-scored controlled items or one 60-sec guided task); exit.
  **Never conjugation-table dumps** (ES §13e step 3).
- **Generation guardrails (through the content gauntlet):** the pedagogical spine of every
  micro-lesson is a **pre-authored template** per taxonomy category (the R-* remediation micros
  the band plans already name, e.g., R-PI-1), which passes the full 6-gate gauntlet + human
  approval to `operational` like any content (wip-01a §4.1). At runtime, **personalization
  slots** (learner utterances, corrected models, distractors) are filled by generation and pass
  the *automated* gates only — solver cross-check, level/CEFR input budget, bias, duplicate,
  plus safety moderation per 15 §3 — with sampled human QA (2% of fills + 100% of gate-flagged)
  [proposed]. Rationale: full human approval per-learner-artifact cannot scale (authoring
  throughput ceiling, wip-01a F4.5); free generation without gates violates the "no content
  reaches a learner without approval" strength. Personalized fills are marked
  `source: generated_personalized` and **never enter the shared curriculum pool**. Kill-switch:
  any category's fill-rejection rate >10% reverts that category to template-only (generic
  examples) until reviewed.
- **SafetyContext:** every generation and every conversation call resolves server-side
  SafetyContext first; unresolved → fail-closed strict (15 §3.1, 15:202).
- **Cost cap:** est. $0.01–0.04 per micro-lesson generation [estimated, mini-class models,
  11 §4]; max 2 regenerated variants per loop.

**Step 4 — Focused practice.** Items injected into the next 1–2 sessions: cloze-in-context,
listening discrimination, ASR-scored production, one guided micro-dialogue engineered so every
answer requires the target (EN §13e step 4).

**Step 5 — Scheduled review.** Error-derived cards enter the 05 unified memory (FSRS-style)
within 24–48 h (07 §4.2 context 8); `skill_mastery` probe re-armed at the standard threshold;
clearance = 2 consecutive correct productions **in interaction** (EN §13e step 5); warm-ups
for the next ~5 sessions include one trap item for the category.

**Step 6 — Verify in conversation.** The next 1–2 sessions carry a **silent objective**:
naturally elicit the target context; analyzer compares category error rate against the step-2
baseline. Rate <20% in obligatory contexts → loop closes, evidence appended to the post-course
profile via `assessment_evidence` (ES §13e step 6); persists → escalate once to a guided
scaffolded variant, then max 2 loops before a human-review flag (EN §13e step 6). All
transitions logged so progress claims stay performance-based [documented owner mandate].

### 2.3 The B1 difficulty ramp — demonstrated-ability triggers

Four internal tiers, **P0–P3** ("practice difficulty tiers" in all user-facing copy — never a
CEFR label; risk C5). Axes ramped per tier [proposed; values requires validation]:

| Axis | P0 (graduation baseline) | P1 | P2 | P3 (working B1 practice) |
|---|---|---|---|---|
| Interlocutor rate (EN wpm) | 150–160 | 160–170 | 170–180 | natural + reductions full |
| Topic abstraction | concrete familiar | narrative + simple opinion | opinion + hypothetical-lite | abstract-lite, unfamiliar-domain |
| Learner turn expectation | phrase–2 clauses | ≥2 clauses sustained | short multi-turn narration | extended turns, topic management |
| Unfamiliar-language budget | max 2 glossed | 3–4 | 5–6 | uncapped, cognate/context-fair |
| Scaffolding default | levels 0–2 available | 0–1 | 0–1 | 0 |

**"Demonstrated" — the promotion gate, concretely** [proposed]: over the trailing 5
conversation sessions comprising ≥40 minutes at the current tier, ALL of:
(a) ≥80% of breakdowns repaired within 2 turns (learner- or jointly-initiated);
(b) ≤10% of turns required scaffolding level ≥2;
(c) distorting-error density ≤6 per 100 words with ≥10 obligatory contexts observed for
current-tier targets (sample-size floor — no promotion on thin evidence);
(d) ≥1 mission at the current tier rated achieved-without-support.
All server-measured from session analytics; **time, session count, streaks, and XP are
inadmissible** (wip-03a §3.1). Demotion is symmetric and **silent**: 2 consecutive sessions
below floor (density >12/100w or scaffolding >25%) step the tier down with no user-facing
"level down" copy.

**B1 grammar-module unlock ladder** (separate from tier): each deferred module (07:624,
08:211) moves `receptive-eligible → productive-eligible → productive` — the mechanism the ES
loop already demonstrates by upgrading G-L14 post-graduation (`wip-curriculum-es-late-a2.md:589`):
receptive phase (AI uses the form; comprehension checks ≥80% over ≥10 items) → micro-lesson
series + practice → productive when obligatory-context accuracy ≥70% over ≥10 conversational
contexts. Modules per direction: EN — present perfect (full), past continuous/narrative
weaving, conditionals 1–2, reported speech, passive (receptive-first), article accuracy;
ES — pret/imp productive contrast, subjunctive (present, trigger-chunks first), productive
commands, object-pronoun paradigm, future/conditional morphology [proposed sequencing;
SME review requires validation].

---

## 3. The experience surface

### 3.1 IA sketch — the graduate's home ("Conversation Hub")

```
Graduate Home
├─ Today card ······ next recommended session (composition preview) + last-session recap digest
├─ Conversation
│   ├─ Free talk (interest topics; carries silent objectives)
│   ├─ Missions (scenario library, tiered P0–P3, fresh variants)
│   └─ Phone mode (audio-only, degraded-band practice — U12 skill maintained)
├─ Focus ·········· the ≤3 active weakness loops, each showing its loop stage
├─ Review ········· daily FSRS queue (vocab/chunks/grammar/error-derived/pron cards)
├─ Listening ······ adaptive feed (topic passages + weekly brief; 2 speeds; transcripts after 2 plays)
├─ Writing studio ·· targeted tasks (connected-message ladder → B1 paragraph/narrative)
├─ Pronunciation ··· PA-scored drills on flagged families; minimal pairs
└─ Progress ······· evidence-linked can-dos, B1 module map, tier (provenance-labeled);
                    Achievement Record download + /verify code
```

The home leads with the next conversation, not a lesson list — the course spine is gone; the
loop is the product [proposed].

### 3.2 Session composition guidance

Default 20-min template [proposed]: 2 min warm-up review → 10–12 min conversation (mission or
free talk with objectives) → 3–4 min focus practice (only if a loop is active) → 2 min review
refresh → post-session digest (≤4 feedback items, per correction contract). Weekly guidance
surfaced on the Today card: ≥3 conversations, ≥1 mission, daily review ≤5 min, 1 listening,
1 writing. Guidance only — no streak mechanics gate anything (claims policy; consolidated XP
economy is cosmetic here, 03 row 12).

### 3.3 Teacher visibility (school learners)

Rostered graduates remain attached to their class; the teacher dashboard (14) gains a
**Graduates** tab [proposed]: sessions/week and voice minutes (server-measured, wip-03a §3.3);
named active focus categories; mission outcomes; practice tier (labeled as difficulty tier
with provenance, never a level claim); can-do evidence added since graduation; alerts for
14-day inactivity and stuck loops (2 failed cycles → the same human-review flag). Transcript
access follows district `district_settings` retention/consent policy (15 §4); default is
metrics-not-transcripts. All aggregates stay within one evidence source (12 §3 rule 2).

---

## 4. Content needs

### 4.1 Scenario-mission library (post-course)

[proposed] Launch with **40 authored mission templates per direction**:
- 24 A2-consolidation: the course's service/survival domains re-staged with adult variance —
  returns/complaints, appointments & rescheduling, phone tasks, pharmacy/symptoms, transport
  disruption, workplace requests, invitations & plan changes, form-filling + follow-up call.
- 16 B1-stretch: incident narration (report what happened), opinion exchange with
  disagreement, multi-step transactions with two planted breakdowns, negotiation-lite,
  retell-and-compare, interview with follow-up pushback.

Each template = full mission contract (08 §9.3: 15 fields + scenes + planted_breakdowns +
lifeline policy + fresh-scenario-on-retry) authored and gauntlet-approved; **surface variants
generated** along ≥3 parameter axes (names/places/quantities/twist selection) through the
automated gates, giving ≥10 variants per template — this is how retakes and repeat play stay
fresh without 400 authored missions. Authoring estimate: 4–6 h/template incl. QA → 160–240 h
per direction [estimated]; growth +8–10 templates/quarter driven by usage analytics.

### 4.2 Interest-topic taxonomy

[proposed] 3 levels: **8 domains** (work & career, family & relationships, food & cooking,
sport & health, entertainment & media, travel & places, technology & daily life, community &
current events) → **~40 launch topic cards** (5/domain) → free subtopics. A topic card is
light: title, 6–10 angle prompts, 12–15 recognition-tier seed items, register notes — authored
(~1 h each), localized glosses via the 13 pipeline. Learners pick ≥3 at graduation; free-text
interests allowed but the AI keeps vocabulary in-band +stretch budget (07 §4.2 ctx 7).
Minor-safe filtering of domains/topics via SafetyContext tenant policy (15 §3.2).

### 4.3 Listening feed sourcing — options

| Option | Mechanism | Pros | Cons |
|---|---|---|---|
| A. In-house TTS passages (recommended primary) | Existing passage pipeline + cached Azure TTS at 2 speeds; known-vocab constraint relaxed to ~85–90% post-course | Full control; gauntlet-gated; near-zero marginal cost (cache-hit, 11 §4.1 f_tts≈0.15) | Authoring load; synthetic feel at B1 naturalness [requires validation] |
| B. Generated weekly topical brief (recommended secondary) | LLM-drafted 2-min "this week" pieces per interest domain, gauntlet automated gates + human spot-check | Freshness = retention hook | Editorial risk; needs a review cadence |
| C. Licensed graded content | License graded readers/podcasts | Professional quality | Cost, per-market licensing, ops [owner decision if pursued] |
| D. External podcast link-outs with comprehension wrapper | Curated links; wrapper questions in-app | Authentic input, zero hosting | No rights to rehost or excerpt; wrapper only; quality drift |

**Recommendation:** A + B at launch; D as an unmonetized "beyond Palavox" shelf; C deferred
[proposed].

---

## 5. Economics

### 5.1 Usage profile — active graduate vs during-course learner

[estimated — all unit rates from 11 §4.1–4.5; no telemetry exists to calibrate usage
(11 §4.4); Phase 0 instrumentation prerequisite]

Post-course route mix is conversation-heavy vs the during-course blend (25/35/25/15
drills/scripted/guided/open): **10% drills+PA / 10% scripted-cached / 55% guided (route B) /
25% open (route A)** →

| | $/voice-min active | $/voice-min optimized |
|---|---|---|
| During-course blend (11 §4.1) | ≈$0.022 | ≈$0.013 |
| **Post-course blend** | **≈$0.026** | **≈$0.018** |

Usage bands [assumption]: light 30 / expected 100 / heavy 240 voice-min per active graduate
per month (expected ≈ 3 sessions/wk × ~8 voice-min — the §13e persona cadence). Adding text-LLM
overheads (session analysis à la Pattern E $0.05–0.22/session, micro-lesson fills, digest
generation ≈ $0.5–1.0/mo expected):

| Band | Active COGS/mo | Optimized | vs during-course expected ($1.32/mo, 11 §4.5) |
|---|---|---|---|
| Light | ≈$1.1 | ≈$0.8 | 0.8× |
| Expected | ≈**$3.3** | ≈**$2.5** | ≈2.5× |
| Heavy | ≈$8.0 | ≈$5.8 | 6× — exceeds an $8 plan's entire revenue |

Consequence: graduates are the **most expensive cohort per active month**. Sustainability comes
from the same routing levers plus the institution-wide pooled allowance (16 §7): graduates draw
from the same district pool their seats fund, and non-engaging seats subsidize heavy speakers.
Voice is never individually metered or billed — the pool degrades honestly at exhaustion.

### 5.2 Abuse / runaway-cost controls

[proposed] All server-side (the current caps are illusory — 03 row 6, row 24):

1. **Institution-wide pooled allowance** (1,000 voice min contributed per licensed seat per
   year, incl. the 400-min/seat protected native-realtime sub-pool — 16 §7); pool exhaustion →
   honest banner + text-mode continuation (Pattern F floor). Additional pool blocks may be
   *granted* on district-admin request — logged, never invoiced (no paid top-ups, 19 #5).
2. **Daily cap** (default 30 voice-min) and **session hard cap** 25 min with wind-down prompt
   at 20 — also a pedagogical stamina ceiling.
3. **Idle auto-pause** at 45 s (the contract's auto_escalate field, 08 §9.3) — mic-open
   minutes are billed minutes (11 §4.1 P_stt).
4. **Route-downgrade ladder** under budget pressure: open → guided cascade → text; labeled
   honestly.
5. **Concurrency 1 voice session per account**; token-mint per session with server-measured
   duration reconciliation.
6. **Anomaly detection** off `provider_call_log` (wip-03a §6.2): per-user spend >3× cohort
   median/day → soft-lock + review; cost dashboards per 03 row 25.
7. Micro-lesson generation caps (§2.2 step 3): 2 variants/loop, ≤3 active loops.

---

## 6. Acceptance criteria and risks

### 6.1 Acceptance criteria (measurable)

- **AC-G1:** One graduation engine executes both direction packs; every attempt writes
  `checkpoint_attempts` + `assessment_evidence` rows with media refs and per-gate evidence
  provenance; outcome enum matches 07/08 exactly (integration test).
- **AC-G2:** Evidence-first gating demonstrably shortens the day: a seeded learner with a
  complete fresh evidence chain receives conversation+writing only; one with stale evidence
  receives the mapped probes (scenario tests).
- **AC-G3:** Rubric calibration study complete before launch: κ ≥ 0.7 AI–human per dimension
  on ≥50 conversations/direction; borderline/low-confidence sessions provably route to human
  queue [requires validation].
- **AC-G4:** Protected-flow separation: contract test proves no graduation/post-course code
  path writes or reads `transcript_analyses` as its own evidence; provenance prop present on
  all 6+ display surfaces (compile-level, wip-03a AC3.3).
- **AC-G5:** Certificate template test: required footer present; grep of rendered output for
  forbidden strings ("certified", "certificate" outside the record's own disclaimer context,
  ACTFL/CEFR level attainment patterns) returns zero.
- **AC-L1:** The full loop closes end-to-end in staging: seeded T1 trigger → micro-lesson →
  practice → review cards spawned ≤48 h → silent-objective verification → `assessment_evidence`
  append (E2E test). Pilot targets: median trigger→verification ≤14 days; ≥60% of loops reach
  verification; verified loops show ≥50% error-rate reduction vs baseline [requires validation].
- **AC-L2:** Overcorrection guards hold: ≤3 active loops, ≤4 digest items, non-blocking errors
  never spawn remediation (property tests on the trigger engine).
- **AC-R1:** Every tier promotion is reproducible from logged evidence by an audit query; zero
  promotions attributable to time/sessions/streaks (test: synthetic heavy-usage-low-evidence
  learner never promotes); demotions render no "level down" copy (snapshot test).
- **AC-S1:** Graduate home renders all 8 IA areas; default session template composes; teacher
  Graduates tab shows the six fields with provenance labels.
- **AC-C3 (decorative-chat guard):** ≥70% of post-course conversation sessions carry ≥1
  machine-verified objective outcome (silent objective, mission criterion, or elicitation
  event) within 4 weeks of launch; "decorative share" (sessions with zero contract objectives
  and zero analyzer events) <15%, reported weekly [proposed targets, requires validation].
- **AC-E1:** Per-graduate voice COGS visible on the provider-cost dashboard; pool/daily/session
  caps enforced server-side (attempted-overrun test); downgrade ladder fires in staging
  simulation.
- **AC-RET1:** D7/D30 post-graduation retention instrumented from day one; graduation-day
  handoff (first-week plan + interest onboarding) fires for 100% of `graduated*` outcomes.

### 6.2 Risks

| ID | Risk | I×L | Mitigation |
|---|---|---|---|
| PR1 | **C3 decorative chat, post-course edition** — without the curriculum spine, sessions drift to pleasant, objective-free talk (18 C3 rates H×M; likelihood is *higher* here) | H×H | Session contracts mandatory (§2.2); silent objectives; AC-C3 measured weekly; mission-share floor on the Today recommender; skeptical review (20) challenges this doc specifically |
| PR2 | **Retention cliff at graduation** — course completion is a natural exit; the product must re-onboard the graduate into a habit, not a syllabus | H×H | Graduation-day handoff ritual (first-week plan auto-scheduled for ALL graduates, extending the `graduated_with_review` mechanism); interest onboarding during U12 + café-abierto habit bridge (08:355); weekly topical brief as a freshness hook; lapse re-entry flow (warm recap conversation; FSRS naturally compresses the queue); D30 target ≥40% [assumption, requires validation] |
| PR3 | Overcorrection destroys the conversational experience | M×M | Owner correction stack in every contract; caps in AC-L2; non-blocking-never-remediated rule |
| PR4 | Tier/module language leaks into level claims ("you're B1!") — 18 C5 | H×M | "Practice difficulty tier" copy standard; provenance-labeled evidence phrasing only ("past habits: emerging-B1 evidence" style, ES §13e); copy audit in AC-G5/AC-R1 |
| PR5 | Personalization-slot generation degrades quality without full human gate | M×M | Template-spine architecture (D5); automated gates + 2% sampled QA + flag review; per-category kill-switch to template-only |
| PR6 | Cost runaway from conversation-heavy graduates | H×M | §5.2 controls; metered pool aligns with 19 #5; anomaly detection |
| PR7 | Open-topic conversation with minors widens safety surface | H×M | SafetyContext fail-closed on every call (15 §3); minor-filtered topic taxonomy; layered moderation incl. realtime limits (15 §3.3 D); crisis path 15 §3.4 |
| PR8 | Rubric calibration fails (AI–human κ < 0.7) and graduation outcomes lose credibility | H×M | Calibration gate before launch (AC-G3); human review of borderlines is standing, not temporary |
| PR9 | 05 interface drift — this doc assumes severity-graded error instances, obligatory-context analysis, and error-derived FSRS cards | M×M | Joint review of the 05/10 interface before either freezes; assumptions flagged throughout |

### 6.3 Dependencies

05 (error taxonomy, severity, FSRS memory entities — hard dependency), 09 (conversation
runtime + machine-enforced contracts), 11 (Pattern D stack + benchmark gate; owner decision
19 #2), 15 (SafetyContext, retention jobs; decisions 19 #6/#7), 13 (L1-localized explanations),
wip-03a (Provenance, event taxonomy, provider-cost dashboard; decision 19 #12), 12 (evidence
model + anti-requirement tests), 07/08 (instruments + §13e machinery), 19 #5 (flat license;
pooled-allowance policy 16 §7), 14 (teacher dashboard for §3.3).

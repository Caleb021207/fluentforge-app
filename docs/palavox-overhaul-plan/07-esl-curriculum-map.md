# 07 — ESL Curriculum Map (Direction A): Map of Record

**Direction:** English for multilingual learners (instruction/UI in learner L1, ~41 L1s; 10 priority L1s: es, zh, ar, vi, ht, pt, ru, uk, fa, so)
**Scope:** absolute beginner → functional survival-conversational **strong A2**, finite course ending in Graduation
**Status:** consolidated planning document (map of record). No app code or DB changes are made or implied. All schema items are **[proposed]** additive extensions.
**Sources merged:** the four band plans (kept as appendix references, §13):
`wip-curriculum-en-early-a1.md` (U1–U3), `wip-curriculum-en-late-a1.md` (U4–U6 + CP1), `wip-curriculum-en-early-a2.md` (U7–U9 + CP2), `wip-curriculum-en-late-a2.md` (U10–U12 + Graduation).

Labels: **[proposed]** design decision for owner review · **[assumption]** premise the plan depends on · **[requires validation]** must be checked against data/SME/pilot before build · **[estimated]** planning number, never a user-facing guarantee.

Where this file and a band file disagree, **this file wins**; each such override is logged in the reconciliation log (§2).

---

## 1. Course architecture at a glance

| Band | Units | Core lessons | New vocab (resolved §4) | Est. hours [estimated] | Ratios structured/guided/open | Gate |
|------|-------|--------------|-------------------------|------------------------|-------------------------------|------|
| A1E (early A1) | U1–U3 | 54 (18/18/18) | 360 | 21.4 | 78 / 22 / 0 | Band Gate (after U3) |
| A1L (late A1) | U4–U6 | 55 (18/18/19) | 445 | 28.0 | 59 / 34 / 7 | **Checkpoint 1** (after U5) |
| A2E (early A2) | U7–U9 | 55 (18/19/18) | 480 | 28.8 | 46 / 36 / 15 (+3 assess.) | **Checkpoint 2** (after U8) |
| A2L (late A2) | U10–U12 | 56 (18/18/20) | 515 | 38.5 | 34 / 35 / 30 | **Graduation** (GRAD-01/02/03) |
| **Course** | **12** | **220** | **1,800** | **~117 (range 95–150)** | progressive release honored | 4 assessment events |

- **CEFR lesson accounting (resolution R2):** A1 = **90** lessons (U1–U5) vs owner 90–110 ✓ · A2 = **130** lessons (U6–U12, U6 counted as A2 bridge) vs owner 120–150 ✓.
- **Scheduled sessions ≈ 240:** 220 core + 6 assessment sessions (Band Gate, CP1, CP2, GRAD-01/02/03) + 8 standalone open-conversation slots + ~6-lesson remediation pool — matching the owner's ~240 working target at the session level while protecting per-lesson quality [proposed].
- **Interaction inventory:** every unit embeds ≥1 written AND ≥1 spoken AI interaction (owner rule, verified per band); course totals: **12 missions**, ~**60 major AI-interaction contracts**, per-lesson micro-exchanges from U7 onward (~110 lessons), 8 open-conversation slots.
- Proficiency claims derive **only** from performance evidence (exercise keys, interaction success criteria, rubric scores) — never XP/streaks/completion/recognition/exposure/time (owner rule, enforced in every gate below).

---

## 2. Inter-band reconciliation log

Every inconsistency found across the four band plans, with its resolution. All resolutions **[proposed]** unless noted.

| # | Conflict | Source of conflict | Resolution |
|---|----------|--------------------|------------|
| R1 | Lesson-ID conventions differ (`EN-A1E-U1-L05`, `U4L01`, `U7-L01`, `EN-A2L-U10-L02`) | all four bands | Canonical ID: `EN-U{01–12}-L{nn}` (band derivable from unit). Band files' legacy IDs remain valid aliases; the YAML in §3 uses canonical short form `U{uu}-L{nn}`. |
| R2 | U6 counted as A1 (→A1=109, A2=111, under A2 floor) or as A2 bridge (→90/130) | A1L §0 offered both | **U6 accounted to A2** (it is labeled A1+/A2-bridge and its two grammar previews are A2 material). A1=90, A2=130 — both mid-range. Authoring ownership of U6 stays with the A1L band plan. |
| R3 | Core lessons total 220 vs owner working target ~240 | arithmetic across bands | Keep 220 core; the ~240 target is met at the **scheduled-session** level (§1). Justification: all units sit inside the 16–22 lesson range, and bands consistently chose more/shorter lessons for beginners rather than padding; adding 20 filler lessons would dilute density. Deviation documented per owner instruction. |
| R4 | **Vocabulary ledger conflict.** A2E assumed ~900–1,000 inbound (actual: 805); A2L assumed ~1,400–1,500 inbound (actual: 1,255). Bands' raw sum = 1,705, below the 1,800–2,200 target and below A2L's claimed ~1,900 landing | A2E §0/§4, A2L §0/§4 vs A1 bands' actuals | Adopt the **actual ledger** (360/445/450/450 = 1,705) and add a **+95-item chunk-only uplift**: +10 each to U7/U8/U9 (service & symptom chunks), +15 U10, +20 U11 (interview-answer frames), +30 U12 ("graduation survival" chunk pack). Landing = **1,800**, the low end of the owner range — exactly what both A2 bands independently recommended ("strong-A2 ability is chunk-limited, not lemma-limited"). Resolved per-unit budget in §4. |
| R5 | Grammar ID collision: A1E uses G1–G24; A2E reuses G1–G14 for different points | A1E §5, A2E §5 | Band-local G-numbers deprecated for cross-band use. Canonical **dotted keys** (`gram.*`, already used by A2L) are the course-wide identifiers; full mapping in §5. |
| R6 | Pronunciation ID collision: A1E P1–P11 vs A2E P1–P9 (different targets) | A1E §6, A2E §6 | Same fix: canonical `pron.*` keys; spine and mapping in §6. |
| R7 | **Present-continuous ownership gap.** A1L delivers formulaic preview only (*I'm just looking*); A2E teaches no continuous; A2L U10L04 (arrangements) assumes the paradigm exists | A1L §5 #12, A2E §5 exclusions, A2L §3 inbound edges | Insert `gram.pres_cont.now` (full paradigm, current activity: am/is/are + -ing, +/−/?) into **U7-L12** — the "I'm running late" lesson already uses the form as its spine chunk, making it the natural teaching anchor. U7-L12 becomes AIW + grammar; +1 est. minute. A2L U10L04 then extends to arrangements as planned. A2E band file must be updated at authoring time. |
| R8 | Comparatives ownership fuzzy: U6L09 "preview, paradigm deferred to U7–U8," but A2E defers it too; A2L U11L10 calls itself an "extension" of an intro that never happened | A1L §5 #13, A2E §5, A2L §5 #9 | **U11L10 owns the full comparative/superlative paradigm** (not an extension); U6L09's six frozen forms are its only inbound. A2L inbound-state assumption corrected accordingly. |
| R9 | Skill-mastery gate thresholds drift: 0.6/0.7 (A1E), 0.7 (A1L), 0.6 (A2E), 0.65 (A2L) | all bands §3 | Standardize: **0.65 course-wide gating threshold**, missions/exit tasks **0.70**, pilot-tunable ±0.05 per band [requires validation]. The universal in-lesson rule (speaking blocks unlock at ≥70% on the lesson's flashcard+cloze block) is kept course-wide — all bands adopted it. |
| R10 | FSRS daily review load differs (5 min → 4–6 → 8–10 → ≤20 min caps; new-card caps 12/day vs 40-card queue) | all bands §11 | Documented as a deliberate **ramp**, not drift: daily review target 5 → 6 → 10 → 15 min by band, new-card cap 8–12/day, all telemetry-tunable. Pre-checkpoint new-card throttling (A1L's −4/day rule) adopted course-wide before CP1, CP2, and GRAD-03. |
| R11 | Per-lesson AI micro-exchange rule exists only in A2 bands | A2E §2, A2L §2 vs A1 bands | Deliberate progressive release, kept: A1 embeds interactions in designated lessons (≥6/unit A1E, ≥7/unit A1L); from **U7 on, every non-review lesson ends with a 1–2-turn micro-exchange** inheriting the `micro` contract profile. |
| R12 | Cost figures per interaction vary in format and basis | §13 of each band | Consolidated cost table in §10.4, all [estimated] [requires validation against chosen model/TTS pricing]. |
| R13 | Evidence handoffs: U6 mission evidence rolls into CP2; A2E proposed CP2 Part-D exemption via passed missions | A1L §13d/appendix, A2E §13d | Handoff confirmed: CP2 consumes `S-problem-resolution` + written-interaction evidence from U6. Part-D exemption **held as an open owner decision** (§12) — both bands flagged it; not adopted by default because it weakens the checkpoint's fresh-performance property. |
| R14 | Accent-exposure policy differs (A1E: 1 variety; A1L: 30% intelligible non-native voices from U5; A2E: ≥3 accent profiles/unit; A2L: + phone-band/degraded audio) | §7 of each band | Consolidated as a course **accent ramp** (§7 listening spine): single clear variety (U1–U4) → +intelligible non-native voices ~30% (U5–U6) → ≥3 accent profiles/unit (U7–U9) → + degraded/phone-band audio (U10–U12). [requires validation: TTS vendor capability, see voice workstream]. |
| R15 | `vocabulary_translations` signatures differ slightly across bands (usage_note vs l1_contrast_note column) | A1E/A1L/A2E/A2L schema notes | Unified DDL in §8.1 (usage_note + provenance fields; contrast lives only in `l1_contrast_notes`). |
| R16 | `l1_contrast_notes` — four structurally different schemas | §5 of each band | Unified superset schema in §8.1 (scope, contrast_type, severity, render priority, predicted_errors with mechanism, distractor_hints, recast_example, remediation_refs, inherited flag). All four bands' filled examples remain valid content under the superset. |
| R17 | Counting policy: A1L proposed productive-vs-recognition vocab split; other bands count flat | A1L §4.1 | **Adopted course-wide:** recognition-tier items (signs, server scripts, reduced forms) tagged and reported separately (~15% of total); headline 1,800 includes both, with the split shown in §4. |

---

## 3. Full course map

### 3.1 Units × lessons × outcomes (summary table)

| Unit | Band | Title | CEFR | Lessons | New vocab | Exit outcome (learner-facing can-do) | Mission | Gate after |
|------|------|-------|------|---------|-----------|--------------------------------------|---------|-----------|
| U1 | A1E | Introducing Yourself | A1 | 18 | 110 | Greet, introduce self, spell name, exchange basic personal info | Three Introductions | — |
| U2 | A1E | My Day: Routines & Schedules | A1 | 18 | 125 | Describe daily routine with times; ask about others' days; read a schedule | A Day in Your Life | — |
| U3 | A1E | People Around Me | A1 | 18 | 125 | Describe family/friends: relation, age, appearance, job, ability | People in My Life | **Band Gate** |
| U4 | A1L | Places & Directions | A1+ | 18 | 140 | Ask for/understand/give simple directions; describe neighborhood; read signs | Get Me There | — |
| U5 | A1L | Food & Eating | A1+/A2 on-ramp | 18 | 155 | Order a meal, state preferences/dietary needs, understand a server | The Full Café | **Checkpoint 1** |
| U6 | A1L | Shopping & Money | A1+/A2 bridge | 19 | 150 | Make a purchase, ask price/size/availability, pay, resolve one problem | Buy It, Return It | — |
| U7 | A2E | Getting Around | A2.1 | 18 | 157 | Choose transport, buy tickets, follow/give directions, handle delays | Plan a Trip Across Town | — |
| U8 | A2E | Health & Needs | A2.1 | 19 | 163 | Describe symptoms, get pharmacy advice, book appointments, notify absence | At the Pharmacy | **Checkpoint 2** |
| U9 | A2E | Past Experiences | A2.1 | 18 | 160 | Recount past events; hold "how was your weekend?" exchanges; write a recount | Interview & Report | — |
| U10 | A2L | Plans & Future | A2/A2+ | 18 | 160 | Talk about plans, invite/respond, agree time & place, change a plan | Make a Real Plan | — |
| U11 | A2L | Work & Study | A2/A2+ | 18 | 185 | Describe job/skills/experience, handle a basic interview, write short workplace email | The Interview | — |
| U12 | A2L | Repair & Survive | A2+ | 20 | 170 | Repair breakdowns, phone tasks, report problems, finish tasks when things go wrong | Survive the Switchboard | **Graduation** |

The proposed 12-unit skeleton is retained with two refinements carried from the bands: U2 renamed from "My school day" to "My Day: Routines and Schedules" (adult work/home framing; school kept as a strand), and U6 explicitly labeled the A1/A2 bridge (R2).

### 3.2 Machine-readable course map (YAML)

```yaml
course_map:
  id: en-esl-a0-to-strong-a2
  direction: english_for_multilingual_learners
  ui_languages: 41
  priority_l1s: [es, zh, ar, vi, ht, pt, ru, uk, fa, so]
  frameworks: [CEFR_CV_2020, NCSSFL_ACTFL_2017, WIDA_slot]
  destination: "functional survival-conversational strong A2; finite; ends in graduation"
  totals:
    units: 12
    core_lessons: 220
    scheduled_sessions: 240   # core + 6 assessment + 8 open-conv slots + remediation pool
    vocab_items: 1800         # resolved ledger, incl. ~600 chunks; ~15% recognition-tier
    grammar_targets: 66       # incl. 2 formulaic previews (canonical gram.* keys)
    pron_target_families: 18  # canonical pron.* keys
    missions: 12
    major_ai_interactions: ~60
    est_hours: {median: 117, range: [95, 150]}   # [estimated] never a guarantee
  cefr_accounting: {a1_lessons: 90, a2_lessons: 130}   # U6 counted as A2 (R2)
  gating:
    skill_mastery_gate: 0.65        # R9; missions/exit tasks 0.70
    speaking_unlock: "lesson flashcard+cloze block >= 70%"
    proficiency_claims: performance_evidence_only
  bands:
    - {id: A1E, units: [U01,U02,U03], lessons: 54, vocab_new: 360, est_hours: 21.4,
       ratios: {structured: 0.78, guided: 0.22, open: 0.00}, gate: band_gate}
    - {id: A1L, units: [U04,U05,U06], lessons: 55, vocab_new: 445, est_hours: 28.0,
       ratios: {structured: 0.59, guided: 0.34, open: 0.07}, gate: checkpoint_1_after_U05}
    - {id: A2E, units: [U07,U08,U09], lessons: 55, vocab_new: 480, est_hours: 28.8,
       ratios: {structured: 0.46, guided: 0.36, open: 0.15}, gate: checkpoint_2_after_U08}
    - {id: A2L, units: [U10,U11,U12], lessons: 56, vocab_new: 515, est_hours: 38.5,
       ratios: {structured: 0.34, guided: 0.35, open: 0.30}, gate: graduation}
  units:   # lessons as [id, type, title]; types: V vocab, G grammar, P pron, L listening,
           # R reading, S speaking, W writing, C culture/pragmatics, X integrated/review,
           # M mission, AIW/AIS dedicated written/spoken AI interaction
    - id: U01
      band: A1E
      title: "Introducing Yourself"
      cefr: A1
      vocab_new: 110
      grammar: [gram.be.affirm, gram.poss.my_your, gram.article.a_an, gram.be.neg_short,
                gram.be.yn, gram.be.wh, gram.dem.this_that]
      pron: [pron.word_stress, pron.i_ii, pron.intonation_yn_wh, pron.spelling_aloud]
      mission: {id: M-U01, name: "Three Introductions", type: roleplay_register_shift}
      lessons:
        - [U01-L01, V, "Hello and goodbye"]
        - [U01-L02, V, "The alphabet and spelling (Latin-script test-out)"]
        - [U01-L03, S, "What's your name?"]
        - [U01-L04, V, "Numbers 0-20"]
        - [U01-L05, G, "Where are you from? (full sample in A1E band file)"]
        - [U01-L06, V, "Nationalities and languages"]
        - [U01-L07, G, "be: I am / you are / she is"]
        - [U01-L08, G, "be: negatives and short answers"]
        - [U01-L09, G, "Are you...? yes/no questions with be"]
        - [U01-L10, G, "What, where, who: WH-questions with be"]
        - [U01-L11, V, "Numbers 21-100 and phone numbers"]
        - [U01-L12, W, "Filling in a form"]
        - [U01-L13, V, "Jobs"]
        - [U01-L14, G, "This is / that is: things around you"]
        - [U01-L15, C, "Survival phrases: please, sorry, can you repeat that?"]
        - [U01-L16, P, "Sound lab 1: ship vs sheep, question melody"]
        - [U01-L17, S, "Meet a new classmate (integration)"]
        - [U01-L18, M, "Unit review + Mission: Three Introductions"]
    - id: U02
      band: A1E
      title: "My Day: Routines and Schedules"
      cefr: A1
      vocab_new: 125
      grammar: [gram.pres_simple.affirm, gram.seq.first_then, gram.pres_simple.neg,
                gram.pres_simple.yn, gram.pres_simple.3s, gram.pres_simple.3s_neg_q,
                gram.prep.time, gram.adv.frequency, gram.like_n_ing]
      pron: [pron.final_s, pron.weak_forms, pron.linking, pron.ae_uh]
      mission: {id: M-U02, name: "A Day in Your Life", type: describe_plus_followups}
      lessons:
        - [U02-L01, V, "Days of the week"]
        - [U02-L02, V, "What time is it?"]
        - [U02-L03, V, "Daily routine verbs"]
        - [U02-L04, G, "I work, you study: present simple"]
        - [U02-L05, W, "My morning, step by step"]
        - [U02-L06, G, "I don't...: negatives with don't"]
        - [U02-L07, G, "Do you...? questions and short answers"]
        - [U02-L08, G, "He works, she studies: third-person -s"]
        - [U02-L09, G, "Doesn't / does she...?"]
        - [U02-L10, G, "At 7:00 on Monday in the morning"]
        - [U02-L11, G, "Always, sometimes, never"]
        - [U02-L12, V, "School and work words"]
        - [U02-L13, S, "What time does it start?"]
        - [U02-L14, G, "Free time: I like..."]
        - [U02-L15, P, "Sound lab 2: reduced speech (receptive)"]
        - [U02-L16, W, "Writing: my day in five sentences"]
        - [U02-L17, AIW, "Schedule gap (written information gap)"]
        - [U02-L18, M, "Unit review + Mission: A Day in Your Life"]
    - id: U03
      band: A1E
      title: "People Around Me"
      cefr: A1
      vocab_new: 125
      grammar: [gram.have_has, gram.poss.s_full, gram.noun.plurals, gram.adj.order_be_have,
                gram.dem.these_those, gram.q.who_how_old, gram.can.ability]
      pron: [pron.theta_eth, pron.final_clusters, pron.can_cant]
      mission: {id: M-U03, name: "People in My Life", type: photo_showtell_followups}
      gate_after: band_gate
      lessons:
        - [U03-L01, V, "My family"]
        - [U03-L02, G, "I have two brothers: have/has"]
        - [U03-L03, G, "Maria's brother: possessive 's"]
        - [U03-L04, S, "How old is she?"]
        - [U03-L05, G, "One child, two children: plurals"]
        - [U03-L06, V, "Tall, short, long hair: appearance"]
        - [U03-L07, G, "She's tall / she has long hair"]
        - [U03-L08, V, "Friendly, funny, quiet: personality"]
        - [U03-L09, V, "My mother is a nurse"]
        - [U03-L10, G, "These and those"]
        - [U03-L11, G, "Who's that?"]
        - [U03-L12, G, "She can drive: can/can't"]
        - [U03-L13, V, "My best friend"]
        - [U03-L14, S, "In this photo..."]
        - [U03-L15, P, "Sound lab 3: this, that, three, mother"]
        - [U03-L16, W, "Writing: family paragraph + AI message reply"]
        - [U03-L17, AIS, "Ask me about my family (learner interviews AI)"]
        - [U03-L18, M, "Unit review + Mission: People in My Life"]
    - id: U04
      band: A1L
      title: "Places & Directions"
      cefr: "A1+"
      vocab_new: 140
      grammar: [gram.exist.there_is_are, gram.prep.place, gram.imperatives.directions,
                gram.ordinals_addresses, gram.can.requests]
      pron: [pron.i_ii, pron.compound_stress]
      mission: {id: M-U04, name: "Get Me There", type: directions_info_gap_repair}
      lessons:
        - [U04-L01, V, "Places in town I"]
        - [U04-L02, G, "There is / there are"]
        - [U04-L03, G, "Where exactly? Prepositions of place"]
        - [U04-L04, V, "Places in town II + Is there a ... near here?"]
        - [U04-L05, P, "/I/ vs /i:/; compound stress (BUS stop)"]
        - [U04-L06, S, "Excuse me, where is...?"]
        - [U04-L07, G, "Turn left, go straight: imperatives"]
        - [U04-L08, L, "Follow the map"]
        - [U04-L09, G, "Ordinals and addresses"]
        - [U04-L10, AIS, "Directions roleplay (map, one unexpected turn)"]
        - [U04-L11, V, "Inside the building"]
        - [U04-L12, G, "Can/can't for possibility + polite requests"]
        - [U04-L13, R, "Signs and notices (sight tier)"]
        - [U04-L14, AIW, "Text me the directions"]
        - [U04-L15, L, "Real speed: reductions in directions"]
        - [U04-L16, C, "Strangers in public: openers, volume, closing"]
        - [U04-L17, X, "Unit 4 review"]
        - [U04-L18, M, "Exit mission: Get Me There"]
    - id: U05
      band: A1L
      title: "Food & Eating"
      cefr: "A1+/A2-onramp"
      vocab_new: 155
      grammar: [gram.count.a_an_some, gram.some_any, gram.would_like, gram.much_many]
      pron: [pron.i_ii, pron.ae_uh, pron.final_s]
      mission: {id: M-U05, name: "The Full Cafe", type: transaction_with_problem}
      gate_after: checkpoint_1
      lessons:
        - [U05-L01, V, "Everyday food I"]
        - [U05-L02, G, "Count it or not: a/an/some"]
        - [U05-L03, V, "Everyday food II: drinks, snacks, meals"]
        - [U05-L04, G, "some / any"]
        - [U05-L05, P, "chip vs cheap; plural -s allomorphs"]
        - [U05-L06, G, "Likes and dislikes"]
        - [U05-L07, G, "I like vs I'd like (full sample in A1L band file)"]
        - [U05-L08, S, "At the cafe: menu + first order"]
        - [U05-L09, L, "Understanding your server"]
        - [U05-L10, G, "much / many / a lot of; How much is it?"]
        - [U05-L11, V, "What I eat: meals and routines (trim candidate)"]
        - [U05-L12, R, "Menus, labels, prices"]
        - [U05-L13, AIS, "Cafe roleplay with a twist (We're out of that)"]
        - [U05-L14, AIW, "Let's eat: invite and reply"]
        - [U05-L15, C, "Food culture and pragmatics; allergies directness"]
        - [U05-L16, L, "Fast counter speech"]
        - [U05-L17, X, "Unit 5 review"]
        - [U05-L18, M, "Exit mission: The Full Cafe"]
    - id: U06
      band: A1L
      title: "Shopping & Money"
      cefr: "A1+/A2-bridge"
      vocab_new: 150
      grammar: [gram.dem.full_paradigm, gram.too_adj, gram.pres_cont.formulaic_preview,
                gram.compar.formulaic_preview]
      pron: [pron.teen_ty, pron.final_clusters]
      mission: {id: M-U06, name: "Buy It, Return It", type: two_scene_transaction_repair}
      lessons:
        - [U06-L01, V, "Money talks: prices and numbers"]
        - [U06-L02, P, "thirteen vs thirty"]
        - [U06-L03, V, "Stores and things to buy"]
        - [U06-L04, G, "this / that / these / those"]
        - [U06-L05, S, "Do you have...? / I'm looking for..."]
        - [U06-L06, V, "Clothes, colors, sizes (+ I'm just looking, preview)"]
        - [U06-L07, G, "too + adjective"]
        - [U06-L08, L, "Prices, totals, announcements"]
        - [U06-L09, G, "Cheaper, bigger, better (formulaic preview; paradigm owned by U11-L10)"]
        - [U06-L10, S, "Paying: cash or card"]
        - [U06-L11, R, "Tags, ads, and the fine print"]
        - [U06-L12, G, "Problems and returns"]
        - [U06-L13, P, "Final clusters: asked, costs, receipts"]
        - [U06-L14, AIS, "Clothing store roleplay (size problem)"]
        - [U06-L15, AIW, "Marketplace messages (sample in A1L band file)"]
        - [U06-L16, C, "Shopping norms (trim candidate; market-parameterized)"]
        - [U06-L17, L, "Checkout at full speed"]
        - [U06-L18, X, "Unit 6 + band cumulative review"]
        - [U06-L19, M, "Exit mission: Buy It, Return It"]
    - id: U07
      band: A2E
      title: "Getting Around"
      cefr: "A2.1"
      vocab_new: 157   # 147 band + 10 chunk uplift (R4)
      grammar: [gram.q.info_review, gram.by_transport, gram.imperatives.movement,
                gram.it_takes, gram.have_to, gram.pres_cont.now]   # last item added per R7
      pron: [pron.compound_stress, pron.final_clusters, pron.i_ii, pron.linking]
      mission: {id: M-U07, name: "Plan a Trip Across Town", type: open_planning_constraints}
      lessons:
        - [U07-L01, V, "City transport words"]
        - [U07-L02, V, "Tickets, fares and schedules"]
        - [U07-L03, G, "How do you get to...?"]
        - [U07-L04, L, "Station announcements"]
        - [U07-L05, P, "Word stress + final clusters"]
        - [U07-L06, G, "Directions: imperatives + movement prepositions"]
        - [U07-L07, V, "Landmarks and city places"]
        - [U07-L08, S, "Guided roleplay: asking for directions"]
        - [U07-L09, L, "Follow the route"]
        - [U07-L10, G, "How long does it take?"]
        - [U07-L11, R, "Transit apps and timetables"]
        - [U07-L12, AIW, "I'm running late + present continuous paradigm (R7)"]
        - [U07-L13, G, "have to / don't have to"]
        - [U07-L14, P, "Reductions and /I-i:/"]
        - [U07-L15, AIS, "Buying a ticket (information gap; sample in A2E band file)"]
        - [U07-L16, W, "Ask about travel options"]
        - [U07-L17, X, "Unit 7 cumulative review (U5-U7)"]
        - [U07-L18, M, "Mission: Plan a Trip Across Town"]
    - id: U08
      band: A2E
      title: "Health & Needs"
      cefr: "A2.1"
      vocab_new: 163   # 153 + 10 uplift
      grammar: [gram.feel_have_symptoms, gram.should, gram.need_to, gram.why_because]
      pron: [pron.theta_eth, pron.ae_uh, pron.sentence_stress]
      mission: {id: M-U08, name: "At the Pharmacy", type: real_world_simulation}
      gate_after: checkpoint_2
      lessons:
        - [U08-L01, V, "Body parts"]
        - [U08-L02, V, "Symptoms and illnesses"]
        - [U08-L03, G, "feel + adjective / have + noun"]
        - [U08-L04, P, "/theta eth/ minimal pairs"]
        - [U08-L05, L, "At the pharmacy"]
        - [U08-L06, G, "should / shouldn't"]
        - [U08-L07, S, "Guided advice swap"]
        - [U08-L08, V, "Pharmacy and medicine words"]
        - [U08-L09, AIW, "Message your teacher/boss: I'm sick (sample in A2E band file)"]
        - [U08-L10, G, "need to / have to"]
        - [U08-L11, R, "Medicine labels and clinic notices"]
        - [U08-L12, L, "Booking by phone"]
        - [U08-L13, AIS, "Call the clinic"]
        - [U08-L14, V, "Emergencies and getting help"]
        - [U08-L15, G, "why? / because..."]
        - [U08-L16, P, "Sentence stress + /ae-uh/"]
        - [U08-L17, W, "Clinic intake form + pharmacist question"]
        - [U08-L18, X, "Unit 8 cumulative review (U6-U8)"]
        - [U08-L19, M, "Mission: At the Pharmacy"]
    - id: U09
      band: A2E
      title: "Past Experiences"
      cefr: "A2.1"
      vocab_new: 160   # 150 + 10 uplift
      grammar: [gram.past.was_were, gram.past.regular_ed, gram.past.irregular_1,
                gram.past.did_neg_q, gram.past.irregular_2_seq]
      pron: [pron.ed_endings, pron.weak_forms]
      mission: {id: M-U09, name: "Interview & Report", type: interview_reportback}
      lessons:
        - [U09-L01, G, "was / were"]
        - [U09-L02, V, "Past time expressions"]
        - [U09-L03, L, "How was your weekend?"]
        - [U09-L04, G, "Past simple: regular verbs (full sample in A2E band file)"]
        - [U09-L05, P, "-ed endings /t d id/"]
        - [U09-L06, S, "Guided Q&A: yesterday"]
        - [U09-L07, G, "Irregular past, set 1"]
        - [U09-L08, R, "My first week in Chicago"]
        - [U09-L09, G, "didn't / Did you...?"]
        - [U09-L10, P, "Fast past questions (didja, weak was/were)"]
        - [U09-L11, AIW, "Reply to a friend: how was your weekend?"]
        - [U09-L12, V, "Activities and life events"]
        - [U09-L13, L, "A story in order"]
        - [U09-L14, G, "Irregular set 2 + sequencing"]
        - [U09-L15, S, "Picture-story retell"]
        - [U09-L16, W, "Write a short recount"]
        - [U09-L17, AIS, "Talk about a memorable day"]
        - [U09-L18, M, "Cumulative review + Mission: Interview & Report"]
    - id: U10
      band: A2L
      title: "Plans & Future"
      cefr: "A2/A2+"
      vocab_new: 160   # 145 + 15 uplift
      grammar: [gram.future.time_expressions, gram.future.going_to, gram.pres_cont.arrangements,
                gram.future.will, gram.invite.would_like_lets, gram.time_clauses]
      pron: [pron.reductions_receptive, pron.contrastive_stress, pron.final_s]
      mission: {id: M-U10, name: "Make a Real Plan", type: negotiation_complication}
      lessons:
        - [U10-L01, V, "Time to plan"]
        - [U10-L02, G, "be going to for plans (full sample in A2L band file)"]
        - [U10-L03, S, "What are you going to do?"]
        - [U10-L04, G, "Arrangements: present continuous"]
        - [U10-L05, P, "Sound lab: gonna and wanna"]
        - [U10-L06, V, "Out and about"]
        - [U10-L07, S, "Inviting and responding"]
        - [U10-L08, G, "will: decisions, offers, promises"]
        - [U10-L09, L, "Weather and plans"]
        - [U10-L10, AIW, "Writing lab: confirm the plan (sample in A2L band file)"]
        - [U10-L11, G, "Time clauses: when / before / after"]
        - [U10-L12, S, "Scheduling with a busy person"]
        - [U10-L13, V, "Goals and dreams (trim candidate)"]
        - [U10-L14, L, "Listening lab: fast plans"]
        - [U10-L15, P, "Sound lab: stress to fix it"]
        - [U10-L16, W, "My next year"]
        - [U10-L17, X, "Unit 10 review"]
        - [U10-L18, M, "Mission: Make a Real Plan"]
    - id: U11
      band: A2L
      title: "Work & Study"
      cefr: "A2/A2+"
      vocab_new: 185   # 165 + 20 uplift (interview-answer frames)
      grammar: [gram.have_to.extended, gram.permission.could_i, gram.perf.experience_formulaic,
                gram.compar.full_paradigm, gram.like_ing_vs_would_like]
      pron: [pron.word_stress, pron.ed_endings, pron.reductions_receptive]
      mission: {id: M-U11, name: "The Interview", type: interview_unexpected_question}
      lessons:
        - [U11-L01, V, "Jobs and workplaces"]
        - [U11-L02, G, "have to / don't have to"]
        - [U11-L03, S, "Talking about your job"]
        - [U11-L04, V, "Skills I have"]
        - [U11-L05, G, "Have you ever...?"]
        - [U11-L06, L, "Instructions at work"]
        - [U11-L07, P, "Sound lab: word stress at work"]
        - [U11-L08, W, "Writing lab: the application"]
        - [U11-L09, S, "Asking the boss"]
        - [U11-L10, G, "Better, worse, the best (owns full paradigm, R8)"]
        - [U11-L11, V, "School and training (trim candidate)"]
        - [U11-L12, L, "Listening lab: the interview"]
        - [U11-L13, AIS, "Mini job interview (sample in A2L band file)"]
        - [U11-L14, G, "Like it or want it?"]
        - [U11-L15, W, "Writing lab: email your boss or teacher"]
        - [U11-L16, C, "Workplace small talk"]
        - [U11-L17, X, "Unit 11 review"]
        - [U11-L18, M, "Mission: The Interview"]
    - id: U12
      band: A2L
      title: "Repair & Survive"
      cefr: "A2+"
      vocab_new: 170   # 140 + 30 graduation-survival chunk pack (R4)
      grammar: [gram.requests.could_would, gram.check_confirm, gram.indef_pronouns_too_enough,
                gram.cross_tense]
      pron: [pron.reductions_receptive, pron.contrastive_stress, pron.personal_top3,
             pron.final_clusters]
      mission: {id: M-U12, name: "Survive the Switchboard", type: phone_task_chain_repair}
      gate_after: graduation
      lessons:
        - [U12-L01, V, "When you don't understand (repair kit)"]
        - [U12-L02, P, "Sound lab: hearing fast English"]
        - [U12-L03, S, "Repair in action"]
        - [U12-L04, G, "Polite requests: could / would"]
        - [U12-L05, X, "Say it another way (circumlocution)"]
        - [U12-L06, L, "Phone survival I: listening"]
        - [U12-L07, S, "Phone survival II: speaking"]
        - [U12-L08, V, "Problems and solutions"]
        - [U12-L09, S, "Complaining politely"]
        - [U12-L10, AIW, "Writing lab: report a problem"]
        - [U12-L11, G, "Checking and confirming"]
        - [U12-L12, L, "Announcements and changes"]
        - [U12-L13, X, "Urgent needs"]
        - [U12-L14, S, "When plans go wrong (tense switching)"]
        - [U12-L15, P, "Sound lab: your top three (personalized)"]
        - [U12-L16, W, "Writing lab: the connected message"]
        - [U12-L17, C, "Culture lab: soft no's and small talk"]
        - [U12-L18, X, "Unit 12 review + full-course wave 1"]
        - [U12-L19, X, "Graduation Gauntlet (adaptive full-course review)"]
        - [U12-L20, M, "Mission: Survive the Switchboard (sample in A2L band file)"]
  assessments:
    band_gate:
      after: U03
      minutes: 30
      evidence: [fsrs_vocab_stability_80pct, grammar_adaptive_70pct,
                 spoken_interview_rubric_6of8, written_paragraph_rubric_4of6]
      outcomes: [pass, pass_with_review, remediate]
    checkpoint_1:
      after: U05
      certifies: U01-U05
      minutes: [25, 35]
      strands: [knowledge_probe_70pct, listening_6of8, writing_rubric_meets,
                spoken_scenario_two_scenes, repair_evidence_2_moves]
      outcomes: [passed, passed_with_review, remediation]
      retake: strand_level_only_24h_cooldown
    checkpoint_2:
      after: U08
      certifies: U06-U08
      minutes: 40
      parts: [adaptive_quiz_80v_70g, listening_6of8, written_task_4of6,
              spoken_roleplay_10of16_plus_repair, micro_conversation_unscored_past_baseline]
      outcomes: [passed, passed_with_review, remediation]
      escalation: "3 failed cycles on same part -> human flag / alt format capped at passed_with_review"
    graduation:
      sessions: [GRAD-01_mock, GRAD-02_conditional_tuneup, GRAD-03_final]
      conversation: {minutes: 15, phases: [warmup, familiar_topics, transaction_planted_breakdown,
                     unexpected_winddown], adaptive: true}
      writing: {words: 80, prompt_family: past_present_future_plus_request}
      rubrics: {conversation: {dims: 7, scale: [0,4], pass_total: 18, dim_floor: 2,
                repair_floor_non_waivable: 2},
                writing: {dims: 4, scale: [0,4], pass_total: 9, no_zero: true}}
      outcomes: [graduated, graduated_with_review, remediation, repeat_missions]
```

---

## 4. Vocabulary budget and recycling plan

### 4.1 Resolved budget by unit (R4, R17)

Counting policy [proposed, course-wide]: "item" = lemma OR multiword chunk with its own FSRS card; irregular past forms are `form_of` cards (counted, ~20 in U9); recognition-tier items (signs, server scripts, reduced forms) tagged `receptive` / `register: sign` and reported separately.

| Unit | Single words | Chunks | Unit total | Cumulative | Recognition-tier ≈ | Uplift (R4, all chunks) |
|------|-------------|--------|-----------|------------|--------------------|-------------------------|
| U1 | 82 | 28 | 110 | 110 | ~5% | — |
| U2 | 92 | 33 | 125 | 235 | ~8% | — |
| U3 | 97 | 28 | 125 | 360 | ~8% | — |
| U4 | 100 | 40 | 140 | 500 | ~18% (signs) | — |
| U5 | 107 | 48 | 155 | 655 | ~15% (server scripts) | — |
| U6 | 108 | 42 | 150 | 805 | ~15% | — |
| U7 | 100 | 57 | 157 | 962 | ~12% | +10 |
| U8 | 104 | 59 | 163 | 1,125 | ~12% | +10 |
| U9 | 102 | 58 | 160 | 1,285 | ~10% | +10 |
| U10 | 100 | 60 | 160 | 1,445 | ~10% | +15 |
| U11 | 120 | 65 | 185 | 1,630 | ~10% | +20 |
| U12 | 85 | 85 | 170 | 1,800 | ~15% (phone/menu scripts) | +30 |
| **Course** | **~1,197** | **~603** | **1,800** | | **~15% overall** | **+95** |

- **Verdict on the owner's 1,800–2,200 target:** hold at the **low end (~1,800)** and spend margin on chunk depth, formulaic frames, and irregular-form coverage — the unanimous recommendation of both A2 bands, now adopted. Strong-A2 conversational ability is chunk-limited, not lemma-limited [proposed]. Per-lesson load ramps 6.7 → 8.1 → ~8.7 items/lesson; **abort rule:** FSRS lapse rate >30% on any lesson's cohort in pilot ⇒ cut that lesson's load before `operational` [requires validation].
- Selection principles (unified from bands): frequency-first (NGSL-informed [assumption]) with survival/communicative override; chunks as first-class FSRS rows (`part_of_speech: chunk`); sight-vocabulary tier for signs; number language drilled as a skill, not vocabulary rows; every item must be scriptable into ≥1 AI interaction or it is cut.

### 4.2 Recycling plan — how every important item recurs across all eight contexts (structural mechanisms)

| # | Context (owner list) | Structural mechanism that guarantees recurrence | Enforcement |
|---|----------------------|--------------------------------------------------|-------------|
| 1 | Comprehension | First exposure: flashcard/matching/reading in origin lesson; audio on every card | schema requires `vocab_lesson_map` origin row + audio asset |
| 2 | Retrieval | FSRS card created at first productive use; card direction flips receptive→productive on 2nd exposure | existing `vocab_card_state`; new-card caps §2 R10 |
| 3 | Listening | Later listening passages must be ≥70% known vocabulary — which forces planted recycling; reductions recycle the same chunks at natural pace | vocab-boundary lint on passage scripts (§9.3 gate 1) |
| 4 | Writing | Writing tasks' required-move lists name prior-unit chunks (e.g., U6 marketplace message requires U5 politeness spine); dictation exercises re-spell earlier items | key-completeness lint on required_moves |
| 5 | Controlled speaking | ASR shadow/production items; ≥20% of every lesson's exercise slots are review items from ≥2 lessons back ("N−2 rule"), FSRS/error-weighted | `exercises.review_source_unit` audit (§9.3 gate 5) |
| 6 | Guided interaction | Every interaction contract's `assumed_vocabulary` field must be drawn from already-taught items — recycling by construction | contract lint: assumed_vocabulary ⊆ cumulative taught set |
| 7 | Spontaneous conversation | Mission success criteria name target chunks; open-conversation AI keeps vocabulary in-band +5% stretch; errors harvested silently to the error bank | mission rubric fields; open-conv config |
| 8 | Spaced review | Daily FSRS queue + error-bank regeneration (learner's own errors become cloze/dictation within 24–48h) + review waves: unit review → band cumulative (U6-L18, U8-L18) → full-course wave 1 (U12-L18) → Graduation Gauntlet (U12-L19) | review scheduler; `saved_errors` table |

**Coverage contract (lint-enforced):** every productive item appears in ≥1 productive exercise in its origin lesson AND in ≥2 later lessons via `vocab_lesson_map`; orphans are build failures. Cross-band recycling is planted into the next band's lesson briefs (handoff notes already present in all band files).

**Worked example — chunk "I'd like…, please." (taught U5-L07):**

| Context | Recurrence |
|---------|-----------|
| Comprehension | U5-L07 flashcard + minimal-contrast listening (*I like* vs *I'd like*) |
| Retrieval | FSRS card from U5-L07; boosted on misuse (contract rule) |
| Listening | U5-L09/L16 server exchanges; U8-L12 phone booking ("I'd like to make an appointment") |
| Writing | U5-L14 invitation reply; U11-L15 email requests (register-up variant *I would like to*) |
| Controlled speaking | U5-L07 ASR pair drill (scored on /d/ presence); U6-L10 payment dialogues |
| Guided interaction | U5-L13 café roleplay; U8-L13 clinic call; U10-L07 invitation responses |
| Spontaneous | M-U05 café mission; GRAD-03 Phase 3 transaction |
| Spaced review | FSRS lifetime card; error-bank category `would_like_vs_like` regenerates drills |

---

## 5. Grammar spine (course-wide, canonical `gram.*` keys — R5)

66 targets incl. 2 formulaic previews. Sequence is load-bearing; each point exists because a communicative task needs it. Legacy band-local IDs shown for traceability.

| Canonical key | First taught | Legacy ID | Extended / recycled at | Communicative need |
|---------------|--------------|-----------|------------------------|--------------------|
| gram.be.affirm | U01-L07 | A1E G1/G3 | everywhere | say who you/others are |
| gram.poss.my_your | U01-L03 | A1E G2 | U03 full set | my name / your name |
| gram.article.a_an | U01-L13/14 | A1E G4 | U05 countability | state job, identify objects |
| gram.be.neg_short | U01-L08 | A1E G5 | — | correct wrong info |
| gram.be.yn | U01-L09 | A1E G6 | U07 review | check information |
| gram.be.wh | U01-L10 | A1E G7 | U07 review | get personal info |
| gram.dem.this_that | U01-L14 | A1E G8 | U06-L04 full | point and ask |
| gram.pres_simple.affirm | U02-L04 | A1E G9 | lifetime | describe habits |
| gram.seq.first_then | U02-L05 | A1E G10 | U09-L14, U11-L06 | order events |
| gram.pres_simple.neg | U02-L06 | A1E G11 | — | state non-habits |
| gram.pres_simple.yn | U02-L07 | A1E G12 | — | ask about habits |
| gram.pres_simple.3s | U02-L08 | A1E G13 | U03-L09 | others' routines |
| gram.pres_simple.3s_neg_q | U02-L09 | A1E G14 | — | 3rd-person Q/neg |
| gram.prep.time | U02-L10 | A1E G15 | U04-L03 contrast | anchor events in time |
| gram.adv.frequency | U02-L11 | A1E G16 | U05-L11 | say how often |
| gram.like_n_ing | U02-L14 | A1E G17 | U05-L06, U11-L14 | preferences |
| gram.have_has | U03-L02 | A1E G18 | U08-L03 symptoms | possession |
| gram.poss.s_full | U03-L03 | A1E G19 | — | relate people |
| gram.noun.plurals | U03-L05 | A1E G20 | U05 count/mass | groups |
| gram.adj.order_be_have | U03-L07 | A1E G21 | U06 clothes | describe people/things |
| gram.dem.these_those | U03-L10 | A1E G22 | U06-L04 | groups near/far |
| gram.q.who_how_old | U03-L04/11 | A1E G23 | — | identify people |
| gram.can.ability | U03-L12 | A1E G24 | U04-L12 | abilities |
| gram.exist.there_is_are | U04-L02 | A1L #1 | U07 city talk | what exists nearby |
| gram.prep.place | U04-L03 | A1L #2 | U07-L06 movement | locate places |
| gram.imperatives.directions | U04-L07 | A1L #3 | U07-L06 | give/follow directions |
| gram.ordinals_addresses | U04-L09 | A1L #4 | U07, U12 read-backs | addresses, floors |
| gram.can.requests | U04-L12 | A1L #5 | U12-L04 could/would | ask for help |
| gram.count.a_an_some | U05-L02 | A1L #6 | — | food/possessions |
| gram.some_any | U05-L04 | A1L #7 | U12-L05 indef. pronouns | availability |
| gram.would_like | U05-L07 | A1L #8 | U10-L07, U11-L14 | polite ordering — the band's highest-value pragmatic grammar |
| gram.much_many | U05-L10 | A1L #9 | U06 prices | quantity and price |
| gram.dem.full_paradigm | U06-L04 | A1L #10 | — | deixis in shops |
| gram.too_adj | U06-L07 | A1L #11 | U12-L05 too/enough | state a problem |
| gram.pres_cont.formulaic_preview | U06-L06 | A1L #12 | → gram.pres_cont.now | *I'm just looking* |
| gram.compar.formulaic_preview | U06-L09 | A1L #13 | → gram.compar.full_paradigm | compare 2 items |
| gram.q.info_review | U07-L03 | A2E G1 | — | route information |
| gram.by_transport | U07-L03 | A2E G3 | — | how you travel |
| gram.imperatives.movement | U07-L06 | A2E G2 | — | multi-step directions |
| gram.it_takes | U07-L10 | A2E G4 | — | duration; dummy-it |
| gram.pres_cont.now | **U07-L12** | **new (R7)** | U10-L04 arrangements | current activity (*I'm running late*) |
| gram.have_to | U07-L13 | A2E G5 | U11-L02 extended | rules and necessity |
| gram.feel_have_symptoms | U08-L03 | A2E G6 | U12-L13 | report symptoms |
| gram.should | U08-L06 | A2E G7 | — | give/get advice |
| gram.need_to | U08-L10 | A2E G8 | — | polite necessity |
| gram.why_because | U08-L15 | A2E G9 | U10-L16 reasons | sustain exchange +1 turn |
| gram.past.was_were | U09-L01 | A2E G10 | U12-L14 | locate self in past |
| gram.past.regular_ed | U09-L04 | A2E G11 | lifetime | recount actions |
| gram.past.irregular_1 | U09-L07 | A2E G12 | — | highest-freq past events |
| gram.past.did_neg_q | U09-L09 | A2E G13 | — | past conversation |
| gram.past.irregular_2_seq | U09-L14 | A2E G14 | U12-L16 | chain events into story |
| gram.future.time_expressions | U10-L01 | A2L #1 | — | place plans in time |
| gram.future.going_to | U10-L02 | A2L #2 | lifetime | decided plans |
| gram.pres_cont.arrangements | U10-L04 | A2L #3 | — | diary-fixed plans |
| gram.future.will | U10-L08 | A2L #4 | — | decisions/offers |
| gram.invite.would_like_lets | U10-L07 | A2L #5 | — | invitations |
| gram.time_clauses | U10-L11 | A2L #6 | — | sequence future actions |
| gram.have_to.extended | U11-L02 | A2L #7 | — | workplace obligation |
| gram.permission.could_i | U11-L09 | A2L (in #11) | — | high-stakes requests |
| gram.perf.experience_formulaic | U11-L05 | A2L #8 | — | *Have you ever…?* frames; full paradigm deferred post-course [proposed] |
| gram.compar.full_paradigm | U11-L10 | A2L #9 | — | choose between options (owns paradigm, R8) |
| gram.like_ing_vs_would_like | U11-L14 | A2L #10 | — | preference vs desire |
| gram.requests.could_would | U12-L04 | A2L #11 | — | softened requests |
| gram.check_confirm | U12-L11 | A2L #12 | GRAD read-backs | echo Qs, read-backs |
| gram.indef_pronouns_too_enough | U12-L05/08 | A2L #13 | — | circumlocution fuel |
| gram.cross_tense | U12-L14/19 | A2L #14 | GRAD-03 | switch past/present/future in one conversation — strongest predictor of graduation success [assumption] |

**Deliberate course exclusions** (deferred to post-course B1 conversation tools): full present perfect (unfinished time, for/since), passive, conditionals beyond frozen chunks, reported speech, articles mastery as a gate. Each exclusion was independently proposed by ≥1 band and none conflicts.

Every `gram.*` target with contrast rating med/high ships `l1_contrast_notes` rows for the 10 priority L1s before its lesson leaves `draft` (§9); remaining ~31 L1s inherit typologically-nearest rows flagged `inherited: true` [requires validation by L1 informants].

---

## 6. Pronunciation spine (canonical `pron.*` keys — R6)

Policy (unanimous across bands): **intelligibility payoff × priority-L1 coverage**; accent erasure is a non-goal; perception before production; ASR scores only the drilled feature, never global accent. ASR thresholds tuned against accented-speech data, not native models [requires validation].

| Canonical key | Introduced | Maintained / extended | Priority L1s most affected | Payoff rationale |
|---------------|-----------|------------------------|----------------------------|------------------|
| pron.word_stress | U01 (awareness) | U07-L05, U11-L07 | zh, vi, ht, fa | wrong stress wrecks recognition more than wrong phonemes |
| pron.spelling_aloud | U01-L02 | forms/phone tasks | ar, zh, ru, uk, fa | spelling your name is a survival act |
| pron.i_ii | U01-L16 | U04-L05, U05-L05, U07-L14, U12-L15 | es, ar, vi, so, ht, pt, ru, uk | live/leave, chip/cheap — transactional failures |
| pron.intonation_yn_wh | U01-L16 | U08-L16 | all | question recognition at zero grammar cost |
| pron.final_s | U02-L08 | U05-L05, U10-L02 | vi, zh, es | one sound system carries 3 grammar systems (-s, plural, 's) |
| pron.weak_forms | U02-L15 (receptive) | U09-L10 | all | hearing /dʒə/, weak was/were — else real speech is opaque |
| pron.linking | U02-L15 | U07-L09, U12-L02 | zh, vi, ar | word-boundary recognition |
| pron.ae_uh | U02 (woven) | U05-L05, U08-L16, U11-L01 | es, pt, ru, uk, fa | cap/cup, back/buck in dense lexis |
| pron.theta_eth | U03-L15 | U08-L04, U12-L01 | nearly all 10 | this/three/mother/throat — L1-diagnostic substitutions |
| pron.final_clusters | U03-L15 | U06-L13, U07-L05, U12-L15 | vi, zh, so, pt, es, ar | cluster deletion deletes grammar (-ed, -s) |
| pron.can_cant | U03-L12 | U04-L12 | all | meaning-inverting contrast |
| pron.compound_stress | U04-L05 | U07-L05 | zh, vi | BUS stop / POST office recognition |
| pron.teen_ty | U06-L02 | U10-L15 rescue | all | price errors are money errors |
| pron.ed_endings | U09-L05 | U11-L05, U12-L15 | all | audible present/past difference — grammar-critical |
| pron.sentence_stress | U08-L16 | woven | all | carries advice/symptom exchanges |
| pron.contrastive_stress | U10-L15 | U12-L11 | all | the repair tool (*FRIday, not SUNday*); feeds graduation repair rubric |
| pron.reductions_receptive | U02-L15 → | U04-L15, U05-L16, U09-L10, U10-L05, U11-L12, U12-L02 | all | gonna/wanna/didja recognition mandatory; production optional |
| pron.personal_top3 | U12-L15 | — | per learner | analytics-chosen personal intelligibility targets |

Delivery rules (course-wide): every lesson carries a 60–90 s pronunciation micro-slot (discrimination → shadowing → ASR-scored production); Sound Labs are the deep dives; discrimination gate (≥7/10) before production scoring; failed production re-enters as perception first. Minimal-pair inventories per band are in the band files; minimal-pair cards typed `pron_pair` in FSRS [proposed].

---

## 7. Progressive release, listening/writing spines, and hour accounting

### 7.1 Ratio compliance vs owner guidance

| Phase | Owner guidance (s/g/o) | Delivered | Verdict |
|-------|------------------------|-----------|---------|
| Early A1 (U1–U3) | 70–80 / 20–30 / ~0 | 78 / 22 / 0 | ✓ |
| Late A1 (U4–U6) | 55–65 / 30–40 / 5–10 | 59 / 34 / 7 | ✓ |
| Early A2 (U7–U9) | 40–50 / 35–45 / 10–20 | 46 / 36 / 15 (+3 assessment) | ✓ |
| Late A2 (U10–U12) | 25–35 / 35–45 / 25–35 (+missions) | 34 / 35 / 30 | ✓ |

Spaced review and remediation are excluded from ratio bases per owner rule and accounted separately below.

### 7.2 Hour accounting by activity type (minutes, median learner) [estimated]

| Owner bucket | A1E | A1L | A2E | A2L | Total min | Hours |
|--------------|-----|-----|-----|-----|-----------|-------|
| Core lessons (structured blocks + embedded interaction + unit reviews) | 747 | 715 | 660 | 504 | 2,626 | 43.8 |
| Spaced review (FSRS daily queues + waves) | 180 | 240 | 250 | 210 | 880 | 14.7 |
| Guided speaking (standalone AI-S, roleplays, A1 scaffolded missions) | 114 | 240 | 280 | 506 | 1,140 | 19.0 |
| Guided written interaction (AI-W) | 30 | 90 | (in writing row) | 196 | 316 | 5.3 |
| Open conversation + A2 missions + free talk | 0 | 105 | 170 | 505 | 780 | 13.0 |
| Independent listening | 72 | 130 | 130 | 96 | 428 | 7.1 |
| Independent writing | 48 | 60 | 110 | 80 | 298 | 5.0 |
| Remediation (median) [assumption] | 60 | 70 | 60 | 90 | 280 | 4.7 |
| Assessment (Band Gate / CP1 / CP2 / Graduation) | 30 | 30 | 40 | 95 | 195 | 3.3 |
| **Band totals** | **1,281** | **1,680** | **1,700** | **2,282** | **6,943** | **115.7** |

With the R4 vocab uplift (+95 items ≈ +1.5–2 h of teaching/review), the course median is **~117 h, plausible range 95–150 h** — inside the owner's 100–165 h envelope, with headroom for slower learners. p90 remediation load (~3× median) still lands ≈ 128 h. All figures [estimated] [requires validation in pilot telemetry]; never user-facing guarantees.

### 7.3 Listening spine (consolidated ramp — R14)

| Stage | Speed | Accents | Reductions | Signature tasks |
|-------|-------|---------|------------|-----------------|
| U1–U3 | 0.75–0.9× careful | 1 variety (GA primary), 2–4 voices | contractions receptive; /dʒə/ intro (receptive) | picture-pick, number dictation, schedule grid, who-says-it |
| U4–U6 | slow-clear → natural | +intelligible non-native voices ~30% from U5 [requires validation: TTS capability] | gonna/wanna/ya, linking; checkout speed | map trace, respond-in-role ≤3 s, catch the total, detect the changed detail |
| U7–U9 | 95–135 wpm | ≥3 accent profiles/unit | hafta, didja, whadja, weak was/were | phone calls without visuals, note-taking-lite, sequence events, present-vs-past by ear |
| U10–U12 | natural, incl. fast | + phone-band/degraded audio, 2–3 non-native accents | full inventory | listen-and-DO, repair-trigger detection, interactive listening inside conversations |
| GRAD | natural, supportive interlocutor | adaptive | full | fully interactive |

Standing rules: every passage recorded at 2 speeds (0.85× support / 1.0×); passages ≥70% known vocabulary; transcripts unlock after two attempts; every unit ≥1 listen-and-DO task.

### 7.4 Writing spine (consolidated)

Letters/forms (U1) → isolated sentences (U1–U2) → 5-sentence connected routine (U2) → family paragraph (U3) → directions message (U4) → invitation + reply (U5) → marketplace negotiation (U6) → running-late apology / travel request (U7) → register-split absence message + intake form (U8) → 5–6-sentence past recount (U9) → arrangement confirm/change (U10) → application forms + workplace email (U11) → problem report + 60–80-word past/present/future connected message (U12) → GRAD-03 ~80-word task. All writing is messages with a real recipient (the AI replies in-thread); no essays. Mechanics thread: capitalization/terminal punctuation from U1 (script-transfer L1s), contractions expected in messages, register selection from U8, *because* productive from U6-L15.

---

## 8. Content-authoring schema

### 8.1 Proposed DB extensions (all additive; existing schema untouched) **[proposed]**

Unified from the four bands (R15, R16):

1. **`vocabulary_translations`** `(vocabulary_id, l1_code, translation, usage_note, source ENUM('human','mt','mt_reviewed'), reviewed_by, reviewed_at)` — serves ~41 L1s; existing single-column `translation_l1` retained as default-gloss fallback.
2. **`l1_contrast_notes`** (superset schema) `(id, scope ENUM('grammar_point','pron_target','lesson','vocab_item','pragmatics'), ref_id, l1_code, contrast_type ENUM('absent_in_l1','present_but_different','false_friend','positive_transfer','phonological'), severity SMALLINT 1–3, render_priority SMALLINT 1–3, note_l1_md TEXT, predicted_errors JSONB [{learner_error_en, target_en, mechanism}], distractor_hints JSONB, recast_example TEXT, remediation_refs JSONB, inherited BOOL)` — renders into `intro_md` `{{l1_contrast}}` slots; feeds distractor generation and AI correction preloading.
3. **`grammar_points`** `(id TEXT canonical gram.* key, name, cefr_level, communicative_need, ordered_index, contrast_priority ENUM('low','med','high'))` + junction `lesson_grammar_map`.
4. **`pron_targets`** `(id TEXT canonical pron.* key, feature, minimal_pairs JSONB, l1_priority JSONB)` + FSRS card type `pron_pair` in `vocab_card_state`. Minimal-pair exercises reuse existing `listening_mc` — no new exercise type.
5. **`ai_interaction_specs`** — one versioned row per contract (16 owner-mandated fields, §8.2c), `profile ENUM('full','micro')`.
6. **`missions`** — extends interaction contract with scenario, difficulty_tiers, rubric JSONB, variant templates, retry policy.
7. **`checkpoints`** + **`checkpoint_attempts`** `(checkpoint_id, user_id, part_scores JSONB, evidence_refs JSONB, outcome)` — longitudinal evidence chain feeding graduation.
8. **`saved_errors`** `(user_id, category TEXT dotted taxonomy gram.*/vocab.*/pron.*/prag.*/listen.*/mech.*, source_ref, example, severity, l1_mechanism_ref, resolved_at)` — powers the error-driven review loop; clearance = 2 consecutive correct productions **in interaction**, not drills.
9. **`vocabulary` additive columns:** `item_type ENUM('word','chunk')` (or continue `part_of_speech: chunk`), `receptive_productive`, `register` (incl. `'sign'`, `'service_script'`), `form_of` (self-FK for irregular pasts).
10. **Small additive columns:** `lessons.est_minutes`, `lessons.interaction_profile`, `lessons.test_out_condition` (e.g., Latin-script L1s for U01-L02), `exercises.review_source_unit` (interleaving audit), `exercise_options.rationale` already exists — made **mandatory** by lint.

DDL belongs to the schema workstream; this file defines the contract only.

### 8.2 Authoring contracts (what an author or generation pipeline fills)

#### a) Per lesson

```yaml
lesson:
  id: EN-U{uu}-L{nn}            # canonical (R1)
  unit: U{uu}
  band: A1E|A1L|A2E|A2L
  type: [vocab|grammar|pron|listening|reading|speaking|writing|culture|review|mission]
  status: draft                  # draft -> gated -> operational (existing lifecycle)
  est_minutes: 10-16
  can_do_refs: [framework, level, statement_id]     # existing can_do_statements
  prereqs_hard: [lesson_ids]     # blocking; graph must stay acyclic
  prereqs_soft: [lesson_ids]     # recommended ordering
  test_out_condition: null | rule
  grammar_refs: [gram.*]
  pron_refs: [pron.*]
  vocab_map:                     # every new item; recycled items listed with recycled: true
    - {lemma, item_type, pos, receptive_productive, register, form_of?, ipa, frequency_rank,
       example_sentence, translations: per-L1 via vocabulary_translations}
  intro_md: |                    # <=120 words, rendered in learner L1 (UI language)
    ... {{l1_contrast: <target_id>}} ...   # slot resolves per learner L1; neutral fallback
  exercises: [see contract b; 8-14 items; >=20% review slots from >=2 lessons back]
  micro_interaction: null | ai_interaction_ref (profile: micro)   # mandatory U7+ non-review
  mastery_effects: {skills: [...], weights: {...}}
  saved_error_categories: [dotted taxonomy]
  analytics_extra: []            # beyond defaults
```

#### b) Per exercise

```yaml
exercise:
  seq: n
  type: flashcard|cloze|matching|ordering|dictation|listening_mc|speaking|translation|dialogue   # existing enum only
  prompt: "..."                   # instruction text L1-localized; target-language content constant
  difficulty: 1-5
  receptive_productive: receptive|productive|receptive_to_productive
  timing_s: n
  keys: [...]                     # or pairs/sequence per type
  options:                        # for MC types; EVERY option carries a rationale (mandatory)
    - {label, is_correct, rationale}
  distractor_bank: [...]          # L1-interference-informed (from l1_contrast_notes.distractor_hints)
  audio_assets: [{ref, speed}]    # required for flashcard/listening_mc/dictation/speaking models
  vocab_refs: [...]               # every item must exist in cumulative taught set (lint)
  grammar_ref: gram.* | null
  review_source_unit: U{uu}|null  # set on interleaved review slots
  scoring: "..."                  # tolerance rules; ASR focus for speaking
  rationale: "why this item exists in this lesson"
```

#### c) Per AI interaction (the 16-field owner contract — every dedicated interaction and every mission ships all fields; `micro` profile inherits unit defaults and may abbreviate scaffolding/analytics)

```yaml
ai_interaction:
  id: ...                          # + mode: written|spoken; interaction_type from owner taxonomy
  profile: full|micro
  version: n
  communicative_objective: ">= one sentence, task-framed"
  curriculum_context: {unit, lesson, prior: [...], upcoming_receptive_only: [...]}
  assumed_vocabulary: [...]        # subset of taught items (lint-enforced)
  target_grammar: [gram.*]
  target_pronunciation: [pron.*]   # or orthographic/mechanics targets for written mode
  permitted_unfamiliar_language: {ai_output_budget, glossing_rule, grammar_ceiling}
  scaffolding_rules: {attempt_1, attempt_2plus, fade_trigger, stall_behavior, floor}  # A1: scaffolds never fully removed
  expected_ai_behavior: "persona, pace (wpm or x-speed), turn length, question policy,
    planted events (exactly one unexpected turn / breakdown where specified), register"
  correction_rules:
    priority: [1 understanding-blocking, 2 current lesson target, 3 repeated high-value,
               4 intelligibility-affecting pronunciation]
    in_flight: "concise recasts embedded naturally; max 1/turn; never mid-utterance"
    post_task: "feedback card <=3-4 items, L1-rendered, priority-ordered, + 1 strength"
  success_criteria: {task: ..., language: ..., interaction: ...}
  mastery_effects: {skill_mastery deltas, FSRS review-success events, with_support_weighting}
  saved_error_categories: [dotted taxonomy]
  review_behavior: "errors regenerate as drills <=48h; retry/variant policy"
  analytics: [turns, learner_output_volume, assist/scaffold usage, repair events,
              recast_uptake_rate, task_success, time_on_task, tokens/audio, cost_usd]
  failure_handling: "graceful supported-completion path; never a dead end; escalation
                     after repeated failure (never infinite retry)"
  cost_expectations: "turns, token/audio budget, target unit cost, p95 [estimated]"
```

#### d) Per mission — extends (c) with:

```yaml
mission_extra:
  scenario: "learner task card, rendered in L1"
  difficulty_tiers: {T1_supported, T2_default, T3_stretch}   # tier from mastery profile
  scaffolding: none_in_flight                                 # missions are unassisted (A1 variant: heavy scaffold per band file)
  rubric: {cells: [...], scale: 0-2 or rating enum, pass_rule}
  variants: [templated scenario rotations]                    # retry never verbatim
  retry_policy: {max_per_day, remedial_branch_after: 2, escalation: human_flag}
  evidence: feeds checkpoint/graduation evidence chain
```

#### e) Per checkpoint/gate — strands/parts, per-strand instruments + pass bars, outcome mapping, strand-level retake policy, evidence storage refs (see §3.2 `assessments` for the four filled instances).

---

## 9. Quality rubric, editorial process, validation gates, localization

### 9.1 Content quality rubric (measurable; pass = no axis at 0, total ≥ 12/18) **[proposed]**

| Axis (0/1/2) | Measurable criterion for 2 |
|--------------|----------------------------|
| Language accuracy | zero errors in target-language content (SME-verified) |
| Level fit | 100% of exercise/passage text within the unit's cumulative grammar spine + vocab set (lint report clean); sentence length ≤ band cap (A1: 8 words, A2: 12 in core prompts) |
| Communicative value | every exercise traceable to the lesson objective; every vocab item scripted into ≥1 interaction |
| Exercise craft | every MC option has a rationale; distractors map to predicted L1 errors or attested learner errors; no gimme items (each distractor chosen by >5% in pilot [requires validation]) |
| Recycling compliance | ≥20% review slots from ≥2 lessons back; all new items have ≥2 future placements scheduled |
| L1 parameterization | contrast rows present for all 10 priority L1s on med/high targets; renders verified in ≥2 scripts (Latin + one RTL or CJK) |
| Audio completeness | 100% of audio-bearing items have assets at required speeds; accent profile per §7.3 ramp |
| Interaction contract completeness | all 16 fields non-empty; failure_handling has a supported-completion path |
| Cultural safety | flagged topics (family/age probing, tipping, emergency numbers, photos of family) carry parameterization or the privacy option (fictional photo cards) |

### 9.2 Editorial review process **[proposed]**

1. **Author** (human or generation pipeline) fills the §8.2 contract → `draft`.
2. **Automated gates** (§9.3) run on save; hard failures block submission.
3. **SME language review** — accuracy, level fit, exercise craft (rubric §9.1).
4. **L1 review** — priority-L1 reviewers check contrast notes + translations for their language (batched by language, not by lesson).
5. **Cultural sensitivity review** — only items carrying the cultural-safety flag (incl. refugee/newcomer advisory review for identity/family content [requires validation]).
6. **Pilot gating** → `gated`: released to pilot cohort (n≥30); promotion to `operational` requires: FSRS lapse ≤30%, actual timing within ±25% of `est_minutes`, exercise discrimination sane (no item >95% or <30% correct), interaction completion ≥85% incl. supported completions.
7. Any edit re-triggers gates; contracts are versioned; `operational` content changes require re-review of the diff only.

Review load estimate: ~25% of authoring hours (§10).

### 9.3 Automated validation gates (CI-style, run per lesson/interaction) **[proposed]**

1. **Vocabulary-boundary lint** — tokenize all learner-facing target-language text; every token must be in the cumulative taught set, the item's own `vocab_map`, or the declared `permitted_unfamiliar_language` budget (with glossing rule). Fail on overflow.
2. **Grammar-ceiling lint** — parse target-language sentences against the unit's cumulative `gram.*` whitelist; unknown constructions flag for review (warn), unknown tense/aspect hard-fails.
3. **Key-completeness** — all schema-required fields present: option rationales, IPA + frequency_rank on vocab rows, all 16 interaction fields, rubric on missions, prereq lists.
4. **Audio coverage** — every audio-bearing exercise resolves to existing assets at all required speeds/accent profiles; dictation keys match transcript exactly.
5. **Recycling coverage** — `vocab_lesson_map` orphan report (items with <2 future placements) and `review_source_unit` share <20% both fail.
6. **Readability** — sentence-length caps per band; intro_md ≤120 words; passage known-vocab ratio ≥70%.
7. **Translation completeness** — 10 priority L1s `source: human` or `mt_reviewed`; long-tail may be `mt` but must exist.
8. **Prereq-graph checks** — acyclic; every lesson reachable; gates reference existing skills.
9. **L1-contrast gate** — med/high grammar_points and top pron_targets: 10 priority-L1 rows present before `draft → gated`.
10. **Cost/analytics fields** — interaction contracts declare cost_expectations and analytics; missing = fail.

### 9.4 Localization rules **[proposed]**

- **Localized into all ~41 UI languages:** instruction text, `intro_md`, exercise prompts' instructional frame, option rationales, feedback templates, task cards, debrief cards, gate/outcome messaging.
- **Constant across L1s:** all target-language (English) content — exercise sentences, audio, passages, AI persona speech, keys. One English content build; L1 varies only the wrapper.
- **L1-parameterized slots:** `{{l1_contrast}}` resolves per learner L1 (neutral fallback if no row); country/name sets personalized by L1 region; predicted-error distractors selected per L1 where available (content identical, distractor mix may vary [proposed]).
- **Market-parameterized (by deployment locale, NOT by L1):** tipping, bargaining norms, emergency number, currency, date formats (MM/DD vs DD/MM), pharmacy scope [requires validation per market].
- **Script support:** RTL rendering for ar/fa; CJK line-breaking for zh; no L1 text ever embedded inside English audio.
- Machine translation allowed for long-tail L1s with human spot-check ≥10% sample [requires validation].

---

## 10. Production workload estimate **[estimated]**

Assumptions: experienced ESL materials writer working inside the §8 contract with template support; hours are draft→gated (incl. self-QA, excl. translations/review listed separately); generation-pipeline assistance could reduce authoring rows 30–50% but review rows would grow — net savings [requires validation].

### 10.1 Authoring hours by artifact

| Artifact | Count | h/unit | Hours |
|----------|-------|--------|-------|
| Core lessons — vocab | ~45 | 6 | 270 |
| Core lessons — grammar | ~60 | 8 | 480 |
| Core lessons — pron labs | ~18 | 7 | 126 |
| Core lessons — listening | ~25 | 8 | 200 |
| Core lessons — reading | ~10 | 6 | 60 |
| Core lessons — speaking/guided | ~25 | 9 | 225 |
| Core lessons — writing | ~16 | 7 | 112 |
| Core lessons — culture/integrated/review | ~21 | 4 | 84 |
| Missions (full contract + variant templates) | 12 | 16 | 192 |
| Major AI-interaction contracts (beyond in-lesson budget) | ~60 | 4 | 240 |
| Micro-interaction profiles (templated, U7+) | ~110 | 0.5 | 55 |
| Band Gate + CP1 + CP2 + Graduation (design, items, rubrics, calibration protocol) | 6 sessions | 40 | 240 |
| Remediation micro-lesson pool | ~40 | 3 | 120 |
| Vocabulary DB records (full fields, 1,800 items) | 1,800 | 0.33 | 600 |
| L1 contrast notes (≈90 med/high targets × 10 priority L1s) | ~900 rows | 0.33 | 300 |
| Translations — 10 priority L1s, human (1,800 × 10) | 18,000 | ~2.4 min | 720 |
| Translations — 31 long-tail L1s, MT + 10% human spot-check | 55,800 | — | 120 |
| **Authoring subtotal** | | | **≈4,150** |
| Editorial/SME/L1/cultural review (~25% of authoring) | | | ≈1,040 |
| Pilot-gating analysis and content fixes | | | ≈300 |
| **Total, one direction (ESL)** | | | **≈5,500 person-hours ≈ 3.3 person-years** |

### 10.2 TTS / audio generation counts

| Category | Count [estimated] |
|----------|-------------------|
| Per-lesson exercise audio (avg ~22 assets × 220 lessons) | ~4,800 |
| Dual-speed renders for listening subset (0.85× + 1.0×) | ~1,200 additional |
| Passages (reading/listening bodies) | ~150 |
| Minimal-pair sets (18 families × pairs × voices) | ~600 |
| Accent-profile variants (≥3 profiles on ~30% of listening from U7) | ~1,500 |
| Checkpoint/graduation stimuli | ~250 |
| **Pre-generated total** | **~8,500–9,500 renders** |

Interaction speech (AI turns) is runtime TTS, not pre-generated. Human QA listening pass on ≥10% sample [proposed].

### 10.3 Review load

SME: 2 passes × ~10 min/lesson ≈ 75 h/band ≈ 300 h course (inside the 25% row). L1 reviewers: 10 reviewers × ~70 h each (contrast notes + translation spot-checks). Cultural review: ~40 flagged items × 1 h.

### 10.4 Runtime cost expectations per interaction class (consolidated from bands) [estimated] [requires validation]

| Class | Est. cost/session | p95 |
|-------|-------------------|-----|
| Written micro-exchange | <$0.005 | $0.01 |
| Written AI interaction (5–12 turns) | $0.01 | $0.03 |
| Spoken guided interaction (ASR+TTS, 4–8 min) | $0.03–0.08 | $0.12 |
| Spoken mission (8–12 min) | $0.05–0.28 | $0.30 |
| Graduation conversation (15 min + scoring) | ~$0.30–0.50 | $0.75 |

---

## 11. Assessment architecture and graduation gates (consolidated)

### 11.1 Assessment ladder

| Event | After | Time | Certifies | Outcomes |
|-------|-------|------|-----------|----------|
| Band Gate | U3 | ~30 min | U1–U3 (low-stakes; rehearses CP format) | pass · pass_with_review · remediate |
| Checkpoint 1 | U5 | 25–35 min (splittable) | U1–U5 | passed · passed_with_review · remediation (strand-level retake, 24 h cooldown) |
| Checkpoint 2 | U8 | ~40 min (splittable) | U6–U8 transactional toolkit | passed · passed_with_review · remediation (part-level retake ≥2 days; escalation after 3 cycles) |
| Graduation | U12 | GRAD-01 ~12 min + GRAD-02 ~15 min (conditional) + GRAD-03 ~25 min | whole-course communicative definition of done | graduated · graduated_with_review · remediation · repeat_missions |

Universal rules: performance evidence only (never XP/streaks/completion/time); strand/part-level retakes with passed strands banked; remediation is targeted and finite (max 2 cycles then escalation/alternative format — never an infinite loop); all attempts store audio/transcript/rubric JSON into `checkpoint_attempts` forming the longitudinal evidence chain.

### 11.2 Graduation — precise, testable gates (from A2L plan, consolidated)

**Prerequisites to attempt (GR-0):**
- (a) all A2L gating skills `skill_mastery ≥ 0.65`;
- (b) missions M-U10, M-U11, M-U12 each rated ≥ **functional**;
- (c) U12-L16 connected message submitted;
- (d) GRAD-01 mock completed (formative, no gate); GRAD-02 tune-up completed if GRAD-01 raised red flags.

**GRAD-03 instruments:**
- Conversation ~15 min, adaptive, 4 phases: warm-up (2') → familiar topics: past + future with follow-ups both directions, learner must ask ≥2 (5') → transaction roleplay with one **planted breakdown** to repair (4') → unexpected turn + wind-down (4'). Interlocutor eases after 2 consecutive communication failures; stretches after sustained success; ease/stretch state logged and fed to scoring context.
- Writing ~10 min: ~80-word connected message (past event + current situation + future plan + one request), new prompt from the U12-L16 family.

**Gates:**

| # | Gate | Threshold |
|---|------|-----------|
| GR-1 | Conversation total (7 dims × 0–4: task completion, interaction & follow-ups, range, accuracy, fluency, intelligibility, repair) | ≥ 18/28 |
| GR-2 | Every conversation dimension | ≥ 2 |
| GR-3 | **Repair dimension** | ≥ 2, **non-waivable** |
| GR-4 | Writing total (4 dims × 0–4: task completion, connectedness, accuracy, intelligibility-to-reader) | ≥ 9/16, no dimension 0 |

**Outcome mapping:**

| Condition | Outcome → consequence |
|-----------|----------------------|
| All gates pass; ≤1 dim at exactly 2; error bank clear | **graduated** |
| All gates pass; ≥2 dims at 2 OR open error-bank debt | **graduated_with_review** → graduation stands; 2-week post-course review plan auto-scheduled (loop template in A2L §13e) |
| Fail on range/accuracy/intelligibility with localized gaps | **remediation** → targeted loop; re-attempt only failed phase(s) after ≥3 days |
| Fail on task completion/interaction/repair | **repeat_missions** → redo relevant mission(s) in new variants, then full re-attempt |

**Scoring QA:** AI rubric scoring with confidence bands; borderline (±1 of any gate) or low-confidence sessions queue for human review sampling [requires validation: rubric calibration vs human raters; QA capacity]. Certificates state the CEFR-linked performance-evidence basis, never XP/time. Audio/transcript retention per privacy policy [requires validation].

**Communicative definition of done (verification map):** each owner-listed capability is exercised by ≥1 gate instrument — sustain ~15-min conversation (GRAD-03 whole), self/family/work/routines/interests (Phase 2 + CP1), past experiences (Phase 2, U9 evidence), future plans (Phase 2, U10 evidence), food/shopping/travel/directions/scheduling/needs (Phase 3 pool from U4–U8/U10–U11), follow-ups both directions (Phase 2 ≥2 asked), request repetition/clarification + reformulate (Phase 3 planted breakdown + repair gate GR-3), understand paced + intelligible accented speech (accent ramp §7.3 + adaptive interlocutor), write simple connected messages (GR-4).

---

## 12. Open questions for the owner

1. **Market parameterization** (tipping, bargaining, emergency numbers, currency/date formats): single US default at launch vs per-market variant pass [requires validation] — flagged by all four bands.
2. **CP2 Part-D exemption** via passed U-missions (A2E proposal): accept or reject globally (R13 — held, not adopted by default).
3. **Accented-audio sourcing**: TTS vendor capability for the §7.3 accent ramp (see voice workstream) [requires validation].
4. **Vocabulary counting sign-off**: adopt the resolved 1,800-item budget with productive/recognition split (R4, R17) as the official headline.
5. **CEFR Companion Volume exact descriptor wordings**: verify all [requires validation]-flagged quotes before inserting into `can_do_statements`.
6. **Privacy/retention** rules for stored checkpoint & graduation audio; privacy option (fictional photo cards) for family content [requires validation with newcomer advisory review].
7. **Human QA capacity** for borderline graduation review sampling and mission escalation flags.
8. **Direction B (Spanish for English speakers)**: this map is Direction A only; the Direction B course map must be designed fresh for English-speaker L1 transfer (not this course reversed) — separate deliverable.

---

## 13. Appendix — band files of reference

The four band plans remain the detailed source for per-lesson exercise specs, filled L1-contrast examples, full sample lessons/contracts, and per-band YAML maps. This file overrides them only where §2 logs a resolution.

| Band | File | Fully-specified samples inside |
|------|------|-------------------------------|
| A1E (U1–U3 + Band Gate) | `wip-curriculum-en-early-a1.md` | U1-L05 lesson · U2-L17 written gap · U2-L18 spoken Q&A · U3 mission "People in My Life" |
| A1L (U4–U6 + CP1) | `wip-curriculum-en-late-a1.md` | U5L07 lesson · U6L15 written negotiation · U4L10 spoken roleplay · U6L19 two-scene mission |
| A2E (U7–U9 + CP2) | `wip-curriculum-en-early-a2.md` | U9-L04 lesson · U8-L09 written absence message · U7-L15 spoken info-gap · U8-L19 pharmacy mission · §16 schema extensions |
| A2L (U10–U12 + Graduation) | `wip-curriculum-en-late-a2.md` | U10-L02 lesson · U10-L10 written group chat · U11-L13 spoken interview · U12-L20 switchboard mission · §13e post-course remediation loop |

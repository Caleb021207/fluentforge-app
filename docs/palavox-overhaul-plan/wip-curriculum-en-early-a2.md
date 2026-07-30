# Palavox Overhaul — ESL Curriculum Plan: Early A2 Band (Units 7–9 + Checkpoint 2)

**Direction:** English for multilingual learners (instruction/UI in learner L1, ~41 L1s)
**Band:** Early A2 (A2.1) — Units 7, 8, Checkpoint 2, Unit 9
**Progressive-release ratios for this band (owner guidance):** 40–50% structured / 35–45% guided interaction / 10–20% open conversation
**Status:** WIP planning document. No app code or DB changes proposed for execution here; schema items are `[proposed]` extensions only.
**Author scope:** This file covers ONLY the early-A2 band. Global course decisions referenced from the owner spec.

---

## 0. Band position and entry assumptions

- Position in global plan: lessons ~100–154 of the ~240-lesson core sequence [proposed]. This band contributes 55 core lessons, landing inside the owner's ~120–150 A2-lesson budget when combined with U6 (late-A1/A2 bridge) and U10–12 [proposed].
- Entry state assumed from U1–U6 [assumption — must be reconciled with the A1-band planner's exit spec]:
  - Grammar: present simple (aff/neg/Q), present continuous (intro), `can/can't`, `like/want/need + noun/to-V`, `there is/are`, possessives, basic adjectives, `how much/many`, `some/any`, imperatives (classroom), numbers/prices/dates/times.
  - Vocabulary: ~900–1,000 items incl. chunks (self, family, home, school/work basics, places, food, shopping, money) [assumption].
  - Interaction habits: has done scripted dialogue completion and guided Q&A with the AI in every unit; has used repair chunk "Can you repeat that, please?" [assumption].
- Exit state (end of U9): learner can transact for transport/health needs, follow directions, understand short announcements and appointment calls, give/get simple advice, and — the band's headline new capability — **talk and write about the past** (was/were, regular + ~30 irregular verbs). This is the single largest grammatical jump in the course; the band is sequenced so all of it lands in U9 after transactional competence is verified at Checkpoint 2 [proposed].

Counting policies used throughout [proposed]:
- "Vocab item" = lemma OR multiword chunk with its own FSRS card. Irregular past forms of known verbs count as items flagged `form_of` (they get cards; they are real learning load) — noted wherever counted.
- "Lesson" = one core sequence node (10–16 min). Checkpoint 2 and remediation pool lessons are NOT counted in the 55.

---

## 1. Refined unit definitions

Field names mirror the existing schema (`units.theme`, `can_do_statement`, `cefr_level`, `key_language_use`, `content_objective`, `language_objective`).

### Unit 7 — Getting Around (Transport & Directions)

| Field | Value |
|---|---|
| theme | Using city transport, asking/giving directions, planning simple trips |
| cefr_level | A2.1 |
| key_language_use | Transactional exchanges; following/giving spatial instructions |
| content_objective | Learner can navigate a new city: choose transport, buy tickets, follow and give directions, handle delays |
| language_objective | Question formation for information-getting; imperatives + movement prepositions; `have to`; duration with `it takes` |
| can_do_statement (primary) | "Can get simple information about travel, use public transport: buses, trains, and taxis, ask and give directions, and buy tickets." — CEFR A2, transactions/goods-and-services descriptor [requires validation — exact wording to be verified against CEFR Companion Volume 2020 before DB insert] |

Supporting descriptors (cite into `can_do_statements` with framework tags):
- CEFR A2 self-assessment grid, spoken interaction: "I can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar topics and activities."
- CEFR A2 reading: "I can find specific, predictable information in simple everyday material such as advertisements, prospectuses, menus and timetables." (directly motivates the timetable/transit-app reading lessons)
- CEFR A2 listening: "I can catch the main point in short, clear, simple messages and announcements."
- NCSSFL-ACTFL Novice High interpersonal (paraphrase): communicates in spontaneous conversation on familiar/everyday topics using practiced words, phrases, simple sentences and questions [requires validation — exact benchmark wording].

ACTFL mode coverage: **Interpretive** — announcements, timetables, transit apps (L04, L09, L11). **Interpersonal** — directions roleplay, ticket purchase, running-late texting (L08, L12, L15). **Presentational** — describing your route/commute (L10 output task, L16).

### Unit 8 — Health & Needs

| Field | Value |
|---|---|
| theme | Body, symptoms, pharmacy, clinic appointments, emergencies |
| cefr_level | A2.1 |
| key_language_use | Describing states; requesting help/advice; service phone calls; register-aware absence messages |
| content_objective | Learner can handle a minor health event end-to-end: describe symptoms, get products/advice at a pharmacy, book an appointment, notify school/work |
| language_objective | `feel + adj` / `have + noun`; `should(n't)` for advice; `need to`; `why/because` follow-ups |
| can_do_statement (primary) | "Can indicate the nature of a problem to a health professional, perhaps using gestures and body language." — CEFR A2 [requires validation — exact wording/location in Companion Volume] |

Supporting descriptors:
- CEFR A2 spoken interaction grid: "I can handle very short social exchanges, even though I can't usually understand enough to keep the conversation going myself." (motivates the `why/because` follow-up lesson: we explicitly train keeping the exchange going one more turn)
- CEFR A2 writing grid: "I can write short, simple notes and messages relating to matters in areas of immediate need." (absence message, pharmacist question)
- WIDA can-do alignment slot for school-age deployments [proposed — statement selection deferred to compliance pass].

ACTFL mode coverage: **Interpretive** — pharmacy dialogue, labels, appointment call (L05, L11, L12). **Interpersonal** — advice swap, clinic call, pharmacy mission (L07, L13, L19). **Presentational** — describing how you feel; intake form + message (L03 output, L17).

### Unit 9 — Past Experiences

| Field | Value |
|---|---|
| theme | Talking about yesterday, last weekend, life events, simple personal stories |
| cefr_level | A2.1 |
| key_language_use | Narration and recount; social conversation about shared past ("How was your weekend?") |
| content_objective | Learner can hold the most common social exchange in work/school life — recounting what happened — and write a short connected recount |
| language_objective | Past simple: was/were, regular -ed (with pronunciation), ~30 high-frequency irregulars, negatives/questions with `did`, sequencers `first/then/after that` |
| can_do_statement (primary) | "Can describe past activities and personal experiences." — CEFR A2, sustained monologue: describing experience |

Supporting descriptors:
- CEFR A2 sustained monologue: "Can tell a story or describe something in a simple list of points." [requires validation — may be A2+ in Companion Volume; if so, treat as stretch target for L14–L16]
- CEFR A2 writing grid: "I can write a very simple personal letter…" → adapted to short recount messages.
- NCSSFL-ACTFL Intermediate Low interpersonal (paraphrase): participates in conversations on familiar topics using simple sentences; handles short social interactions by asking and answering simple questions [requires validation]. U9 is deliberately the first unit whose ceiling touches IL rather than NH [proposed].

ACTFL mode coverage: **Interpretive** — weekend exchanges, sequenced story listening, recount reading (L03, L08, L13). **Interpersonal** — yesterday Q&A, weekend chat reply, memorable-day conversation (L06, L11, L17). **Presentational** — picture-story retell, written recount, interview report-back (L15, L16, L18).

### Why this ordering (justification vs. owner skeleton)
Owner skeleton is kept as-is (U7 transport, U8 health, CP2, U9 past). Rationale: U7–U8 complete the learner's **survival transactional toolkit** in present-tense language, so Checkpoint 2 can certify "can obtain goods/services and handle needs" before the course spends 18 lessons on the past-tense system — the highest-failure-rate grammar area for the priority L1 group (Mandarin, Vietnamese, Somali: no verb tense inflection; Arabic/Russian/Ukrainian: different aspect systems) [proposed]. Placing past AFTER a checkpoint also gives remediation a clean boundary: no U9 content depends on a shaky U7–U8 foundation being discovered mid-narrative-unit.

---

## 2. Lessons per unit (numbered, one-line objectives)

Type tags: `[vocab] [grammar] [reading] [listening] [speaking] [writing] [pron] [AI-W] [AI-S] [review] [mission]`. `[pron]` lessons are stored under skill type `speaking` in the current schema [proposed — see §16 for a `pron_target` extension]. `nv` = new vocab items (incl. chunks) mapped via `vocab_lesson_map`.

**Micro-interaction rule [proposed]:** every non-review lesson ends with a 1–2-turn written OR spoken AI micro-exchange using that lesson's language (~90 s). The dedicated `[AI-W]/[AI-S]/[mission]` lessons below are the *full* interactions; micro-exchanges are additional and inherit a lightweight version of the interaction contract (§13b/c defines the full contract; micro-exchanges use its `micro` profile).

### Unit 7 — Getting Around (18 lessons, 147 new items)

| # | ID | Type | Title — objective | nv |
|---|---|---|---|---|
| 1 | U7-L01 | vocab | City transport words — name 16 transport modes/places and say which you use | 16 |
| 2 | U7-L02 | vocab | Tickets, fares & schedules — use ticket-buying nouns/verbs and the chunk "One ticket to X, please" | 15 |
| 3 | U7-L03 | grammar | How do you get to…? — ask/answer about routes with `by + transport` and `take/get/ride` | 8 |
| 4 | U7-L04 | listening | Station announcements — catch platform, time and delay in short clear announcements | 10 |
| 5 | U7-L05 | pron | Word stress + final clusters — produce BUS stop / TRAIN station; /-st -ks/ in next, tickets | 4 |
| 6 | U7-L06 | grammar | Directions — give/follow directions with imperatives + movement prepositions (turn left, go past) | 14 |
| 7 | U7-L07 | vocab | Landmarks & city places — locate corner, block, bridge, traffic lights, crosswalk | 16 |
| 8 | U7-L08 | speaking | Guided roleplay: asking for directions — get from A to B on a map with scaffolded turns | 6 |
| 9 | U7-L09 | listening | Follow the route — trace a path on a map from spoken directions with linking (get‿on, get‿off) | 6 |
| 10 | U7-L10 | grammar | How long does it take? — ask/answer about duration with `it takes (about)…` | 8 |
| 11 | U7-L11 | reading | Transit apps & timetables — find times, prices and service alerts in real-layout screens | 12 |
| 12 | U7-L12 | AI-W | Text a friend: "I'm running late" — write a short apology + new plan in chat register | 8 |
| 13 | U7-L13 | grammar | have to / don't have to — state transit rules and schedule necessity ("You have to tap your card") | 8 |
| 14 | U7-L14 | pron | Reductions & /ɪ–iː/ — understand gonna/hafta; hear and say live/leave, sit/seat | 4 |
| 15 | U7-L15 | AI-S | Buying a ticket (information gap) — get times/prices and buy the right ticket; handle one surprise | 6 |
| 16 | U7-L16 | writing | Ask about travel options — write a message to a host/colleague asking how to get somewhere | 6 |
| 17 | U7-L17 | review | Unit 7 cumulative review — interleaved retrieval over U5–U7 (all exercise types) | 0 |
| 18 | U7-L18 | mission | Mission: Plan a trip across town — open conversation with an AI local to plan a route under constraints | 0 |

### Unit 8 — Health & Needs (19 lessons, 153 new items)

| # | ID | Type | Title — objective | nv |
|---|---|---|---|---|
| 1 | U8-L01 | vocab | Body parts — name 18 body parts and say what hurts with "My ___ hurts" | 18 |
| 2 | U8-L02 | vocab | Symptoms & illnesses — report common symptoms with "I have a headache / a cold / a sore throat" | 18 |
| 3 | U8-L03 | grammar | feel + adjective / have + noun — describe current state ("I feel dizzy", "I have a fever") | 6 |
| 4 | U8-L04 | pron | /θ ð/ — hear and produce th in throat, teeth, this; minimal pairs think/sink, three/tree | 4 |
| 5 | U8-L05 | listening | At the pharmacy — understand a pharmacist's recommendation and basic dosage in a clear dialogue | 12 |
| 6 | U8-L06 | grammar | should / shouldn't — give and get simple advice ("You should rest") | 6 |
| 7 | U8-L07 | speaking | Guided advice swap — exchange problems and advice in scaffolded Q&A turns | 5 |
| 8 | U8-L08 | vocab | Pharmacy & medicine words — ask for tablet/cream/drops and read "twice a day" | 16 |
| 9 | U8-L09 | AI-W | Message your teacher/boss: "I'm sick" — write a register-appropriate absence message | 7 |
| 10 | U8-L10 | grammar | need to / have to — express necessity for health and appointments ("You need to rest") | 5 |
| 11 | U8-L11 | reading | Medicine labels & clinic notices — extract dose, warnings and opening hours | 12 |
| 12 | U8-L12 | listening | Booking by phone — catch dates, times and spelled names; understand wanna/gonna at speed | 10 |
| 13 | U8-L13 | AI-S | Call the clinic — book an appointment by voice; handle "no availability" and reschedule | 6 |
| 14 | U8-L14 | vocab | Emergencies & getting help — use call 911, Help!, It hurts here, I'm allergic to… | 14 |
| 15 | U8-L15 | grammar | why? / because… — ask and answer one follow-up to keep an exchange going | 4 |
| 16 | U8-L16 | pron | Sentence stress + /æ–ʌ/ — stress content words; hear and say back/buck, ankle, matter | 4 |
| 17 | U8-L17 | writing | Clinic intake form + pharmacist question — fill a simple form; write one clear question message | 6 |
| 18 | U8-L18 | review | Unit 8 cumulative review — interleaved retrieval over U6–U8 | 0 |
| 19 | U8-L19 | mission | Mission: At the pharmacy — describe a symptom, get the right product, confirm instructions | 0 |

### Checkpoint 2 (after U8) — see §12. Not counted as a lesson.

### Unit 9 — Past Experiences (18 lessons, 150 new items)

| # | ID | Type | Title — objective | nv |
|---|---|---|---|---|
| 1 | U9-L01 | grammar | was / were — say where you were and how it was ("I was at home. It was boring.") | 5 |
| 2 | U9-L02 | vocab | Past time expressions — anchor events with yesterday, last week, two days ago | 14 |
| 3 | U9-L03 | listening | "How was your weekend?" — catch place, activity and feeling in short social exchanges | 10 |
| 4 | U9-L04 | grammar | Past simple: regular verbs — talk about completed actions with -ed forms | 12 |
| 5 | U9-L05 | pron | -ed endings /t d ɪd/ — hear and produce walked, played, visited correctly | 4 |
| 6 | U9-L06 | speaking | Guided Q&A: yesterday — say three things you did and ask one follow-up | 5 |
| 7 | U9-L07 | grammar | Irregular past, set 1 — use went, had, got, saw, ate, bought, came, took in sentences | 12 |
| 8 | U9-L08 | reading | "My first week in Chicago" — follow a short recount and notice sequencers | 14 |
| 9 | U9-L09 | grammar | didn't / Did you…? — make past negatives and questions and give short answers | 6 |
| 10 | U9-L10 | pron | Fast past questions — understand didja/whadja and weak was/were /wəz wə/ | 3 |
| 11 | U9-L11 | AI-W | Reply to a friend: "How was your weekend?" — hold a 5-turn written chat about your weekend | 9 |
| 12 | U9-L12 | vocab | Activities & life events — talk about moved, started a job, met, took a trip | 16 |
| 13 | U9-L13 | listening | A story in order — reorder events from a spoken story using first/then/after that | 8 |
| 14 | U9-L14 | grammar | Irregular past, set 2 + sequencing — chain 3–4 past events into a mini-story | 12 |
| 15 | U9-L15 | speaking | Picture-story retell — narrate a 4-frame story in the past with sequencers | 5 |
| 16 | U9-L16 | writing | Write a short recount — 5–6 connected sentences about a real past day | 8 |
| 17 | U9-L17 | AI-S | Talk about a memorable day — guided-to-freer spoken conversation with follow-ups | 7 |
| 18 | U9-L18 | review+mission | Cumulative review + Mission: Interview & report — interview an AI persona about a past experience, then report back | 0 |

**Band lesson total: 55 core lessons** (18+19+18) + Checkpoint 2 + 6-lesson remediation pool (§11). Sits at ~⅓ of the owner's 120–150 A2 budget across 3 of the 7 A2 units — on target [proposed].

---

## 3. Prerequisite graph

Default rule [proposed]: within a unit, lessons unlock sequentially, BUT only the edges below are *hard gates* (blocking); everything else is soft-ordered (skippable by placement/acceleration logic). Gates use `skill_mastery` ≥ 0.6 on the gating lesson's target [proposed threshold, requires validation with real data].

**Cross-unit / band-level hard gates**
- U7-L01 requires: U6 complete (band entry).
- U8-L01 requires: U7-L15 attempted (not passed — attempt only) [proposed: keeps units overlappable].
- CP2 requires: all U7+U8 non-mission lessons completed AND both missions attempted.
- U9-L01 requires: CP2 outcome ∈ {passed, passed_with_review}.
- U10 (next band) requires: U9-L18 mission attempted + U9 grammar mastery ≥ 0.6 average.

**Unit 7 hard gates**
- L03 ← L01; L06 ← L01; L08 ← L06, L07; L09 ← L06; L12 ← L03 (needs route/time language); L15 ← L02, L03, L10; L17 ← L01–L16; L18 ← L15, L17.

**Unit 8 hard gates**
- L03 ← L01, L02; L06 ← L03; L07 ← L06; L09 ← L03 (+register model in-lesson); L13 ← L10, L12; L17 ← L09; L18 ← L01–L17; L19 ← L05, L08, L18.

**Unit 9 hard gates**
- L04 ← L01, L02; L05 ← L04; L06 ← L04; L07 ← L04; L09 ← L04, L07; L10 ← L09; L11 ← L09; L14 ← L07; L15 ← L13, L14; L16 ← L14; L17 ← L09, L15; L18 ← L16, L17.

**Skill-level gating (crosscutting)**
- Any `[AI-S]` lesson requires the unit's `[pron]` lesson(s) attempted (pron lessons directly feed intelligibility scoring calibration) [proposed].
- Any `[mission]` requires both the unit's `[AI-W]` and `[AI-S]` completed with success criteria met OR one remediation pass.

Compact edge list (machine-usable): see `prereqs:` arrays in the §15 YAML.

---

## 4. Vocabulary & lexical-chunk targets

### Counts and principles
- **Band target: 450 new items** — U7: 147, U8: 153, U9: 150. ≈68% single-word lemmas, ≈32% multiword chunks [proposed].
- On the owner's global 1,800–2,200 question: with ~950 entering items [assumption] and 450 here, the course reaches ~1,400 by end of U9, leaving ~400–500 for U10–12 — global landing ~1,850–1,950. **Recommendation: hold the global target at the LOW end (~1,800–1,900) and spend the margin on chunk depth and irregular-verb form coverage instead of new lemma count.** Strong-A2 conversational ability is chunk-limited, not lemma-limited [proposed].
- Selection principles (in priority order):
  1. **Frequency**: single words drawn from NGSL top ~2,500 unless scenario-critical (e.g., *platform*, *dosage* earn their place by scenario, not rank) [assumption: NGSL as reference list — requires validation against corpus of target service interactions].
  2. **Communicative usefulness**: every item must appear in ≥1 of the unit's AI interactions or mission scripts. If authors can't script it into an interaction, it gets cut.
  3. **Chunks over rules**: routinized service language taught as unanalyzed chunks first ("How do I get to…?"), analyzed later when grammar catches up.
  4. **L1-translation via junction table**: `translation_l1` single-column can't serve 41 L1s — every item ships with a `vocabulary_translations` row per supported L1 (§16). Sample list below marks the slot as `⟨tr:L1⟩`.
  5. **Form policy**: irregular past forms = separate FSRS cards flagged `form_of` (counted in U9's 150: 20 of them).

### Sample list — Unit 7 (representative), 44 items
Format: item | word/chunk | POS | freq band [assumption, NGSL-informed] | L1 slot | example.

| # | Item | Type | POS | Freq | L1 | Example |
|---|---|---|---|---|---|---|
| 1 | bus | w | n | top500 | ⟨tr:L1⟩ | The bus is late. |
| 2 | train | w | n | top500 | ⟨tr:L1⟩ | I take the train to work. |
| 3 | subway | w | n | 2k | ⟨tr:L1⟩ | The subway is fast. |
| 4 | taxi | w | n | 2k | ⟨tr:L1⟩ | Let's take a taxi. |
| 5 | ticket | w | n | 1k | ⟨tr:L1⟩ | I need two tickets. |
| 6 | station | w | n | 1k | ⟨tr:L1⟩ | The station is on Main Street. |
| 7 | stop | w | n | 1k | ⟨tr:L1⟩ | Get off at the next stop. |
| 8 | platform | w | n | 3k | ⟨tr:L1⟩ | The train leaves from platform 2. |
| 9 | map | w | n | 1k | ⟨tr:L1⟩ | Look at the map. |
| 10 | driver | w | n | 1k | ⟨tr:L1⟩ | Ask the driver. |
| 11 | passenger | w | n | 3k | ⟨tr:L1⟩ | The bus was full of passengers. |
| 12 | schedule | w | n | 2k | ⟨tr:L1⟩ | Check the schedule. |
| 13 | fare | w | n | 4k | ⟨tr:L1⟩ | The fare is $2.50. |
| 14 | transfer | w | n/v | 3k | ⟨tr:L1⟩ | Transfer at Central Station. |
| 15 | ride | w | n/v | 1k | ⟨tr:L1⟩ | Can you give me a ride? |
| 16 | catch | w | v | 1k | ⟨tr:L1⟩ | I have to catch the 8:15 bus. |
| 17 | miss | w | v | 1k | ⟨tr:L1⟩ | I missed my train. |
| 18 | arrive | w | v | 1k | ⟨tr:L1⟩ | We arrive at 6. |
| 19 | leave | w | v | top500 | ⟨tr:L1⟩ | The bus leaves in five minutes. |
| 20 | late | w | adj | top500 | ⟨tr:L1⟩ | Sorry, I'm late. |
| 21 | early | w | adj | 1k | ⟨tr:L1⟩ | The train was early. |
| 22 | delayed | w | adj | 4k | ⟨tr:L1⟩ | The 9:10 is delayed. |
| 23 | crowded | w | adj | 3k | ⟨tr:L1⟩ | The bus is crowded. |
| 24 | downtown | w | n/adv | 3k | ⟨tr:L1⟩ | I work downtown. |
| 25 | corner | w | n | 1k | ⟨tr:L1⟩ | The shop is on the corner. |
| 26 | block | w | n | 2k | ⟨tr:L1⟩ | It's two blocks from here. |
| 27 | straight | w | adv | 1k | ⟨tr:L1⟩ | Go straight. |
| 28 | turn | w | v | 1k | ⟨tr:L1⟩ | Turn left at the bank. |
| 29 | cross | w | v | 2k | ⟨tr:L1⟩ | Cross the street. |
| 30 | traffic | w | n | 2k | ⟨tr:L1⟩ | There was a lot of traffic. |
| 31 | get on | c | phr-v | — | ⟨tr:L1⟩ | Get on the bus at Fifth Street. |
| 32 | get off | c | phr-v | — | ⟨tr:L1⟩ | Get off at the hospital. |
| 33 | get to | c | phr-v | — | ⟨tr:L1⟩ | How do I get to the airport? |
| 34 | How do I get to ___? | c | chunk | — | ⟨tr:L1⟩ | How do I get to the library? |
| 35 | Which bus goes to ___? | c | chunk | — | ⟨tr:L1⟩ | Which bus goes to downtown? |
| 36 | One ticket to ___, please | c | chunk | — | ⟨tr:L1⟩ | One ticket to Springfield, please. |
| 37 | Is this the right train for ___? | c | chunk | — | ⟨tr:L1⟩ | Is this the right train for the airport? |
| 38 | How long does it take? | c | chunk | — | ⟨tr:L1⟩ | — |
| 39 | It takes about ___ minutes | c | chunk | — | ⟨tr:L1⟩ | It takes about twenty minutes. |
| 40 | Excuse me, where is ___? | c | chunk | — | ⟨tr:L1⟩ | Excuse me, where is the bus stop? |
| 41 | I'm running late | c | chunk | — | ⟨tr:L1⟩ | Sorry, I'm running late. |
| 42 | on time | c | chunk | — | ⟨tr:L1⟩ | The train was on time. |
| 43 | rush hour | c | chunk | — | ⟨tr:L1⟩ | Don't drive at rush hour. |
| 44 | tap your card | c | chunk | — | ⟨tr:L1⟩ | Tap your card when you get on. |

(Remaining ~103 U7 items follow the same pattern across L04/L06/L07/L11 etc.; full lists are authoring-phase work.)

---

## 5. Grammar progression across the band

Each point is tied to the communicative need that motivates it; order is load-bearing. `l1_contrast` marks points that MUST ship with L1-parameterized contrast notes (schema in §5.1).

| # | Point | Lesson | Communicative need | l1_contrast |
|---|---|---|---|---|
| G1 | Info questions review (`How do you…? Which bus…?`) | U7-L03 | Getting route information | med |
| G2 | Imperatives + prepositions of movement | U7-L06 | Following/giving directions | low |
| G3 | `by + transport`; `take/get/ride` collocations | U7-L03 | Saying how you travel | med |
| G4 | `How long does it take? It takes…` | U7-L10 | Trip planning; dummy-it | high |
| G5 | `have to / don't have to` | U7-L13 | Rules and schedule necessity | med |
| G6 | `feel + adj` / `have + noun` | U8-L03 | Reporting symptoms | high |
| G7 | `should / shouldn't` | U8-L06 | Asking for / giving advice | med |
| G8 | `need to + verb` | U8-L10 | Stating necessity politely | low |
| G9 | `Why…? Because…` + one follow-up question | U8-L15 | Sustaining an exchange one extra turn | low |
| G10 | Past `was/were` | U9-L01 | Locating self in the past; states | high |
| G11 | Past simple regular (-ed) incl. spelling + pron | U9-L04/L05 | Recounting completed actions | high |
| G12 | Irregular past set 1 (8 verbs) | U9-L07 | Highest-frequency past events | high |
| G13 | `didn't` / `Did you…?` + short answers | U9-L09 | Past conversation, not just monologue | high |
| G14 | Irregular set 2 (12 verbs) + sequencers first/then/after that | U9-L14 | Chaining events into a story | med |

Deliberate exclusions (deferred to U10–12 planners): present perfect, `going to` (U10 owns future), comparatives review, `could` past ability. `gonna/wanna` are treated as LISTENING objects in this band, not productive grammar [proposed].

### 5.1 L1-parameterized contrast schema `[proposed]`

Slot attached per grammar point / pron target / lesson:

```yaml
l1_contrast_note:
  scope: grammar_point | pron_target | lesson    # what ref_id points at
  ref_id: G11
  l1: es                                          # ISO 639-1/BCP-47 of UI language
  priority: 1                                     # 1 = render in intro_md; 2 = feedback-only; 3 = author reference
  interference_summary_md: >                      # shown to learner IN THEIR L1
    (rendered in L1)
  contrast_examples:                              # fuels distractor generation + targeted feedback
    - learner_error_en: "..."
      target_en: "..."
      mechanism: "..."                            # why this L1 produces this error
  distractor_hints: ["..."]                       # feed exercise_options generation
```

**Filled examples — G11 (past simple regular -ed), three priority L1s:**

```yaml
- {scope: grammar_point, ref_id: G11, l1: es, priority: 1,
   interference_summary_md: "El pasado simple en inglés se forma igual para todas las personas: agrega -ed (worked = trabajé/trabajaste/trabajó...). No cambia según la persona. Cuidado con la pronunciación: la -ed casi nunca suena como 'ed'.",
   contrast_examples:
     - {learner_error_en: "Yesterday I work-ED [ɛd] a lot.", target_en: "Yesterday I worked /wɜrkt/ a lot.", mechanism: "Spanish reads every written vowel; -ed is usually /t/ or /d/, not /ɛd/."}
     - {learner_error_en: "Visited my grandmother yesterday.", target_en: "I visited my grandmother yesterday.", mechanism: "Spanish is pro-drop; English requires the subject pronoun."},
   distractor_hints: ["-ed pronounced as extra syllable", "dropped subject pronoun"]}

- {scope: grammar_point, ref_id: G11, l1: zh, priority: 1,
   interference_summary_md: "中文用时间词（昨天）或'了'表示过去，动词本身不变。英语不同：即使句子里已经有 yesterday，动词也必须加 -ed。时间词 + 动词变化，两个都要。",
   contrast_examples:
     - {learner_error_en: "Yesterday I watch TV.", target_en: "Yesterday I watched TV.", mechanism: "Mandarin marks time lexically (昨天/了); verb inflection feels redundant so it is dropped."}
     - {learner_error_en: "I watched TV yesterday, and then I sleep.", target_en: "…and then I slept.", mechanism: "Tense marking abandoned after first verb; English requires it on every finite verb."},
   distractor_hints: ["bare verb with past time adverb", "tense dropped on second verb in sequence"]}

- {scope: grammar_point, ref_id: G11, l1: ar, priority: 1,
   interference_summary_md: "في الإنجليزية، الماضي البسيط يُصنع بإضافة ed- للفعل، ولا يتغير مع الفاعل (worked = عملتُ/عملتَ/عمل). انتبه: مجموعة الحروف الساكنة في نهاية الكلمة (walked /wɔːkt/) تُنطق بدون إضافة حركة.",
   contrast_examples:
     - {learner_error_en: "I walk-ed-i to school. (epenthetic vowel)", target_en: "I walked /wɔːkt/ to school.", mechanism: "Arabic phonotactics disfavor final clusters; speakers insert a vowel after -ed."}
     - {learner_error_en: "Yesterday I was watched TV.", target_en: "Yesterday I watched TV.", mechanism: "Overgeneralized 'was' as a past marker (aspect-system transfer)."},
   distractor_hints: ["was + past verb", "epenthetic vowel in cluster (dictation/speaking)"]}
```

Authors must fill priority-1 notes for the 10 priority L1s on every `l1_contrast: high` point before a lesson can leave `draft` [proposed]. Remaining ~31 L1s: machine-drafted from the mechanism fields, human-reviewed opportunistically [proposed].

---

## 6. Pronunciation progression

Ranking principle: **intelligibility payoff for the priority-L1 mix**, not nativeness. Functional-load-weighted [assumption: Catford/Brown functional load rankings — requires validation].

| # | Target | Band lesson | Minimal pairs / practice set | Who needs it most; why it pays |
|---|---|---|---|---|
| P1 | Word stress in compounds & place names | U7-L05 | BUS stop, TRAIN station, AIRport, downTOWN, RUSH hour | Mandarin, Vietnamese (tone-L1 stress transfer); Farsi (default final stress). Wrong stress breaks place-name recognition in transactions |
| P2 | Final clusters /-st -ks -kt/ | U7-L05 | next, first, asked, tickets, costs | Vietnamese, Mandarin, Portuguese, Somali (deletion/epenthesis). Cluster loss deletes grammatical info |
| P3 | /ɪ/ vs /iː/ | U7-L14 | live/leave, sit/seat, ship/sheep, it/eat, fill/feel | Spanish, Arabic, Russian, Ukrainian, Somali (single high front vowel). "I'm living now" vs "I'm leaving now" is a real transactional failure |
| P4 | /θ ð/ | U8-L04 | think/sink, three/tree, thin/tin, they/day, mouth/mouse | Nearly all priority L1s. High visibility in health lexis (throat, teeth, thirty) |
| P5 | /æ/ vs /ʌ/ | U8-L16 | back/buck, cap/cup, ankle/uncle, match/much | Spanish, Arabic, Russian, Haitian Creole. Body/health lexis dense in /æ/ |
| P6 | Sentence stress & question intonation | U8-L16 | WHERE does it HURT?; yes/no rising list | All L1s; carries the advice/symptom exchange |
| P7 | -ed endings /t d ɪd/ | U9-L05 | walked, played, visited; walk/walked, plan/planned | All L1s; the audible difference between present and past — grammar-critical |
| P8 | Weak forms & fast questions (receptive-first) | U9-L10 | was /wəz/, were /wə/, didja, whadja, gonna, wanna | All L1s; without this, learners can't hear questions aimed at them |
| P9 | Linking (receptive + guided) | U7-L09 | get‿on, get‿off, an‿appointment, turn‿around | All; supports listening speed targets |

Assessment: each pron lesson has a discrimination gate (listening_mc minimal pairs, ≥7/10) before production; production scored by ASR on the specific feature only — global accent is never scored [proposed]. Minimal-pair items get FSRS cards typed `pron_pair` [proposed §16].

---

## 7. Listening progression

| Stage | Text types | Speed [proposed] | Reduced forms | Tasks |
|---|---|---|---|---|
| U7 early | Scripted service dialogues (ticket window), short announcements (1–2 sentences) | 95–110 wpm, clear diction, mild station noise on 2nd listen | gonna (receptive intro) | Catch platform/time/price; select correct route; map trace |
| U7 late | Transit app voice alerts; directions monologue | 110–120 wpm | hafta; linking get‿on/off | Follow multi-step directions; detect the changed detail ("...leaves at 8:15 — no wait, 8:50") |
| U8 | Phone calls (NO visual support): booking, pharmacy counter with dosage | 110–125 wpm; one speaker at a time | wanna, gonna consolidated | Extract date/time/name-spelling; choose correct dosage; note-taking-lite (fill 3 slots) |
| U9 | Social exchanges ("How was your weekend?"); 60–90 s narrative monologues | 120–135 wpm; natural-ish rhythm | didja, whadja, weak was/were | Sequence events; identify feeling/evaluation; distinguish present vs past forms by ear |

Standing rules [proposed]: every passage recorded in 2 speeds (0.85× "support" and 1.0×); support speed allowed twice per item before it flags for review. Accent rotation: min. 3 accent profiles per unit (e.g., General American, Indian English, Spanish-accented English) — CEFR-aligned goal of understanding intelligible accented speech, and matches the graduation definition of done. All listening lessons end with a 1-turn spoken micro-response (listen → react), keeping listening tied to interaction.

---

## 8. Writing progression

| Stage | Genres | Target moves | Length |
|---|---|---|---|
| U7 | Chat messages: running-late apology (L12); travel-options request (L16) | Greeting → state problem/need → propose/request → close; `and/but/because` linking | 2–4 sentences |
| U8 | Absence message to teacher/boss (L09); clinic intake form (L17); question to pharmacist (L17) | Register selection (boss vs friend); required-move completeness; form-field literacy (DOB, allergies) | 3–5 sentences + form |
| U9 | Chat reply about weekend (L11); connected recount (L16) | Past-tense control in writing; sequencers first/then/after that; 5–6 sentence connected text | 5–6 sentences |

CEFR anchors: A2 "short, simple notes and messages relating to matters in areas of immediate need" (U7–U8) moving toward "very simple personal letter" territory (U9 recount). Mechanics thread [proposed]: capitalization + sentence-final punctuation enforced from U7 (relevant for Arabic-, Mandarin-, Russian-script L1s); a/an/the errors logged but only corrected when understanding-blocking (correction priority rule 1) — article mastery is NOT an early-A2 gate.

---

## 9. Speaking progression & embedded AI interactions per unit

### Band ratio compliance (40–50% structured / 35–45% guided / 10–20% open)

Progression within the band [proposed]:
- U7: ~48% structured / 38% guided / 14% open
- U8: ~46% / 37% / 17%
- U9: ~43% / 38% / 19% (front edge of late-A2 mix, appropriate as the band exits toward U10)
- Band aggregate: **≈46% structured / ≈36% guided / ≈15% open + ~3% assessment** (computation in §14).

### Controlled → guided → spontaneous ladder (speaking thread)

1. **Controlled** (inside vocab/grammar/pron lessons): repeat-after-model, minimal-pair production, picture-cued single sentences, dialogue completion with fixed options. ASR scores only the lesson's target feature.
2. **Guided interaction** (dedicated `[speaking]` lessons + `[AI-W]/[AI-S]`): scaffolded roleplay with visible sentence frames that FADE across attempts (attempt 1: full frames; attempt 2: keyword hints; attempt 3: bare task card) [proposed scaffolding-fade rule for the whole band]; information-gap tasks where the AI holds half the data; guided Q&A with mandated follow-up questions.
3. **Spontaneous** (`[mission]` + free-talk blocks): goal-defined, language-undefined. AI persona does NOT simplify unless breakdown occurs; unexpected-but-level-appropriate events injected by spec (sold-out ticket, no appointment slots, wrong item offered); learner must deploy repair chunks.

Repair-language thread (owner "breakdown repair" requirement): "Sorry, can you say that again?" (entering, from A1) → "Can you speak more slowly, please?" (U7-L08) → "Do you mean ___?" (U8-L07) → "Sorry, I meant ___ / I said ___" self-repair (U9-L06+). Every mission's rubric includes at least one successful repair-or-clarification move [proposed].

### Embedded AI interactions per unit (owner requirement: EVERY unit has written AND spoken)

| Unit | Written AI | Spoken AI | Guided speaking | Mission (open) | + micro-exchanges |
|---|---|---|---|---|---|
| U7 | L12 running-late text (5–7 turns) | L15 ticket info-gap (8–12 turns) | L08 directions roleplay | L18 plan a trip across town | every non-review lesson, 1–2 turns |
| U8 | L09 absence message (5–7 turns) | L13 clinic call (8–12 turns) | L07 advice swap | L19 pharmacy visit | idem |
| U9 | L11 weekend chat (5–8 turns) | L17 memorable day (10–14 turns) | L06 yesterday Q&A; L15 story retell | L18 interview & report | idem |

Every one of these ships with the full interaction contract of §13b/§13c (fields mandated by the owner spec). The three fully-worked contracts in §13 are the templates.

---

## 10. Cultural / pragmatic content (woven in, never standalone lessons)

| Where | Content |
|---|---|
| U7-L08 | Openers and softeners with strangers: "Excuse me…", "Could you tell me…?"; thanking and closing ("Thanks so much! / No problem") |
| U7-L11/L13 | Transit norms [US-default, region-configurable — requires validation per deployment]: tap-in fare systems, exact change, queuing at stops, letting passengers off first |
| U7-L12 | Texting register with friends: contractions OK, "sorry!!" acceptable, emoji tolerated; contrast with L16 message to a host (fuller sentences, please/thank you) |
| U8-L09 | Register split — same content, two audiences: teacher/boss ("Dear Ms. Park, I'm sorry but…") vs friend ("hey, can't come today, I'm sick"). This is the band's flagship pragmatics lesson |
| U8-L13 | Phone openers/closers: "Hi, I'd like to make an appointment", spelling your name proactively, "Thank you, see you Tuesday" |
| U8-L14 | 911 usage norms; pharmacist-vs-doctor scope; gesture note: pointing to body parts is expected and helpful at the pharmacy |
| U9-L03/L11 | "How was your weekend?" as social ritual — expected short positive answer + return question; not a request for full biography |
| U9-L17 | Active listening tokens: "Oh really?", "That's nice", "Oh no!" — receptive in listening, productive in the AI conversation |
| Band-wide | Politeness formula escalation: want → would like; can → could. Titles + last names for service/professional contexts; first names among peers [assumption: US-centric defaults; other English deployments need a variant pass] |

---

## 11. Review scheduling & remediation rules

### Review touchpoints [proposed]
1. **Daily FSRS queue** (existing `vocab_card_state`): all vocab, chunk, irregular-form and pron-pair cards; target 8–10 min/day; queue capped at 40 cards with overflow prioritized by retrievability.
2. **In-lesson interleaving**: from U7-L05 on, ≥20% of exercise slots in every non-review lesson are review items sampled from ≥2 units back (see E12 in the §13a sample). Review items prefer the learner's own `saved_error` categories.
3. **Unit cumulative reviews** (U7-L17, U8-L18, U9-L18a): interleaved retrieval across current + 2 prior units; mixed exercise types; no new content; feeds `skill_mastery` recalculation.
4. **Warm-up retrieval**: every session opens with a 90-second retrieval sprint (3–5 items due today) before new content [proposed].
5. **Post-interaction consolidation**: errors saved from AI interactions regenerate as cloze/dictation items within 24–48h ("your own errors become your review deck") — this is the band's highest-value review loop [proposed].

### Remediation rules for the band [proposed]
- **Trigger A (grammar gate)**: `skill_mastery` < 0.6 on a hard-gating lesson → auto-insert matching remediation lesson before the gated lesson unlocks.
- **Trigger B (vocab debt)**: >30% of unit vocab cards overdue → next session becomes review-first (new content locked for that session only).
- **Trigger C (interaction failure)**: success criteria missed on the same AI interaction twice → scaffolding level re-escalates (frames return) + targeted micro-lesson; third failure → flag for CP2-style diagnostic, never infinite retry.
- **Trigger D (pron)**: discrimination gate failed twice → remediation RP1 + feature temporarily removed from ASR scoring (don't punish production while perception is absent).
- Remediation pool for this band (not in the 55): **R7a** direction grammar rebuild · **R7b** transactional listening slow-lane · **R8a** symptom lexis rebuild · **R8b** should/advice · **R8c** register repair for written messages · **RP1** cluster + -ed pronunciation clinic.
- Remediation lessons never introduce new vocabulary and always end in a re-attempt of the failed gate.

---

## 12. Checkpoint 2 design (after U8)

Purpose: certify **transactional survival competence** (U6 shopping + U7 transport + U8 health) before the past-tense unit. Per owner spec: proficiency claims come ONLY from performance evidence below — never XP, streaks, completion or time.

**Format:** ~40 min, splittable across 2 sessions; parts are independently retakeable.

| Part | Time | Evidence collected | Gate [proposed thresholds — require validation vs. pilot data] |
|---|---|---|---|
| A. Adaptive retrieval quiz | 10 min | 24 FSRS-weighted vocab/chunk items + 12 grammar cloze (G1–G9), sampled U6–U8, biased to the learner's weak cards | ≥80% vocab, ≥70% grammar |
| B. Listening | 8 min | 1 announcement + 1 appointment-call recording, 8 items (key info extraction, incl. one reduced-form item) | ≥6/8 |
| C. Written task | 7 min | Absence-or-apology message to a specified audience; machine-scored rubric 0–2 × {task moves complete, language control, register} | ≥4/6 with no 0 on task moves |
| D. Spoken transactional roleplay | 12 min | Two AI scenarios: (1) buy a ticket with one surprise, (2) pharmacy symptom + product; rubric 0–2 × {task completion, intelligibility, repair use, target grammar} per scenario | ≥10/16 overall AND ≥1 successful repair move AND no scenario abandoned |
| E. Micro-conversation (unscored) | 3 min | Small talk incl. one past-tense question ("What did you do yesterday?") | No gate — baselines U9 readiness; response stored for U9-L01 personalization |

**Pass logic [proposed]:**
- All gates met → `passed` → U9 unlocks.
- Exactly one gate missed by ≤10% → `passed_with_review` → U9 unlocks AND matching remediation lesson(s) become mandatory within the next 5 sessions.
- Two+ gates missed, or Part D failed → `remediation` → targeted R-lessons assigned; ONLY failed parts are retaken, after ≥2 days and completion of assigned remediation.
- 3 failed cycles on the same part → escalate out of the loop: human-coach flag where available; otherwise alternative-format attempt (e.g., Part D at support speed with outcome capped at `passed_with_review`) [proposed — avoids the infinite-remediation trap].

**Storage [proposed]:** `checkpoints` + `checkpoint_attempts` (§16) retain per-rubric-cell scores and audio/text evidence refs, giving graduation (post-U12) a longitudinal evidence chain rather than a single exam snapshot.

---

## 13. Fully-specified samples (pipeline-testable)

### 13a. Complete lesson — EN-A2-U9-L04 "Past simple: regular verbs"

```yaml
lesson:
  id: EN-A2-U9-L04
  unit: U9
  skill_type: grammar
  status: draft
  est_minutes: 14
  prereqs: [EN-A2-U9-L01, EN-A2-U9-L02]
  unlocks: [EN-A2-U9-L05, EN-A2-U9-L06, EN-A2-U9-L07]
  grammar_point: G11
  intro_md: |            # rendered in learner L1; EN shown for planning
    To talk about finished actions, add **-ed** to the verb:
    work → worked · play → played · visit → visited
    Same form for I / you / he / she / we / they.
    Spelling: study → stud**ied** · stop → stop**ped**
    (l1_contrast_note priority-1 for learner's L1 renders here — see §5.1)
  vocab_lesson_map:      # 12 items; past forms flagged form_of
    - {lemma: "last night", type: chunk}
    - {lemma: "all day", type: chunk}
    - {lemma: watched, form_of: watch}
    - {lemma: played,  form_of: play}
    - {lemma: worked,  form_of: work}
    - {lemma: cooked,  form_of: cook}
    - {lemma: cleaned, form_of: clean}
    - {lemma: visited, form_of: visit}
    - {lemma: studied, form_of: study}
    - {lemma: stayed,  form_of: stay}
    - {lemma: talked,  form_of: talk}
    - {lemma: walked,  form_of: walk}
```

Exercises (12 + closing micro-interaction). Difficulty 1–5; R = receptive, P = productive.

| # | Type | Prompt | Key / options (rationales) | Diff | R/P | Vocab map | Est. s |
|---|---|---|---|---|---|---|---|
| E1 | flashcard ×6 | watch→? play→? work→? visit→? study→? stay→? | watched, played, worked, visited, studied, stayed | 1 | R | all form_of items | 60 |
| E2 | matching | Match base ↔ past (6 pairs: cook, clean, talk, walk, study, stay) | cooked, cleaned, talked, walked, studied, stayed | 1 | R | 6 items | 45 |
| E3 | cloze (MC) | "I ___ TV last night." | ✔ **watched** (past time signal *last night* → -ed) · ✘ watch ("last night" = finished time, verb needs -ed) · ✘ watches (-es is present, he/she form) · ✘ watching (-ing needs am/was before it) | 2 | R | watched, last night | 40 |
| E4 | cloze (typed) | "She ___ (study) English for two hours yesterday." | key: **studied** (rationale shown on error: y after consonant → -ied) | 3 | P | studied | 45 |
| E5 | listening_mc | 🔊 "We cleaned the apartment this morning." — What did they do? | ✔ **They cleaned the apartment** · ✘ They clean it every morning (audio has /d/ ending + finished-time meaning) · ✘ They cooked this morning (wrong verb — listen to the first sound) · ✘ They will clean it (that's future; audio is past) | 2 | R | cleaned | 50 |
| E6 | listening_mc | 🔊 "I worked downtown." — Past or present? | ✔ **Past** (final /t/ on *worked*) · ✘ Present (you'd hear *work*, no /t/) | 3 | R | worked | 40 |
| E7 | ordering | Order: [yesterday] [I] [visited] [my grandmother] | key: "I visited my grandmother yesterday." (alt accepted: "Yesterday I visited my grandmother.") | 2 | P | visited | 45 |
| E8 | dictation | 🔊 "We stayed home and watched a movie last night." | exact text; -ed spelling scored; per-word diff feedback | 3 | P | stayed, watched, last night | 60 |
| E9 | translation (L1→EN) | Prompt rendered in L1 — es: "Ayer trabajé mucho." · zh: 昨天我工作了很久。 · ar: عملتُ كثيرًا أمس. | key: "I worked a lot yesterday." (accepted: "Yesterday I worked a lot."; L1-aware error msgs: es→dropped "I"; zh→bare verb "work"; ar→"was worked") | 3 | P | worked | 60 |
| E10 | speaking | Picture: Maria + dinner + "last night". Say what Maria did. | key: "Maria cooked dinner last night." ASR scores ONLY audible -ed (/t/ on cooked); retry ×2 with slowed model | 3 | P | cooked, last night | 60 |
| E11 | dialogue | A: "Hi! I called you last night." B: ___ | ✔ **"Sorry! I stayed at work late."** (past context → past verb) · ✘ "Sorry! I stay at work late." (that's a habit; last night needs stayed) · ✘ "Yes, I am at work." (answers now, not last night) · ✘ "I will stay at work." (future; the call already happened) | 3 | R→P | stayed | 50 |
| E12 | cloze (MC, interleave U8 review) | "My head hurts. You ___ take some medicine and rest." | ✔ **should** (advice) · ✘ shouldn't (this is good advice, positive) · ✘ needs (with *you*, use need — and *should* is the advice word here) | 2 | R | (review: G7) | 35 |
| — | micro-interaction (written, 2 turns) | AI: "What did you do last night?" → learner types 1 sentence → AI recasts if -ed missing, then 1 friendly follow-up (no correction on turn 2) | success: ≥1 correctly formed regular past verb | 3 | P | any | 120 |

Timing: intro 90 s + exercises 590 s + micro-interaction 120 s ≈ **13.5 min**. Mastery effects: `skill_mastery` update on G11; FSRS cards created for the 12 mapped items; E6/E10 feed pron-target P7 pre-baseline. Saved error categories: `bare_verb_past_context`, `ed_extra_syllable`, `dropped_subject`, `was_plus_verb`, `ed_spelling`.

### 13b. Written AI interaction spec — EN-A2-U8-L09 "I'm sick" absence message

```yaml
ai_interaction:
  id: AI-W-U8-L09
  mode: written
  interaction_type: guided_message_exchange   # owner taxonomy: requests + describing
  communicative_objective: >
    Notify a teacher or boss of illness and absence in an appropriate register;
    answer one follow-up question.
  curriculum_context:
    unit: U8; lesson: L09
    prior: symptoms lexis (L01-L02), feel+adj / have+noun (L03), should (L06)
    upcoming: need to (L10) — AI may model it receptively, never require it
  assumed_vocabulary: [sick, ill, fever, headache, sore throat, doctor, appointment,
    today, tomorrow, sorry, "I can't come", "I have a...", "I feel...", rest]
  target_grammar: [G6 feel+adj / have+noun, "can't + verb", polite frames "I'm sorry, but..."]
  target_pronunciation: n/a (written mode)
  permitted_unfamiliar_language:   # AI may USE (receptive only), never require
    ["Get well soon", "Take care", "No problem at all", "Hope you feel better"]
  scaffolding_rules:
    attempt_1: audience card (boss vs teacher, learner picks) + 3 sentence frames visible
    attempt_2+: frames collapse to keyword hints (greet / say sick / say absent / close)
    fade_trigger: success once -> frames off by default, recallable via hint button
  expected_ai_behavior: >
    Plays the chosen recipient. Replies <= 2 sentences, A2-graded, warm.
    Turn 2 MUST ask exactly one follow-up ("How long will you be away?" or
    "Do you need anything?"). Never asks two questions in one turn. Ends by
    turn 6 with a closing formula. Never breaks persona; if learner writes in
    L1, responds in English with "In English, please -- you can do it!" once,
    then L1-rendered system nudge.
  correction_rules:   # owner priority order
    in_flight: concise recast of priority-1 (understanding-blocking) and
      priority-2 (target: feel/have, can't) errors only, embedded naturally
      ("Oh no, you FEEL sick -- since when?"). Max 1 recast per turn.
    after_action: full feedback panel in L1: up to 3 errors, priority-ordered
      (1 blocking, 2 lesson target, 3 repeated high-value, 4 n/a written),
      each with l1_contrast note when a mapped mechanism matches.
  success_criteria:
    required_moves: [greeting matching register, illness statement with feel/have,
      absence statement, closing]
    language: ">=2 target structures used; message comprehensible without L1 knowledge"
    interaction: "answers the follow-up question responsively"
  mastery_effects:
    skill_mastery: writing +delta, G6 +delta (weight 0.5 vs lesson exercises)
    vocab: each target item used correctly => FSRS review-success event
  saved_error_categories: [register_mismatch, missing_move, present_for_state_verbs,
    subject_drop, unintelligible_segment]
  review_behavior: >
    Saved errors regenerate as cloze/dialogue items in next-day queue;
    register_mismatch errors additionally queue the L09 register mini-explainer.
  analytics: [turns, learner_words, moves_completed, recast_uptake_rate,
    time_on_task, completion_state, tokens_in, tokens_out, cost_usd]
  failure_handling:
    stalled_turn (90s no input): frame hint auto-shows
    2_incoherent_turns: switch to template mode (fill-the-blanks message), mark partial
    session_drop: resumable 24h; else marked incomplete, re-queued once
  cost_expectations: "[assumption] 5-7 short turns, graded persona prompt ~1.2k tokens;
    est. 3-5k total tokens/session; target < $0.01/session on a small model tier;
    p95 < $0.03. Requires validation against chosen model pricing."
```

### 13c. Spoken AI interaction spec — EN-A2-U7-L15 "Buying a ticket" (information gap)

```yaml
ai_interaction:
  id: AI-S-U7-L15
  mode: spoken
  interaction_type: information_gap + transaction
  communicative_objective: >
    Obtain schedule/price information and buy the correct ticket under a
    constraint the AI doesn't volunteer (learner card: "arrive downtown before
    3pm, spend under $10"); handle one unexpected event.
  curriculum_context:
    unit: U7; lesson: L15
    prior: L02 ticket lexis, L03 how-do-I-get-to, L10 how-long-does-it-take, L05/L14 pron
  assumed_vocabulary: [ticket, one-way, round-trip (receptive), fare, platform, next,
    leave, arrive, "How much is...", "One ticket to ___, please",
    "How long does it take?", "Is this the right...?"]
  target_grammar: [G1 info questions, G4 it takes]
  target_pronunciation: [P2 final clusters "next", "costs"; P3 /ɪ-iː/ leave/live;
    P1 stress on place names]
  permitted_unfamiliar_language: ["express", "sold out", "card or cash?"]  # receptive; each has tap-for-L1-gloss
  scaffolding_rules:
    attempt_1: task card in L1 + 3 question frames on screen
    attempt_2+: task card only
    in_task: learner can say "Can you repeat that, please?" unlimited; 2x same
      repeat -> AI slows and simplifies (support register)
  expected_ai_behavior: >
    Ticket agent persona. Speaks 100-115 wpm, 1-2 sentences/turn. Holds the
    timetable (info gap). Waits up to 8s; then prompts "Can I help you?".
    MUST inject exactly one surprise mid-task: "The 2:15 express is sold out."
    Accepts any comprehensible order; asks natural clarification when learner
    is ambiguous ("One-way or round-trip?"). Closes with total price + platform.
  correction_rules:
    in_flight: priority-1 only, as natural clarification ("Sorry -- LIVE at 2, or
      LEAVE at 2?"); pron feedback in-flight ONLY for P2/P3 targets and only as
      recast, max 2 per session. No metalanguage while speaking.
    after_action: L1 feedback panel: task outcome, 2-3 prioritized language notes
      (order: blocking > target grammar/pron > repeated high-value), replayable
      audio snippets of learner vs model for one pron item.
  success_criteria:
    task: bought a ticket satisfying BOTH constraints (before 3pm, under $10)
      despite the surprise
    interaction: >=3 learner-initiated questions; handled surprise without L1
    intelligibility: ASR transcribable >= 85% of learner turns [proposed metric]
  mastery_effects: {skill_mastery: [speaking, G1, G4], pron_targets: [P2, P3 attempt data],
    vocab: FSRS review-success on used chunks}
  saved_error_categories: [question_word_order, live_leave_vowel, cluster_deletion,
    number_time_confusion, silence_timeout]
  review_behavior: pron errors -> minimal-pair listening_mc next day; question-form
    errors -> ordering exercises; failed surprise-handling -> repair-chunk flashcards
  analytics: [turns, learner_speech_seconds, asr_confidence_mean, questions_initiated,
    repair_moves, surprise_handled, task_success, retry_count, latency_p95,
    tokens_in/out, tts_chars, asr_seconds, cost_usd]
  failure_handling:
    asr_confidence < 0.4 twice: offer tap-to-type fallback for that turn (marked)
    3 breakdowns: AI completes transaction cooperatively, session marked
      partial -> remediation R7b queued; never a dead end
    network_loss: resume token at last completed turn
  cost_expectations: "[assumption] 8-12 turns; LLM 4-6k tokens + ASR ~90s + TTS
    ~600 chars; est. $0.03-0.08/session all-in; p95 < $0.12. Requires validation."
```

### 13d. Conversation mission — EN-A2-U8-L19 "At the pharmacy"

```yaml
mission:
  id: MISSION-U8-L19
  type: real_world_simulation   # open conversation band share
  scenario: >
    Walk-in pharmacy. Learner has a sick family member at home (card, in L1:
    daughter, 8 years old, fever since last night, allergic to penicillin).
    Goal: get an appropriate product and understand how to use it.
  communicative_objective: >
    Multi-step transaction: greet; describe someone else's symptoms; answer
    duration and age questions; disclose the allergy when relevant; understand
    dosage instructions; ask >=1 clarification; close.
  curriculum_context: caps U8; assumes L01-L18; follows AI-W L09 + AI-S L13 success
  assumed_vocabulary: U8 lexis (symptoms, medicine forms, twice a day, allergic to)
  target_grammar: [G6, G7 receptive, G8, G9 because]
  target_pronunciation: [P4 /θ/ in "three days", "teeth"; P6 sentence stress]
  permitted_unfamiliar_language: ["children's", "every six hours", "with food",
    "see a doctor if..."]   # receptive, glossable
  scaffolding_rules: NONE visible (mission = open). Safety net: after 2 breakdowns
    the pharmacist naturally simplifies; no frames ever shown mid-mission.
  expected_ai_behavior: >
    Pharmacist persona, professional-warm register, 105-120 wpm. Asks realistic
    questions in natural order (who is it for? how old? how long? allergies?).
    Does NOT volunteer the allergy question until dosage step IF learner hasn't
    disclosed -- creating a genuine information-duty moment. Gives dosage in 2
    short sentences; willing to repeat/slow on request. One optional surprise
    (preferred product out of stock) at difficulty tier 2+.
  correction_rules: >
    In-flight: priority-1 only (comprehension-blocking), always as natural
    pharmacist clarification, never metalinguistic. Everything else deferred.
    After-action (L1): task-move review first, then max 3 language notes
    (priority order per owner), each linked to a replay snippet.
  success_criteria:
    rubric_0_2_each: [symptoms_conveyed, questions_answered_responsively,
      allergy_disclosed_unprompted_or_when_asked, dosage_understood
      (verified by 2 in-persona check questions: "So, how much do you give her?"),
      clarification_or_repair_used]
    pass: ">=7/10 AND dosage_understood == 2"
  mastery_effects: mission_passed feeds unit completion + CP2 Part D exemption
    eligibility [proposed: a passed mission can waive the matching CP2 scenario];
    contributes evidence rows to the graduation evidence chain
  saved_error_categories: [key_info_omitted, misunderstood_instruction,
    theta_substitution, register_slip, repair_avoidance]
  review_behavior: failed rubric cells spawn targeted micro-tasks (e.g. dosage
    listening items at support speed) within 48h; mission retakeable after them
  analytics: [rubric_cells, turns, learner_speech_seconds, clarifications,
    surprise_handled, pass, attempt_n, cost_usd]
  failure_handling: hard breakdown -> pharmacist writes it down ("Let me write
    that for you") = graceful in-fiction completion, scored partial; 2 failed
    attempts -> remediation R8a/R8b per failed cells, then attempt 3 with
    difficulty tier 1 (no surprise)
  cost_expectations: "[assumption] 10-16 turns; est. $0.05-0.10/attempt all-in;
    p95 < $0.15. Requires validation."
```

---

## 14. Band totals

| Metric | Value |
|---|---|
| Core lessons | **55** (U7: 18 · U8: 19 · U9: 18) + Checkpoint 2 + 6 remediation pool |
| New vocab/chunk items | **450** (U7: 147 · U8: 153 · U9: 150); ≈32% multiword chunks; 20 irregular-past `form_of` cards included |
| AI interactions (full contracts) | 6 dedicated (3 AI-W, 3 AI-S) + 3 guided-speaking lessons + 3 missions + ~46 micro-exchanges |
| Grammar points | 14 (G1–G14) |
| Pron targets | 9 (P1–P9) with minimal-pair inventory |

**Time model (median learner, planning estimate — never a user-facing guarantee):**

| Activity type (owner's accounting categories) | Min | Notes |
|---|---|---|
| Core lessons (55 × ~12 min avg) | 660 | includes in-lesson micro-interactions |
| Spaced review (FSRS daily queues) | 250 | ~8–10 min/day across the band's ~30 active days |
| Guided speaking (incl. AI-S sessions + retries) | 280 | |
| Open conversation (missions + free blocks) | 170 | |
| Listening (dedicated passages beyond core) | 130 | |
| Writing (incl. AI-W sessions) | 110 | |
| Remediation (median; p90 ≈ 180) | 60 | |
| Checkpoint 2 | 40 | |
| **Total** | **≈1,700 min ≈ 28.3 h** | plausible range 23–35 h [proposed] |

**Ratio check** [proposed method: core lessons decompose ≈55% structured / 35% guided / 10% open by exercise-slot audit]:
structured ≈ 782 min (**46%**) · guided interaction ≈ 607 min (**35.7%**) · open conversation ≈ 251 min (**14.8%**) · assessment ≈ 60 min (3.5%). All inside the owner's 40–50 / 35–45 / 10–20 band. U9 sessions individually trend ~43/38/19, correctly gliding toward the late-A2 mix.

Global fit: 28.3 h ≈ 3/12 units of the owner's 100–165 h envelope with A2-appropriate weighting — on target [proposed].

---

## 15. YAML band map (machine-readable)

```yaml
band_map:
  band: en-early-a2
  direction: en_for_multilingual
  cefr: A2.1
  ratios: {structured: 0.46, guided: 0.36, open: 0.15, assessment: 0.03}
  totals: {lessons: 55, new_vocab: 450, est_minutes: 1700, est_hours: 28.3}
  units:
    - id: U7
      name: Getting Around
      theme: transport_directions
      can_do_primary: "CEFR A2: get travel information, use public transport, ask/give directions, buy tickets [requires validation]"
      new_vocab: 147
      grammar: [G1, G2, G3, G4, G5]
      pron: [P1, P2, P3, P9]
      missions: [MISSION-U7-L18]
      lessons:
        - {id: U7-L01, type: vocab,    obj: "name 16 transport modes/places", nv: 16, prereqs: []}
        - {id: U7-L02, type: vocab,    obj: "ticket-buying lexis + purchase chunk", nv: 15, prereqs: []}
        - {id: U7-L03, type: grammar,  obj: "ask/answer routes with by+transport", nv: 8,  grammar: [G1, G3], prereqs: [U7-L01]}
        - {id: U7-L04, type: listening, obj: "catch platform/time/delay in announcements", nv: 10, prereqs: []}
        - {id: U7-L05, type: pron,     obj: "compound stress; final clusters", nv: 4, pron: [P1, P2], prereqs: []}
        - {id: U7-L06, type: grammar,  obj: "give/follow directions (imperatives+preps)", nv: 14, grammar: [G2], prereqs: [U7-L01]}
        - {id: U7-L07, type: vocab,    obj: "landmarks and city places", nv: 16, prereqs: []}
        - {id: U7-L08, type: speaking, obj: "guided directions roleplay", nv: 6, interaction: guided_spoken, prereqs: [U7-L06, U7-L07]}
        - {id: U7-L09, type: listening, obj: "map trace from spoken directions; linking", nv: 6, pron: [P9], prereqs: [U7-L06]}
        - {id: U7-L10, type: grammar,  obj: "duration with it-takes", nv: 8, grammar: [G4], prereqs: []}
        - {id: U7-L11, type: reading,  obj: "timetables and transit apps", nv: 12, prereqs: []}
        - {id: U7-L12, type: ai_written, obj: "running-late apology text", nv: 8, interaction: ai_written, prereqs: [U7-L03]}
        - {id: U7-L13, type: grammar,  obj: "have to for rules", nv: 8, grammar: [G5], prereqs: []}
        - {id: U7-L14, type: pron,     obj: "gonna/hafta receptive; /ɪ-iː/", nv: 4, pron: [P3], prereqs: []}
        - {id: U7-L15, type: ai_spoken, obj: "ticket info-gap purchase", nv: 6, interaction: ai_spoken, prereqs: [U7-L02, U7-L03, U7-L10]}
        - {id: U7-L16, type: writing,  obj: "travel-options request message", nv: 6, prereqs: []}
        - {id: U7-L17, type: review,   obj: "cumulative U5-U7", nv: 0, prereqs: [U7-L01..U7-L16]}
        - {id: U7-L18, type: mission,  obj: "plan a trip across town", nv: 0, interaction: mission, prereqs: [U7-L15, U7-L17]}
    - id: U8
      name: Health & Needs
      theme: health_pharmacy_appointments
      can_do_primary: "CEFR A2: indicate nature of a problem to a health professional [requires validation]"
      new_vocab: 153
      grammar: [G6, G7, G8, G9]
      pron: [P4, P5, P6]
      missions: [MISSION-U8-L19]
      lessons:
        - {id: U8-L01, type: vocab,    obj: "body parts + my-X-hurts", nv: 18, prereqs: [U7-L15-attempted]}
        - {id: U8-L02, type: vocab,    obj: "symptoms with have-a-X", nv: 18, prereqs: []}
        - {id: U8-L03, type: grammar,  obj: "feel+adj / have+noun", nv: 6, grammar: [G6], prereqs: [U8-L01, U8-L02]}
        - {id: U8-L04, type: pron,     obj: "theta/eth minimal pairs", nv: 4, pron: [P4], prereqs: []}
        - {id: U8-L05, type: listening, obj: "pharmacy recommendation + dosage", nv: 12, prereqs: []}
        - {id: U8-L06, type: grammar,  obj: "should/shouldn't advice", nv: 6, grammar: [G7], prereqs: [U8-L03]}
        - {id: U8-L07, type: speaking, obj: "guided advice swap", nv: 5, interaction: guided_spoken, prereqs: [U8-L06]}
        - {id: U8-L08, type: vocab,    obj: "pharmacy/medicine lexis", nv: 16, prereqs: []}
        - {id: U8-L09, type: ai_written, obj: "register-aware absence message", nv: 7, interaction: ai_written, prereqs: [U8-L03]}
        - {id: U8-L10, type: grammar,  obj: "need to necessity", nv: 5, grammar: [G8], prereqs: []}
        - {id: U8-L11, type: reading,  obj: "labels and clinic notices", nv: 12, prereqs: []}
        - {id: U8-L12, type: listening, obj: "phone booking; wanna/gonna", nv: 10, pron: [P8-receptive], prereqs: []}
        - {id: U8-L13, type: ai_spoken, obj: "clinic call + reschedule surprise", nv: 6, interaction: ai_spoken, prereqs: [U8-L10, U8-L12]}
        - {id: U8-L14, type: vocab,    obj: "emergencies and help chunks", nv: 14, prereqs: []}
        - {id: U8-L15, type: grammar,  obj: "why/because follow-ups", nv: 4, grammar: [G9], prereqs: []}
        - {id: U8-L16, type: pron,     obj: "sentence stress; ae-vs-uh", nv: 4, pron: [P5, P6], prereqs: []}
        - {id: U8-L17, type: writing,  obj: "intake form + pharmacist question", nv: 6, prereqs: [U8-L09]}
        - {id: U8-L18, type: review,   obj: "cumulative U6-U8", nv: 0, prereqs: [U8-L01..U8-L17]}
        - {id: U8-L19, type: mission,  obj: "pharmacy visit end-to-end", nv: 0, interaction: mission, prereqs: [U8-L05, U8-L08, U8-L18]}
  checkpoint:
    id: CP2
    after: U8
    minutes: 40
    parts: [adaptive_quiz, listening, written_task, spoken_roleplay, micro_conversation_unscored]
    outcomes: [passed, passed_with_review, remediation]
    gates_to: U9
  units_after_checkpoint:
    - id: U9
      name: Past Experiences
      theme: past_recounts_social
      can_do_primary: "CEFR A2: can describe past activities and personal experiences"
      new_vocab: 150
      grammar: [G10, G11, G12, G13, G14]
      pron: [P7, P8]
      missions: [MISSION-U9-L18]
      lessons:
        - {id: U9-L01, type: grammar,  obj: "was/were states and places", nv: 5, grammar: [G10], prereqs: [CP2-passed]}
        - {id: U9-L02, type: vocab,    obj: "past time expressions", nv: 14, prereqs: []}
        - {id: U9-L03, type: listening, obj: "weekend small-talk comprehension", nv: 10, prereqs: []}
        - {id: U9-L04, type: grammar,  obj: "regular -ed past", nv: 12, grammar: [G11], prereqs: [U9-L01, U9-L02]}
        - {id: U9-L05, type: pron,     obj: "-ed as /t d id/", nv: 4, pron: [P7], prereqs: [U9-L04]}
        - {id: U9-L06, type: speaking, obj: "guided yesterday Q&A + follow-up", nv: 5, interaction: guided_spoken, prereqs: [U9-L04]}
        - {id: U9-L07, type: grammar,  obj: "irregular past set 1", nv: 12, grammar: [G12], prereqs: [U9-L04]}
        - {id: U9-L08, type: reading,  obj: "short recount; notice sequencers", nv: 14, prereqs: []}
        - {id: U9-L09, type: grammar,  obj: "didn't / Did-you questions", nv: 6, grammar: [G13], prereqs: [U9-L04, U9-L07]}
        - {id: U9-L10, type: pron,     obj: "didja/weak-was reception", nv: 3, pron: [P8], prereqs: [U9-L09]}
        - {id: U9-L11, type: ai_written, obj: "weekend chat reply, 5 turns", nv: 9, interaction: ai_written, prereqs: [U9-L09]}
        - {id: U9-L12, type: vocab,    obj: "activities and life events", nv: 16, prereqs: []}
        - {id: U9-L13, type: listening, obj: "order events with sequencers", nv: 8, prereqs: []}
        - {id: U9-L14, type: grammar,  obj: "irregular set 2 + sequencing", nv: 12, grammar: [G12, G14], prereqs: [U9-L07]}
        - {id: U9-L15, type: speaking, obj: "picture-story retell", nv: 5, interaction: guided_spoken, prereqs: [U9-L13, U9-L14]}
        - {id: U9-L16, type: writing,  obj: "5-6 sentence recount", nv: 8, prereqs: [U9-L14]}
        - {id: U9-L17, type: ai_spoken, obj: "memorable-day conversation", nv: 7, interaction: ai_spoken, prereqs: [U9-L09, U9-L15]}
        - {id: U9-L18, type: review_mission, obj: "cumulative review + interview-and-report mission", nv: 0, interaction: mission, prereqs: [U9-L16, U9-L17]}
  remediation_pool: [R7a, R7b, R8a, R8b, R8c, RP1]
```

---

## 16. Schema extensions required by this band `[proposed — do not modify existing DB; additive only]`

1. **`vocabulary_translations`** `(vocabulary_id, l1_code, translation, usage_note)` — replaces reliance on single-column `translation_l1` (owner-acknowledged limitation); existing column kept as English-gloss fallback.
2. **`l1_contrast_notes`** — schema in §5.1; FK to lesson/grammar-point/pron-target; gates `draft→gated` for `l1_contrast: high` items on the 10 priority L1s.
3. **`grammar_points`** `(id, name, cefr_level, communicative_need, ordered_index)` + lesson junction — G1–G14 need identity beyond lesson prose for mastery tracking and remediation targeting.
4. **`pron_targets`** `(id, feature, minimal_pairs jsonb, l1_priority jsonb)` + `vocab_card_state` card type `pron_pair`. Minimal-pair exercises reuse existing `listening_mc` type — no new exercise type required [proposed].
5. **`ai_interaction_specs`** — one row per contract (§13b/13c fields), versioned; `micro` profile flag for end-of-lesson micro-exchanges.
6. **`missions`** — §13d fields incl. rubric jsonb and difficulty tiers.
7. **`checkpoints`** + **`checkpoint_attempts`** `(part scores jsonb, evidence_refs, outcome)` — longitudinal evidence chain for graduation.
8. **`saved_errors`** `(user_id, category, source_ref, example, l1_mechanism_ref, resolved_at)` — powers the error-driven review loop (§11.5).
9. `lessons.est_minutes`, `lessons.interaction_profile`, `exercises.review_source_unit` (interleaving audit) — small additive columns.

**Open questions for the owner / adjacent band planners**
- Confirm U6 exit vocab (~950) and grammar inventory [assumption] with the late-A1 planner; G1 assumes question forms are review, not new.
- Confirm CEFR Companion Volume exact descriptor wordings flagged [requires validation] before inserting into `can_do_statements`.
- Decide the global vocab landing zone (recommendation: ~1,850–1,950 with chunk-depth priority, §4).
- CP2 Part-D exemption via passed missions (§13d `mastery_effects`) — accept or reject globally.
- Region-variant pass for US-centric pragmatics (911, pharmacy scope) for non-US deployments [requires validation].


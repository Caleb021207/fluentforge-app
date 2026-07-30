# wip-20a — SLA / Learning-Science Review of the Course Maps (Independent)

**Reviewer role:** Second-Language Acquisition & learning-science reviewer. I review; I do not design.
**Scope reviewed:** `07-esl-curriculum-map.md` (EN map of record), `08-spanish-curriculum-map.md` (ES map of record), deep samples of all eight band files (`wip-curriculum-{en,es}-{early,late}-{a1,a2}.md`: unit outcomes, grammar spines, vocabulary ledgers, sample lessons with full exercise tables, interaction/mission contracts, gate designs), the owner's progressive-release ratios and correction-policy stack (quoted in both maps' interaction contracts, e.g. 07 §8.2c, 08 §9.3), and the platform gamification disposition (`03-feature-decision-matrix.md`).
**Labels:** [documented] = established literature, cited by name/year · [observed] = read in the plan docs/repo · [estimated] · [proposed] = my recommendation · [assumption] · [requires validation].
**Severity scale:** **S1** = fix before any authoring begins (pedagogically unsound as written) · **S2** = fix in the next map revision (materially weakens outcomes or claims) · **S3** = refinement, pilot-tunable · **S4** = note/nice-to-have.

**Bottom line first:** both maps are far above the consumer-app baseline — genuinely communicative, TBLT-shaped, evidence-gated. Neither is unsound. The EN map has two S1 defects (a listening-coverage floor that contradicts comprehension research by ~25 percentage points, and an hours-to-A2 claim below established guided-learning-hour conventions with no L1-distance differentiation). The ES map has no S1 defects. Full verdicts and prioritized revision lists in §4.

---

## 1. Evaluation against established SLA findings

### 1.1 Comprehensible input ↔ pushed output balance

**Literature [documented]:** Krashen (1982, 1985) — acquisition driven by comprehensible input at i+1; Swain (1985, 1995) — pushed output forces syntactic processing and noticing of gaps; Nation (2007) — a balanced course splits ~4 ways: meaning-focused input, meaning-focused output, language-focused learning, fluency development.

**Finding [observed]:** Output is well provisioned: EN guided speaking 19.0 h + open conversation 13.0 h + written interaction 5.3 h of a 117 h course (07 §7.2), with per-lesson micro-exchanges from U7 (07 §2 R11) — a distributed pushed-output density most products never reach. Input is the weaker half: EN independent listening is 7.1 h (07 §7.2), reading is ~10 lessons of 220 (07 §10.1), and there is **no extensive reading/listening strand at all** in either course. Against Nation's four strands, "fluency development" (high-success re-processing of *easy* material — re-listens at i−1, 4/3/2-style retells, speed reading of known text) is essentially absent; the closest artifacts are mission retry variants.

**Assessment:** output-forward design is defensible for a conversation-first product, but incidental vocabulary consolidation and listening automatization both depend on input volume (Webb 2007; Nation 2006). Severity S3, both courses — add a small fluency/extensive-input strand (see §4).

### 1.2 Interaction and negotiation of meaning

**Literature [documented]:** Long (1996) Interaction Hypothesis; Pica (1994) — negotiation of meaning drives comprehension and form-focus; Canale & Swain (1980) — strategic competence is a competence, not a deficit.

**Finding [observed]:** This is the maps' strongest suit. Planted breakdowns in nearly every roleplay (e.g., "exactly one planned typo-garbled reply" in EN U2-L17, A1E §13b; "one planned too-fast sentence in scene 3" in ES U3-M01, ES-A1E §13d), repair phrases taught in U1 and *scored positively* (A1E §9 "repair-first design"), repair as a **non-waivable graduation dimension** (07 §11.2 GR-3; 08 §8.4 interaction gate). Follow-up questions required in both directions. This operationalizes negotiation research better than any commercial course I know of. **No revision needed; protect this in later cost-cutting.**

### 1.3 Explicit vs implicit grammar instruction for adults (and adolescents)

**Literature [documented]:** Norris & Ortega (2000) and the Goo et al. (2015) replication — explicit instruction reliably outperforms implicit for post-critical-period learners; DeKeyser (2007, 2015) skill-acquisition theory — declarative → proceduralization through practice; Spada & Tomita (2010) — explicit instruction benefits both simple and complex forms.

**Finding [observed]:** The lesson shape (L1/EN `intro_md` rule explanation + contrastive note → controlled exercises → communicative use in the same lesson) is exactly the explicit-first, proceduralize-fast pattern the literature supports for adults. The form-meaning listening items (EN U9-L04 E5/E6: decide past vs present *from the audio /t/ alone*, EA2 §13a) are textbook Processing Instruction referential activities (VanPatten 2004) — excellent. District deployments (14-district-readiness) mean adolescent users too; explicit instruction findings hold for adolescents, but the *content contexts* skew adult (job interviews, workplace email, pharmacy) — S4 note in §4.

### 1.4 Frequency-based vocabulary selection and the ~2,000-item A2 target

**Literature [documented]:** Nation (2006) — 2,000 word families ≈ 90% coverage of casual conversation; van Zeeland & Schmitt (2013) — 2,000–3,000 families needed for 95% *listening* coverage; Milton & Alexiou (2009) — measured A2 learner lexicons ≈ 1,500–2,500 lemmas; Erman & Warren (2000), Wray (2002), N. Ellis (2012) — formulaic sequences carry ~half of natural discourse; Laufer (1989), Hu & Nation (2000) — 95–98% coverage thresholds for comprehension.

**Finding:** The 1,800–2,200 target is **defensible in magnitude**, and the maps' unanimous "chunk-limited, not lemma-limited" argument (07 §4.1; 08 §4.1) is well supported for *production* at A2. Two problems:

1. **[observed] The two directions count differently and are not comparable.** EN counts recognition-tier items *inside* its 1,800 headline (~15%, 07 §2 R17), so EN's productive inventory ≈ 1,530 items with ~1,197 single lemmas (07 §4.1). ES counts 1,825 core *plus* a separate 210–330 receptive pool (08 §4.1). EN is therefore the effectively smaller course while both claim the same owner target met. S3 — reconcile the counting policy across directions before the owner signs off headline numbers (07 §12 open question 4).
2. **[documented] Lemma breadth bounds listening, not chunks.** ~1,200 productive single lemmas (EN) is at the very bottom of the Milton & Alexiou A2 band; the U10–U12 accent-ramp/degraded-audio listening will strain it. Mitigation is cheap: an explicit receptive-lemma pool for passage authoring (the ES mechanism, 08 §4.1) — S3.

Frequency sourcing (NGSL for EN [assumption, 07 §4.1]; Davies LatAm-weighted for ES [requires validation, 08 §4.1]) is the right basis; the "survival override in both directions" (admit low-frequency scenario-critical, defer high-frequency without an A2 job) matches Nation's cost-benefit logic.

### 1.5 Spaced retrieval and the testing effect

**Literature [documented]:** Roediger & Karpicke (2006), Karpicke & Roediger (2008) — retrieval practice beats restudy; Cepeda et al. (2006) — expanding spacing; Nation (2001) — ~8–10 encounters for durable knowledge; Settles & Meeder (2016) — half-life regression validates FSRS-style scheduling at scale.

**Finding [observed]:** FSRS as the backbone, error-derived review items regenerated within 24–48 h, review waves (unit → band → full-course → Graduation Gauntlet), and error-bank clearance requiring **2 consecutive correct productions in interaction, not drills** (07 §8.1 item 8) — that last rule is transfer-appropriate processing done right and should be called out to the owner as a differentiator.

**Defect [estimated]:** the review *time budgets* don't survive arithmetic. EN allocates 880 min for 1,800 items ≈ **29 s of lifetime scheduled review per item** (07 §7.2) — roughly 1–2 retrievals — against Nation's 8–10-encounter finding; in-lesson N−2 interleaving (≥20% of slots, 07 §4.2) supplies some encounters, but the standalone budget is likely 50–100% low. ES budgets 1,270 min for 1,825 items (08 §7) — 44% more per item than EN for the same design. The two teams estimated the same mechanism differently; at least one is wrong. Also unresolved: the new-card cap (8–12/day, 07 §2 R10) versus the teaching rate (~15 items per active hour) — when the cap throttles, what happens to lesson unlocking? Undefined [observed]. S3, both — reconcile budgets, define cap-collision behavior, and hand both to the 05 memory-model workstream as requirements.

### 1.6 Recognition-vs-production asymmetry

**Literature [documented]:** Laufer & Goldstein (2004) — recognition and recall are distinct strengths, recall harder; Webb (2005) — receptive learning transfers incompletely to production.

**Finding [observed]:** Directly handled: card direction flips receptive→productive on second exposure (07 §4.2), productive/recognition split reported separately (R17), ES requires ≥2 receptive + ≥1 productive exercise in the intro lesson (08 §10.3 V1), graduation vocab probes are 60% productive (08 §8.4 G-E1). Sound. One gap: the EN lint suite has **no per-lesson productive-share gate** — the sampled lessons are well balanced (see §2.1) but nothing enforces it. S3.

### 1.7 Error correction: recasts vs prompts, timing

**Literature [documented]:** Lyster & Ranta (1997) — recasts get the lowest uptake in classrooms; Lyster & Saito (2010) meta-analysis — prompts (elicitation, clarification, metalinguistic clues) outperform recasts for durable gains in instructional settings; Mackey & Goo (2007) — recasts do work well in dyadic/lab-like interaction (which an AI tutor resembles); Li (2010); Quinn & Nakata (2017) — immediate CF suits accuracy work, delayed CF suits fluency work.

**Finding [observed]:** The owner priority stack (understanding-blocking → current target → repeated high-value → intelligibility pron; concise in-flight recasts, fuller feedback after; never overcorrect) is a research-defensible policy, and the timing split is *exactly* right: teaching recasts in guided work, **clarification-only during missions with full debrief after** (A2L §13d; ES-A1E §13d). Written-mode recasts are bolded (textual enhancement) and `recast_uptake_rate` is a tracked analytic (07 §8.2c) — the single best-chosen telemetry signal in the plan.

**Weakness:** the repertoire is ~100% recast/echo. Per Lyster & Saito, when the same error category recurs, an elicitation prompt ("¿Tu hermana ES...?" with a pause, rather than supplying the form) yields more uptake, especially in structured/guided tiers where the interlocutor is overtly a teacher-figure. The dyadic-setting caveat (Mackey & Goo) means this is S3, not S2: add a prompt-after-second-recast escalation per error category, switched off in mission/fluency tiers, and let `recast_uptake_rate` arbitrate per learner.

### 1.8 Pronunciation instruction efficacy

**Literature [documented]:** Levis (2005, 2018) — intelligibility principle over nativeness; Munro & Derwing (1995) — accentedness and comprehensibility are partly independent; Lee, Jang & Plonsky (2015) — pronunciation instruction has medium-large effects, strongest with feedback; Thomson & Derwing (2015); Logan, Lively & Pisoni (1991) — high-variability perceptual training; Flege's SLM — perception precedes production; Brown (1988), Catford — functional load; Jenkins (2000) — Lingua Franca Core: /θ/ð/ substitutions rarely damage international intelligibility.

**Finding [observed]:** Policy is explicitly intelligibility-first, perception-before-production, discrimination-gated (≥7/10) before production scoring, failed production re-enters as perception (07 §6) — all research-aligned. ASR scoring "only the drilled feature, never global accent," thresholds tuned against accented (not native) speech [requires validation, correctly flagged]. Suprasegmentals (word stress, sentence stress, contrastive stress as *the repair tool*) are prioritized — matches Field (2005) on stress-driven intelligibility.

**Internal inconsistency [observed/documented]:** EN gives /θ–ð/ a Sound Lab plus two maintenance slots and calls it a top priority "for nearly all 10 L1s" (07 §6 pron.theta_eth). By the map's *own* intelligibility criterion and the functional-load/LFC literature, th-substitution is low-payoff; ES applies the correct logic to its own equivalent (full trill "never gated," PR-06, 08 §6). S3 — demote pron.theta_eth to feedback-only, reallocate lab minutes to vowel contrasts/final clusters, which the same table correctly identifies as transactional-failure and grammar-deleting features.

### 1.9 Task-based language teaching alignment of the mission design

**Literature [documented]:** Ellis (2003) criterial task features — primacy of meaning, a gap, learners' own resources, a non-linguistic outcome; Long (2015) — needs-based target tasks; Skehan (1998) — pre-task planning; Bygate (2001) — task repetition improves fluency/complexity.

**Finding [observed]:** Missions meet all four Ellis criteria: real outcomes (appointment rescheduled with correct read-back; grid digit-accurate), planning phases (60-s prep cards), no in-flight teaching, retry as **new variants never verbatim** (07 §8.2d) — which converts Bygate's task-repetition benefit into design. The transactional skeleton spiral (request→clarify→confirm across U4→U12, 08 §3.3) is a target-task sequence Long would endorse. Guided-tier interactions mix outcome and language-display criteria ("≥2 target-grammar productions", A2L §13b) — that is task-*supported* teaching, appropriate at that tier, and mission-tier criteria stay outcome-based. **Verdict: genuinely TBLT, not TBLT-flavored. No revision.**

### 1.10 Cognitive load and low-literacy beginners; L1 scaffolding gradients

**Literature [documented]:** Sweller (1988, 2011) — cognitive load theory; split-attention and redundancy effects; Hall & Cook (2012), Butzkamm & Caldwell (2009) — judicious L1 use aids beginners, should fade as proficiency grows; SLIFE literature (DeCapua & Marshall 2011) — print-dependent tasks fail students with limited/interrupted formal education.

**Finding [observed]:** L1-rendered instructions, ≤120-word intros, sentence-length caps, one-fact-per-turn AI behavior, audio on every card — load management is thought through. Two gaps:
1. **Low-literacy path (EN):** priority L1s include so and ht, populations with meaningful SLIFE rates; yet cloze/dictation/ordering are print-dependent from U1, and the only literacy accommodation is a Latin-script *test-out* (U01-L02) — an accelerator for the literate, nothing for the non-literate. S3/S4 depending on the target population [requires validation with district demand]: specify an audio-first exercise variant track.
2. **No L1 fade:** instruction stays 100% L1 through U12 (07 §9.4), while the platform already owns a CEFR-graded L1-scaffolding fade engine (60%→2%) in the chat tutor [observed: 03-feature-decision-matrix.md:16]. By U10–U12 the learner can read simple English task instructions, and that is free comprehensible input. S4 — document a late-course instructional-language fade with L1 fallback.

### 1.11 Motivation: streaks/XP vs self-determination theory

**Literature [documented]:** Deci & Ryan (1985), Ryan & Deci (2000) — autonomy/competence/relatedness; Noels et al. (2000) — SDT in L2; Hanus & Fox (2015) — leaderboards can depress intrinsic motivation and performance; Mekler et al. (2017) — points/levels raise quantity not quality; Dörnyei (2009) — ideal-L2-self vision as motor.

**Finding [observed]:** The curriculum's motivational spine is SDT-gold: a **finite course with a graduation** (competence + goal gradient; the anti-endless-tree), can-do evidence reports instead of scores (08 §8), never claiming proficiency from XP/streaks (owner rule, enforced in every gate). But the platform layer *keeps* XP, streaks, and a leaderboard (consolidate disposition, 03-feature-decision-matrix.md:23) with no design principles stated. Loss-framed streaks and always-on leaderboards are the two mechanics with the worst SDT evidence. S3, platform-level: streaks reframed as practice-consistency with repair (no punitive loss), leaderboard opt-in/cohort-relative, and the can-do evidence view made the primary progress surface. See also §3.

---

## 2. Map audit

### 2.1 Exercise mixes — passive-recognition-heavy?

**No [observed], with one enforcement gap.** Sampled lessons: EN U1-L05 = 4R/5P with ASR and a 4-turn dialogue (A1E §13a); EN U9-L04 = 6R/6P + written micro-interaction (EA2 §13a); ES U1-L06 = 12 exercises ending in ASR + controlled dialogue (ES-A1E §13a); ES es-10.6 = 4R/6P ending in branching dialogue + ASR decline task (ES-A2L §13a). Every sampled lesson ends in production/interaction; distractor rationales are error-diagnostic rather than filler. The balance is exemplary in samples but **unenforced in the lint suites** (07 §9.3, 08 §10.3 check counts and rationales, not R/P share). Revision: add a lint (≥40% productive slots per non-listening lesson; every non-review lesson ends with a productive or interactive item).

### 2.2 Grammar sequencing

**Mostly sound; three specific findings.**

- **EN past-tense runway is thin (S2).** The entire past system enters at U9 — ~65% through the course — and CP2 (after U8) certifies a "transactional toolkit" containing zero past reference (07 §3.1, §11.1). The U8 health unit then has no way to state onset ("it started yesterday," "I fell") — a conspicuous gap in symptom talk; ES covered the same need with `¿Desde cuándo?`/`desde hace` at es-8.13 (GS-56). Acquisition of -ed morphology is slow and late (Goldschneider & DeKeyser 2001 [documented]); three units of productive runway before a graduation gate on **cross-tense switching** — which the map itself calls the "strongest predictor of graduation success [assumption]" (07 §5 gram.cross_tense) — is the map's riskiest bet. Fix inside the map's own idiom: a formulaic past chunk pack (*was/were, it started __, I fell, I took*) in U8 + receptive past exposure planted in U7–U8 listening, exactly parallel to the U6 present-continuous formulaic preview precedent (07 §5).
- **Gating on late-acquired morphemes (S2).** The Band Gate requires present-simple sub-score ≥70% including 3sg −s (A1E §12 criterion 2, wip-curriculum-en-early-a1.md:425). Morpheme-order research (Krashen 1977; Goldschneider & DeKeyser 2001 [documented]) and processability/teachability (Pienemann 1989, 1998) put 3sg −s and do-support inversion among the *latest*-acquired features regardless of teaching order; an accuracy gate on them at ~20 h will spuriously hold back communicatively on-track learners (and interacts badly with the ±0.05 pilot-tunable threshold, 07 §2 R9). Fix: gate the Band Gate on *be* + communicative criteria; track 3sg −s and do-support as monitored trend lines, not pass bars.
- **ES sequencing is strong (no S1/S2).** Preterite before imperfect matches emergence orders [documented: VanPatten & Benati]; clitics capped at formulaic (R4c), subjunctive/productive commands excluded — honest A2 scoping; ser/estar split trait-vs-state at U3 with spiral at U8 is standard best practice. One cosmetic catch (S4): es-2.6 teaches stress literacy via *hablo vs habló* (08:770) seven units before the preterite exists — the contrast is semantically opaque at U2; use *papá/papa*-type pairs there and keep *hablo/habló* for es-9.3 where it becomes morphology.
- **Cross-band reconciliation quality [observed]:** the R7 (present-continuous ownership hole) and R4a–R4e catches show the merge process actually worked; the fact that three of four ES bands each *assumed* someone else taught `ir a + inf` productively (08 §2 R4a) is precisely the failure mode the maps' lint suites are designed to prevent going forward. Credit where due.

### 2.3 Lesson time estimates

**Systematically optimistic at the exercise grain [estimated].** Authored timings assume 40–60 s for typed cloze/translation/dictation at A1 (A1E §13a; ES-A1E §13a). For non-Latin-script-L1 typists on an English keyboard (ar, zh, ru, uk, fa — half the priority list), 1.5–2× is the realistic multiplier; A2L's own sample lesson (19 min, wip-curriculum-en-late-a2.md:479) already exceeds the map's 10–16-min envelope (07 §8.2a), as does es-10.6 (16–18 + 2 warm-up vs the 10–18 envelope, 08 §9.2/V7). Mitigation exists — pilot promotion requires actual timing within ±25% of estimate (07 §9.2.6) — but a systematic bias will fail that gate *everywhere at once*. S3: add per-script timing multipliers to `est_minutes` and reconcile the two envelope violations now.

**Course-total hours: see §4 EN item 2 (S1)** — 117 h median to strong A2 sits well below guided-learning-hour conventions (~180–200 GLH to A2; Cambridge English/ALTE guidance [documented]). One-to-one adaptive practice plausibly beats classroom GLH (Bloom 1984; VanLehn 2011 [documented]) — but a ~1.6× efficiency multiplier is an [assumption] being silently priced into the owner's headline, and it is uniform across L1s when L1 distance is the dominant rate variable (FSI category data [documented]). ES at 122 h for a Category-I language with massive cognate transfer is defensible-optimistic (S2, widen the range); EN at 117 h for zh/ar/vi/so-L1 learners is not defensible as a median (S1 as a *claim*, even though the docs label it [estimated] — it drives the 240-session scope and the owner's expectations).

### 2.4 Vocabulary recycling: guaranteed vs asserted

**Genuinely structural, contingent on unbuilt tooling [observed].** EN: coverage contract (≥1 productive use in origin + ≥2 later placements, orphans are build failures), N−2 interleaving ≥20% audited via `review_source_unit`, interaction `assumed_vocabulary ⊆ taught set` lint (07 §4.2). ES goes further: `vocab_exposure_matrix` requiring ≥6 of 8 contexts planned per item, listening + spaced review mandatory, gate at unit level (08 §4.3). Both worked examples check out end-to-end. Risks: (1) the lints are all [proposed] CI that doesn't exist — recycling degrades to "asserted" if authoring starts before the lint suite lands (dependency, §4); (2) "≥2 later placements" is a floor, not the 8–10 encounters durable learning needs — FSRS is carrying the rest of the load, which loops back to the under-budgeted review time (§1.5).

### 2.5 Listening authenticity

**Ramp design is excellent; one number is wrong (S1, EN).**

- The ramp itself — speeds by wpm, reductions receptive-first from U2, ≥3 accent profiles/unit from U7, non-native intelligible voices ~30% (Jenkins 2000 ELF exposure [documented]), phone-band/degraded audio in U10–12, listen-and-DO tasks, transcripts only after two attempts — is aligned with Field (2008) decoding-first listening pedagogy and is better than most published coursebooks [observed: 07 §7.3; 08 §2 R13].
- **The defect:** EN sets the passage known-vocabulary floor at **≥70%** in three places (07:527, 07:699, 07 §9.3 gate 6). The comprehension-coverage literature is unambiguous: 95% coverage is the working minimum for adequate listening comprehension and ~98% for comfortable reading (Hu & Nation 2000; van Zeeland & Schmitt 2013; Laufer 1989 [documented]). At 70% coverage — nearly one unknown word in three — passages are incomprehensible noise, and the "forces planted recycling" rationale collapses. The ES map has the correct numbers: ≥95% (U1–U9) → ≥93% → ≥90% with planted unknowns (08 §10.1). This is almost certainly a drafting error in EN (perhaps intending "≥70% of tokens must be *review* items"), but as written it is the single most consequential wrong number in either map because a lint will *enforce* it. Fix: adopt the ES floor schedule verbatim, plus an explicit planted-unknown budget.
- TTS-generated accented/degraded audio remains [requires validation] against the voice workstream (11-voice-provider-study Pattern D) — correctly flagged in both maps.

### 2.6 Writing progression realism

**Realistic and well-scoped [observed].** Messages-with-a-real-recipient only, no essays (07 §7.4; 08 §8.4 G-E5) — matches CEFR A2 written-interaction descriptors and task authenticity. The mechanics thread (script transfer, apostrophes, register from U8, tilde ramp R10 in ES with meaning-bearing accents hardening exactly when they become morphology at es-9.3) is unusually well sequenced. The ES graduation ask (80–120 words in ~10 min, no aids) is at the tight end of A2 composition rates [estimated] — pilot-check, S4.

### 2.7 Checkpoint validity — do the gates measure what graduation claims?

- **Construct coverage [observed]:** the EN "communicative definition of done" verification map (07 §11.2) traces every claimed capability to ≥1 instrument — good practice. CP2's *unscored past-tense micro-conversation baseline* before U9 teaches it (07 §3.2) is a genuinely clever pretest — keep it.
- **Gap 1 — reading is claimed-adjacent but never measured (S3, both).** Graduation instruments cover conversation, listening, writing, vocab, grammar (07 §11.2; 08 §8.4). Certificates say "CEFR-linked performance evidence" — CEFR A2 includes reading descriptors the course neither teaches beyond survival sight-reading nor tests. Scope the certificate wording to *spoken interaction, listening, and written interaction* (which also aligns with the claims-hygiene direction of 03 row 11 and wip-03a) or add a small reading instrument.
- **Gap 2 — single-task speaking reliability [documented].** A 15-min conversation is one task; generalizability studies of speaking assessment (In'nami & Koizumi 2016) show single-task scores generalize poorly. The maps already mitigate via the mission evidence chain and GRAD-01 mock; make that explicit in the pass logic (mission evidence as corroborating prior, not just eligibility).
- **Gap 3 — the AI rater is the whole ballgame (S2, both).** Every gate outcome flows through LLM rubric scoring of accented A2 speech; both maps flag calibration [requires validation] but treat it as one open question among many. It is the load-bearing wall: without a human-rater calibration study (suggest n≥100 sessions, target rubric-level agreement κ≥0.7, plus drift monitoring and borderline human sampling) no certificate should ship. Elevate to a blocking dependency of both curricula, not a footnote.
- **Minor:** Band Gate criterion 1 counts FSRS *stability* (scheduler state) as "evidence" (A1E §12) — acceptable as a prerequisite, but don't label memory-model state as performance evidence; the owner's own rule (07 §1) draws that line.
- **Retake hygiene [observed]:** strand-level retakes, banked passes, fresh variants, max-2 remediation cycles then human escalation, "tech failure ≠ learner failure" (08 §9.3) — all sound; no infinite-loop failure modes found.

---

## 3. Duolingo-imitation scan

The curriculum layer largely **passes**: finite course with graduation (the anti-streak-treadmill), TBLT missions with real outcomes, performance-only proficiency claims, L1-contrastive teaching, negotiated repair — none of this is Duolingo. Residuals to flag:

1. **XP/streaks/leaderboard retained at platform level** (03-feature-decision-matrix.md:23) with no SDT-informed redesign principles — the one place the product still copies the Duolingo engagement stack rather than deriving motivation from the curriculum's own competence evidence. (§1.11; revision list.)
2. **Controlled-tier item formats** (flashcard/matching/cloze/translation) are Duolingo-shaped, but embedded in lessons that terminate in interaction and gated by communicative criteria — this is controlled practice in a skill-acquisition arc, not the product's substance. Acceptable as-is.
3. **"Graduation Gauntlet"** (U12-L19) — gamified frame, performance-based content; harmless.
4. **Placement quiz labeled "course starting point," never proficiency** (03 row 9) — correct anti-imitation move; keep.

---

## 4. Verdicts and prioritized revision lists

### 4.1 EN (ESL, 07 + four EN band files): **sound-with-revisions**

The architecture (progressive release, spines, contracts, gates) is coherent and research-aligned; two headline numbers and two gating choices need repair before authoring.

| # | What | Why | Where | Severity |
|---|------|-----|-------|----------|
| 1 | Raise listening passage known-vocab floor from ≥70% to the ES schedule (≥95% U1–U9 → ≥93% → ≥90% + planted-unknown budget) | 95–98% coverage thresholds (Hu & Nation 2000; van Zeeland & Schmitt 2013); as written, the lint enforces incomprehensible input | 07 §4.2 row 3, §7.3 standing rules, §9.3 gate 6 | **S1** |
| 2 | Re-scope the hours claim: widen envelope, publish p50/p75/p90 **by L1-distance tier**, and gate the 117 h median on pilot telemetry before it reaches any owner-facing scope/costing | ~180–200 GLH conventions to A2 [documented]; 1:1-efficiency multiplier is an unpriced [assumption]; L1 distance dominates rate | 07 §1, §7.2 | **S1** |
| 3 | Add formulaic past preview to U8 (*was/were, it started __, I fell*) + receptive past planted in U7–U8 listening; keep U9 as productive owner | 3-unit runway for the whole past system before a cross-tense graduation gate contradicts morphological-acquisition timelines (Goldschneider & DeKeyser 2001); U8 symptom talk needs onset language (ES already has GS-56) | 07 §3.1 U8–U9, §5; EA2 band §1 | **S2** |
| 4 | Remove 3sg −s / do-support accuracy sub-bars from Band Gate; monitor as trends | Late-acquired morphemes (morpheme-order + processability research); spurious holds | A1E §12 criterion 2 | **S2** |
| 5 | Elevate AI-rater calibration to a blocking dependency (human-rater study, agreement + drift targets) for all four gates | All outcomes flow through it; currently one flag among many | 07 §11.2 scoring QA | **S2** |
| 6 | Add prompt/elicitation escalation after 2nd same-category recast (structured/guided tiers only), arbitrated by `recast_uptake_rate` | Lyster & Saito (2010): prompts outperform recasts for uptake in instructional settings | 07 §8.2c correction_rules | S3 |
| 7 | Reconcile review-time budget with ES method (+~50%), define new-card-cap vs lesson-flow collision behavior; hand to 05 memory model | 29 s lifetime review/item vs 8–10-encounter durability findings | 07 §7.2, §2 R10 | S3 |
| 8 | Add fluency-development strand (i−1 re-listens, 4/3/2 retells, timed known-text reading) + small receptive-lemma pool for passages | Nation (2007) four strands; lemma breadth bounds listening (§1.4) | 07 §7 | S3 |
| 9 | Demote pron.theta_eth to feedback-only; reallocate to vowels/final clusters | Functional load + LFC; internal consistency with the map's own intelligibility policy | 07 §6 | S3 |
| 10 | Add R/P lint (≥40% productive slots; non-review lessons end productive/interactive) | Balance currently exemplary but unenforced | 07 §9.3 | S3 |
| 11 | Per-script timing multipliers; fix 10–16-min envelope violation (U10-L02 = 19 min); scope certificate claims to spoken/listening/written interaction (or add reading probe) | §2.3, §2.7 | 07 §8.2a; A2L §13a; 07 §11.2 | S3 |
| 12 | Audio-first variant track for low-literacy (so/ht) [requires validation with district populations]; document L1 instructional fade U10–12; teen-context scenario variants for district deployments | §1.10, §1.3 | 07 §8.2a, §9.4 | S4 |

### 4.2 ES (Spanish for English speakers, 08 + four ES band files): **sound-with-revisions**

Stronger of the two as written: correct coverage floors, more granular spine, separate receptive pool, tighter lint suite. No S1 items.

| # | What | Why | Where | Severity |
|---|------|-----|-------|----------|
| 1 | Same AI-rater calibration blocking dependency as EN item 5 | All four gates depend on it | 08 §8.4 [requires validation] flags | **S2** |
| 2 | Widen hours envelope (p75/p90 beyond 145 h) and pilot-gate the 122 h median | Optimistic vs FSI Category-I classroom-hour baselines even with cognate advantage | 08 §1, §7 | **S2** |
| 3 | Plant receptive preterite exposure in U7–U8 listening before the U9 morphology block (5 grammar lessons + spelling changes in one unit) | Eases the densest morphological load in either course; mirrors the map's own chunk-first previews | 08 §5 GS-57–63, §3.2 U9 | S3 |
| 4 | Prompt/elicitation escalation in correction stack (as EN item 6) | Lyster & Saito (2010) | 08 §9.3 correction_rules | S3 |
| 5 | Reconcile review-budget methodology with EN (44% divergence for the same mechanism); cap-collision behavior → 05 | §1.5 | 08 §7 | S3 |
| 6 | Fluency strand + certificate-scope wording (no reading instrument) as EN items 8/11 | §1.1, §2.7 | 08 §7, §8.4 | S3 |
| 7 | Reconcile vocab counting policy with EN (core+pool vs recognition-inside-headline) before owner sign-off | Directions' headline numbers currently not comparable | 08 §4.1; 07 §2 R17; 07 §12 Q4 | S3 |
| 8 | es-2.6 stress exemplar: use *papá/papa*-type pairs; keep *hablo/habló* for es-9.3; fix es-10.6 duration-envelope violation | Semantic opacity at U2; V7 lint conflict | 08 §12 (es-2.6), §10.3 V7; ES-A2L §13a | S4 |

### 4.3 Cross-cutting dependencies and risks

- **Dependency:** every "guaranteed" property (recycling, vocab boundaries, coverage floors, contract completeness) is enforced by [proposed] lint suites that do not exist. Authoring before the lint suite lands converts all guarantees back to assertions. Sequence: lint suite → authoring, and add the S1 coverage-floor fix *before* the lint is coded.
- **Dependency:** review-load and cap-collision decisions belong to the 05 memory model [assumption: unified entities + FSRS-style scheduling]; both maps should file them as explicit requirements, not resolve them locally.
- **Risk:** the 07/08 [estimated] hour and cost figures are already propagating into owner-facing scope (240 sessions, authoring person-years). Optimism here fails silently at pilot, expensively.
- **Acceptance criteria for this review's revisions:** (1) EN coverage floor text matches ES schedule in all three locations and in lint code; (2) hours tables show per-L1-tier percentiles with a pilot-telemetry gate note; (3) Band Gate spec contains no morpheme-accuracy sub-bars; (4) a rater-calibration study with numeric agreement targets appears as a blocking row in both maps' open-questions/dependency sections; (5) U8 (EN) lesson list contains a past-preview slot; (6) correction-rule schema includes a prompt-escalation field; (7) both maps cite one shared review-time methodology.

*End of review. Written without coordination with the map authors; all judgments independent.*

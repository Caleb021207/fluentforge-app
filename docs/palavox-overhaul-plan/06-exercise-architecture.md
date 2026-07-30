# 06 — Exercise Architecture: The Reusable Exercise-Primitive System

**Role:** Exercise Architecture Specialist · **Phase:** planning only — no implementation implied
**Repo evidence:** branch `overhaul` @ `7cbaadd9` · **Date:** 2026-07-30
**Labels:** `[observed]` read in repo · `[documented]` vendor/spec docs or sibling plan docs · `[estimated]` numeric judgement · `[proposed]` design decision for owner review · `[assumption]` premise · `[requires validation]` needs live check/pilot.

Companion docs this one depends on: 11 (voice stack: STT/TTS/pronunciation-assessment routing and costs), 13 (localization: locale registry, L1-instruction policy), 02 (flow defects F2-1/F2-2), wip-curriculum-* §11–§13 (exercise blend, review scheduling, band gates). The mastery-model specialist doc (05, forthcoming) owns the evidence-update math; this doc defines *what evidence each primitive emits*, with weights marked [proposed] for that doc to ratify.

---

## 0. Executive summary — the decisions

| # | Decision | Recommendation [proposed] |
|---|---|---|
| E1 | Content contract | Single versioned JSON envelope per exercise: client-safe `content` jsonb on `exercises` + server-only `exercise_answer_keys` table. Retire label-encoded keys in `exercise_options` for new primitives; keep the options table only as a legacy MCQ read path during migration |
| E2 | Grading service | **Extend `submit-exercise` → `submit-attempt`** (one endpoint, single-writer for progress side effects) with a pluggable grader registry in `_shared/graders/`; async 202+poll path for AI-assisted tiers. Do not build a parallel service |
| E3 | Grading tiers | Tier 0 deterministic code · Tier 1 deterministic external signal (STT / Azure Pronunciation Assessment) · Tier 2 AI rubric with a deterministic floor and a declared fallback. Every Tier-2 primitive must define its Tier-0/1 degradation before it ships |
| E4 | WIP grader (`wip/conversation-engine-preplanning`) | **Adopt the utilities** (normalization, edit-distance, near-miss, `GradeOutcome` shape); **reject the storage model** (keys encoded in `exercise_options.label` as `"left::right"` / JSON-in-label) and its treatment of `speaking` as text equality (§6.4) |
| E5 | Renderer | One `LessonPlayer` shell owning session state, submission, feedback, a11y live regions; per-primitive renderers behind a typed `PrimitiveRenderer` contract; renderers never grade and never see keys |
| E6 | Sequencing | Deterministic five-phase lesson composer (warm-up → input → controlled → productive → wrap) replacing `orderByAbility`'s whole-lesson re-sort (learnerProgress.ts:62-72), which currently destroys pedagogical ordering [observed] |
| E7 | Quality gates | Keep all six gauntlet gates; add seven primitive-aware gates (schema, key-coverage, audio round-trip, phoneme-distance, l10n-completeness, a11y-assets, rubric-stability). Gate matrix in §9 |
| E8 | Hints | Three-level hint ladder; hints discount mastery evidence (never lesson progress); accessibility replays are never discounted (§2.4) |
| E9 | Partial credit | Continuous `score ∈ [0,1]` + per-primitive pass threshold; `exercise_attempts` gains `score`, `hint_level`, `grader_version`, `response jsonb` columns (current row is a bare boolean, migration 20260729171206:51-62 [observed]) |
| E10 | Rollout | Five waves ranked in §10; Wave 1 (six deterministic text/order primitives) removes the MCQ-only bottleneck with zero new vendor dependencies |

---

## 1. Current state (what exists, what breaks)

- **Delivery is MCQ-only.** `submit-exercise` grades exactly one thing: `optionId === key.id` (supabase/functions/submit-exercise/index.ts:75); the request body carries only `exercise_id`, `option_id`, `response_ms` (:43-45). The client filters out every exercise without options so students never see unanswerable prompts (src/hooks/useLessonRunner.ts:72-79). All nine schema-allowed types (`flashcard`,`cloze`,`matching`,`ordering`,`dictation`,`listening_mc`,`speaking`,`translation`,`dialogue` — migration 20260729164446 line 91) except option-bearing ones are silently dropped (doc 02 F2-1). [observed]
- **Key protection is real and worth preserving.** `learn-lesson` strips `is_correct`/`rationale` and shuffles options server-side (learn-lesson/index.ts:91-99); `exercise_options` is admin-only under RLS (migration 20260729164446:213) despite a table-level `GRANT SELECT` (:166). [observed]
- **The attempt record cannot express partial credit.** `exercise_attempts` stores `is_correct boolean`, `selected_option_id`, `response_ms` and nothing else (migration 20260729171206:51-62). An older, richer attempts table (`outcome IN ('correct','partial','incorrect')`, `score 0-100`, `meta jsonb`) exists in migration 20251021193032:64-73 but is superseded. [observed]
- **The "lesson complete" UI lie.** Completion requires a correct answer on *every* published exercise (submit-exercise/index.ts:141) but the player shows each item once and locally declares `finished` (LessonPlayer.tsx:90-94), so a learner who missed one item sees a completion screen while the server keeps `in_progress` (doc 02 F2-2). Sequencing (§8) must fix this with an in-session retry queue. [observed]
- **Declared-but-unimplemented client types.** `src/types/exercises.ts:3-9` declares `flashcard|cloze|reorder|transform|guided_convo_text|guided_convo_voice` payloads that nothing renders or grades — a *third* type vocabulary disagreeing with both the DB CHECK and the served data. The unified contract (§5) supersedes all three. [observed]
- **Mastery machinery to plug into:** `skill_mastery` rolling-window (learnerProgress.ts:19-56), `vocab_card_state` FSRS columns (migration 20260729171206:74+), XP values (learnerProgress.ts:166-172), and the six-gate gauntlet (contentGauntlet.ts:353-390: `input_budget`, `level`, `solver`, `pedagogy`, `bias`, `duplicate`). [observed]
- **Adaptive ordering bug to retire:** `orderByAbility` re-sorts an entire lesson by `|difficulty − ability|` (learnerProgress.ts:62-72), which would interleave warm-up and productive items arbitrarily. It predates any notion of lesson phases. [observed]

---

## 2. Shared infrastructure (defaults every primitive inherits)

Primitives below state only their *deviations* from these defaults.

### 2.1 Attempt envelope [proposed]

Client → `submit-attempt`:

```json
{
  "exercise_id": "uuid",
  "response": { "...primitive-specific, see each §3 entry..." },
  "response_ms": 4210,
  "hint_level": 0,
  "input_mode": "keyboard|touch|voice|switch",
  "client_session_id": "uuid"
}
```

Server → client (`status:"graded"` synchronous for Tiers 0/1; `status:"pending"` + `attempt_id` for Tier 2, resolved via poll of `get-attempt` or Realtime channel):

```json
{
  "attempt_id": "uuid",
  "status": "graded",
  "score": 0.0,
  "passed": false,
  "partials": [{ "part": "b1", "score": 1.0 }],
  "expected": { "...revealed answer, post-grade only..." },
  "feedback": { "kind": "rationale|diff|phoneme|rubric", "l1": "…", "tl": "…" },
  "evidence": [{ "entity": "vocab_item", "id": "…", "mode": "productive_written", "weight": 1.0 }],
  "lesson": { "complete": false, "solved": 3, "total": 8, "requeued": ["ex-id"] },
  "xp": { "awarded": 5, "reasons": ["first correct answer"] },
  "streak": null
}
```

`expected` and rationale are only ever present in a *graded* response — the pre-grade payload from `learn-lesson` never contains them (preserves learn-lesson/index.ts:91-99 invariant).

### 2.2 Grading tiers [proposed]

| Tier | Mechanism | Determinism | Latency target | Used by |
|---|---|---|---|---|
| 0 | Pure server code: option match, normalized-text match, token-order match, pair match, accept-lists, edit distance | Bit-for-bit reproducible; golden-vector tested | p50 < 400 ms | 13 of 22 primitives fully; floor for all |
| 1 | External deterministic signal: streaming/batch STT with word timestamps + confidence; Azure Pronunciation Assessment scripted mode (`NBestPhonemes`) per doc 11 §3.2 | Reproducible given same audio + pinned vendor version; vendor drift monitored | p50 < 2.5 s | dictation(voice), transcription, read-aloud, pronunciation imitation, minimal-pair (production variant) |
| 2 | LLM rubric judge, constrained JSON, pinned model + prompt hash (`grader_version`), always preceded by Tier-0 pre-checks (empty/copy-paste/length/language-id) and followed by sanity bounds | Non-deterministic; agreement-tested against human raters (§12 AC-7) before shipping | async, p95 < 8 s | guided response, free writing, info-gap (process), roleplay, mission, checkpoint rubric strands |

Rule [proposed]: **Tier 2 may raise a score above the deterministic floor but may never flip a deterministic fail on objective criteria** (e.g., empty response, wrong language) to a pass.

### 2.3 Answer-key protection [proposed]

- `exercises.content jsonb` — client-safe render payload (validated against §5 schema).
- `exercise_answer_keys(exercise_id PK → key jsonb, grading jsonb)` — **no** `authenticated` grant, no RLS policy for any client role; service-role only, read exclusively inside `submit-attempt` and the gauntlet. This is a stricter posture than today's RLS-guarded `exercise_options` (which still carries a table-level `GRANT SELECT`, migration 20260729164446:166 [observed]) and avoids the WIP branch's label-encoding hack (§6.4).
- Contract test (§13 T-2): serialize every `learn-lesson` response in CI against a canary lesson containing all 22 primitives; assert zero occurrences of key material.

### 2.4 Hint ladder and evidence discount [proposed]

| Level | Name | Examples | Evidence effect | Lesson-progress effect |
|---|---|---|---|---|
| 0 | none | — | weight ×1.0 | normal |
| 1 | orientation | re-show L1 instruction, one worked example, replay audio at normal/slow speed | ×1.0 — **free**: comprehension-of-task and accessibility supports never penalize | normal |
| 2 | linguistic scaffold | first letter/character, word bank appears, L1 gloss of target item, chunk skeleton | ×0.5, and a *productive* item's evidence downgrades to *receptive* for the scaffolded entity | normal |
| 3 | reveal | show answer, then require copy-through (type/say it once) | ×0 (no mastery evidence); FSRS grade `again` | item counts as attempted; requeued once in-session |

Hard rules: audio replays and slow-speech toggles are Level 1 everywhere (a11y §2.6); `hint_level` is recorded on every attempt row (AC-6); hint availability per level is authored in `content.hints` and may be disabled for checkpoint items.

### 2.5 Localization defaults (inherits doc 13)

- **Instructions in L1**: every primitive's instruction line is a registry key rendered via i18next/ICU in the learner's `instruction_language` (doc 13 D1/D3), with recorded or TTS L1 audio for low-literacy learners (§2.6). Content — prompts, options, audio — is target-language unless the primitive is explicitly cross-lingual (meaning recognition L1 side, selective translation).
- **Spanish course exception** (doc 13 D7): instruction language is English by policy; the contract carries the pair, not a hardcode.
- Glosses come from `vocabulary_glosses` keyed by L1 (doc 13 D6); AI-assisted feedback follows the graded L1-ratio `languagePolicy` (doc 13 D8): at A1 feedback is L1-dominant, by A2 mixed.

### 2.6 Accessibility baseline (WCAG 2.2 AA target [proposed])

1. Full keyboard operability: visible focus, `Enter`/`Space` select, arrow-key + grab/drop pattern for any drag interaction, with announced state changes.
2. Screen reader: every renderer exposes instruction, prompt, options, and state via ARIA; grading feedback lands in a single `aria-live="polite"` region owned by the shell.
3. **Low-literacy audio-first**: every L1 instruction and every TL text ≤ A2 has a play button (pre-generated cached TTS per doc 11 §3.2 "Lesson/listening audio"); icons + audio suffice to operate every Wave-1/2 primitive without reading the L1 instruction text.
4. Touch targets ≥ 44 px; no default time limits (checkpoints support extended-time); reduced-motion respected; listening items must not expose transcripts pre-grade (that is the construct), but post-grade transcript display is mandatory.
5. Voice-input primitives always offer a typed alternative *where the construct allows it* (dictation, guided response) and declare it where it does not (read-aloud, pronunciation imitation) — those items are skippable with teacher-visible accommodation flags [proposed] [requires validation with district accessibility policy].

### 2.7 Analytics envelope [proposed]

Common event stream (all keyed by `user_id, client_session_id, lesson_id, exercise_id, primitive, band, l1, tl`):
`exercise_shown`, `audio_played {asset_id, speed}`, `hint_requested {level}`, `response_submitted {input_mode, response_ms}`, `attempt_graded {tier, score, passed, grader_version, latency_ms}`, `grading_fallback_used {from_tier, to_tier, reason}`, `feedback_viewed {dwell_ms}`, `item_requeued`. Per-primitive additions listed in §3. Proficiency claims are derived **only** from `attempt_graded.evidence` joins — never from XP/streak/completion events (owner rule; the exploitable legacy `award-xp` path is documented in wip-01a F6 [observed]).

### 2.8 Mastery-evidence model (interface to doc 05) [proposed]

Memory entities: `vocab_item` (lemma), `chunk` (multi-word unit), `grammar_point`, `phoneme_contrast`, `skill` (existing `skill_mastery` row), `task_can_do` (checkpoint/mission-level). Evidence modes: `receptive_written`, `receptive_aural`, `productive_written`, `productive_spoken`. Each attempt emits `(entity, id, mode, weight × hint-discount × score)` tuples declared in the item's `evidence` block; recognition/exposure evidence can *never* satisfy a productive mastery requirement (owner rule). FSRS mapping default: pass w/o hint → `good`; pass with Level-2 hint → `hard`; fail or reveal → `again`; fast+perfect (< 40% of median response time [estimated]) → `easy` [requires validation].

### 2.9 Cost model summary [estimated] (per attempt; formulas from doc 11 §4)

| Path | Cost |
|---|---|
| Tier 0 | < $0.0001 (edge compute only) |
| Cached TTS playback | ~$0 marginal (~$6 one-time per 5k utterances, doc 11 §3.2) |
| STT, 10–20 s utterance | $0.001–0.004 |
| Azure PA scripted, 10–20 s | $0.003–0.010 |
| Tier-2 rubric (mini-class model, 0.5–2k tokens) | $0.001–0.003 |
| Interactive AI turn (STT+LLM+TTS) | $0.010–0.020/turn |
| Full mission (10–15 turns) | $0.10–0.25 |

---

## 3. The 22 primitives

Format per primitive: **Purpose · Stage · Content (client-safe) · Key (server-only) · Response · Grading · Partial credit · Feedback · Hints · L10n · A11y · Analytics+ · Evidence · Review · AI/fallback · Cost**. Stage bands use the curriculum's progressive-release ratios (structured → guided → open). All schemas are excerpts of the §5 envelope's `content`/`answer_key`/`response` members. Everything in §3 is [proposed] unless labeled otherwise.

### P01 `meaning_recognition`

- **Purpose:** Form–meaning mapping, receptively: pick the L1 meaning of a TL word/chunk (or TL for L1). First contact and cheap re-exposure; the formalization of today's only working type [observed].
- **Stage:** Early A1 onward; dominant in U1–U3, decaying share afterward.
- **Content:** `{ "prompt_tl": "teacher", "prompt_audio": "asset_id", "direction": "tl_to_l1", "options": [{ "id": "o1", "label_l1": "…" }, …3-4] }` (option labels localized per L1 from `vocabulary_glosses`).
- **Key:** `{ "correct_option": "o1", "rationale_l1_key": "…" }`
- **Response:** `{ "selected_option": "o1" }`
- **Grading:** Tier 0, exact option match. Key never serialized to client (§2.3).
- **Partial credit:** none (binary).
- **Feedback:** immediate; correct → rationale; wrong → show correct option highlighted + rationale; both in L1 at A1.
- **Hints:** L1 gloss hint is nonsensical here (it *is* the task); Level 2 = eliminate one distractor (×0.5).
- **L10n:** defaults; option labels are L1 content — requires gloss coverage for the learner's L1 (gate G-l10n).
- **A11y:** baseline; radiogroup semantics; audio button on TL prompt.
- **Analytics+:** `distractor_chosen {option_id}` for distractor-quality mining.
- **Evidence:** `vocab_item`/`chunk` `receptive_written` (+`receptive_aural` if answered after audio play), w=1.0.
- **Review:** FSRS card touch (receptive); wrong answer schedules the item into the N−2 interleave pool (curriculum §11).
- **AI/fallback:** none at runtime. Fully offline-capable.
- **Cost:** <$0.0001.

### P02 `word_retrieval` (productive word retrieval)

- **Purpose:** Active recall of a single TL word from an L1 cue or image — the productive counterpart of P01; the single strongest driver of vocabulary durability [documented: retrieval-practice literature] [assumption for this population, requires validation].
- **Stage:** Early A1 onward, only after the item has ≥2 receptive exposures (§8 rule S-3).
- **Content:** `{ "cue_l1": "profesor/a", "cue_image": "asset_id|null", "expected_length_hint": 7, "keyboard": "tl_default" }`
- **Key:** `{ "accept": ["teacher"], "accept_near_miss": true, "keep_accents": false }`
- **Response:** `{ "text": "techer" }`
- **Grading:** Tier 0: normalize (case/whitespace/punctuation/diacritics per policy) → exact match against accept-list → edit-distance ≤1 near-miss for words ≥4 chars (adopting WIP `normalizeText`/`isNearMiss`, §6.4).
- **Partial credit:** near-miss = score 0.9, passed, flagged `spelling`.
- **Feedback:** correct → confirm + audio of the word; near-miss → "check spelling" diff highlighting the changed character; wrong → reveal + copy-through.
- **Hints:** L2 = first letter (×0.5, downgrades to receptive); L3 reveal.
- **L10n:** cue is L1 content (gloss table); TL keyboard layout hint from locale registry.
- **A11y:** baseline; input field labeled with L1 cue; audio cue alternative for low-literacy (image + L1 audio).
- **Analytics+:** `near_miss {distance}`, keystroke-free (no keylogging — privacy).
- **Evidence:** `vocab_item` `productive_written` w=1.0.
- **Review:** FSRS productive card; this primitive is the FSRS review workhorse (curriculum §11 layer 1).
- **AI/fallback:** none.
- **Cost:** <$0.0001.

### P03 `chunk_retrieval` (lexical-chunk retrieval)

- **Purpose:** Retrieve multi-word formulas ("Nice to meet you", "¿Cómo te llamas?") as wholes — chunks carry A1 conversation before grammar does [documented: curriculum band plans' chunk-first strands].
- **Stage:** Early A1 onward.
- **Content:** `{ "cue_l1": "Ask someone's name", "scaffold": "What's ___ ___?", "mode": "typed|token_bank", "tokens": ["your","name","his","old"] }` (token bank includes distractor tokens).
- **Key:** `{ "accept": ["what's your name", "what is your name"], "token_solution": ["what's","your","name"] }`
- **Response:** `{ "text": "…" }` or `{ "tokens": ["what's","your","name"] }`
- **Grading:** Tier 0: normalized accept-list (typed) or ordered token match (bank). Contractions expanded/collapsed in normalization table.
- **Partial credit:** token mode: `correct_tokens_in_place / n` with pass ≥ 1.0 (order matters); typed: near-miss on ≤1 word = 0.85 pass.
- **Feedback:** wrong → correct chunk shown + audio + choral repeat prompt (non-graded).
- **Hints:** L2 = token bank appears for typed mode (×0.5); scaffold blanks fill left-to-right on repeated L2 use.
- **L10n/A11y:** defaults; token buttons are keyboard-operable list with reorder pattern.
- **Analytics+:** `token_error_position`.
- **Evidence:** `chunk` `productive_written` w=1.0 (typed) / 0.8 (bank — recognition-assisted).
- **Review:** chunk-level FSRS card (chunks are first-class cards, curriculum §11).
- **AI/fallback:** none. **Cost:** <$0.0001.

### P04 `listening_selection`

- **Purpose:** Aural word/chunk recognition: hear TL audio, select matching meaning/image/text. Builds the sound→meaning link before sound→spelling.
- **Stage:** Early A1 onward; audio-first lessons lean on it heavily.
- **Content:** `{ "audio": "asset_id", "replay_limit": null, "slow_variant": "asset_id", "options": [{ "id":"o1", "image":"asset_id", "label_l1":"…" }…] }` — **no TL transcript pre-grade**.
- **Key:** `{ "correct_option": "o2", "transcript_tl": "Where are you from?" }` (transcript lives in the key so it cannot leak pre-grade).
- **Response:** `{ "selected_option": "o2", "plays": 2, "used_slow": true }`
- **Grading:** Tier 0.
- **Partial credit:** none.
- **Feedback:** post-grade reveal of transcript + slow replay with word-by-word highlight.
- **Hints:** replays/slow are free (L1); L2 = show first word of transcript (×0.5).
- **L10n:** audio pre-generated per target variant (doc 11 cached TTS; doc 13 D9 voice map).
- **A11y:** **conflict acknowledged**: deaf/HoH learners cannot take listening items — accommodation flag routes to text-equivalent (P01) with `accommodated:true` on evidence [proposed] [requires validation with district policy].
- **Analytics+:** `plays`, `used_slow` (input to listening-load analytics, never to proficiency claims).
- **Evidence:** `vocab_item`/`chunk` `receptive_aural` w=1.0.
- **Review:** FSRS aural-mode touch; failures feed phoneme-confusion mining for P11 generation.
- **AI/fallback:** TTS at authoring time only; runtime is cached audio — offline-capable once assets cached.
- **Cost:** ~$0 marginal (cached TTS).

### P05 `sentence_construction`

- **Purpose:** Syntax assembly from a token bank (word order, copula placement, question inversion) without a spelling burden.
- **Stage:** Early A1 onward (core grammar-controlled practice).
- **Content:** `{ "cue_l1": "Say: she is from Peru", "tokens": [{"id":"t1","text":"is"},…], "distractor_tokens": [{"id":"t9","text":"are"}] }` (ids randomized per serve so position ≠ answer).
- **Key:** `{ "solutions": [["t3","t1","t4","t5"]], "solution_texts": ["she is from peru"] }` — multiple orders allowed when genuinely valid.
- **Response:** `{ "ordered_tokens": ["t3","t1","t4","t5"] }`
- **Grading:** Tier 0: ordered-id match against any solution; text-level fallback comparison if token ids desync (grades by joined normalized text, as the WIP grader does for `reorder` — adopted).
- **Partial credit:** longest-common-subsequence ratio reported in `partials` for feedback, but pass requires full match (grammar is the construct).
- **Feedback:** wrong → show learner order vs correct with first-divergence highlighted; L1 note from `l1_contrast_notes` when the error matches a known transfer pattern (e.g., zero-copula) [proposed, requires curriculum data].
- **Hints:** L2 = lock the first token in place (×0.5); L3 reveal + rebuild.
- **L10n/A11y:** defaults; keyboard reorder: select token → arrow to position → drop, all announced.
- **Analytics+:** `first_divergence_index`, `distractor_token_used`.
- **Evidence:** `grammar_point` `productive_written` w=0.8 (bank-assisted production).
- **Review:** feeds `skill_mastery` for the grammar skill; repeated first-divergence at same slot spawns an error-taxonomy micro-drill (curriculum §11 layer 5).
- **AI/fallback:** none. **Cost:** <$0.0001.

### P06 `cloze` (fill-in-the-blank)

- **Purpose:** Targeted form practice in context — morphology (3rd-person *-s*), function words, collocations. The highest-leverage missing type today [observed: schema allows it, nothing serves it].
- **Stage:** Early A1 onward.
- **Content:** `{ "text_tl": "She ___(b1) from Peru. I ___(b2) from Chile.", "blanks": [{"id":"b1","mode":"typed"},{"id":"b2","mode":"choice","options":[{"id":"o1","text":"am"},{"id":"o2","text":"is"}]}], "context_audio": "asset_id" }`
- **Key:** `{ "b1": { "accept": ["is","'s"] }, "b2": { "correct_option": "o1" } }`
- **Response:** `{ "blanks": { "b1": "is", "b2": "o1" } }`
- **Grading:** Tier 0 per blank (accept-list / option match), near-miss allowed for typed blanks unless the blank targets spelling.
- **Partial credit:** `score = Σ blank scores / n`; pass ≥ 1.0 by default, authorable to 0.75 for ≥4-blank items.
- **Feedback:** per-blank verdicts; wrong blank shows expected + one-line L1 rationale.
- **Hints:** L2 = per-blank first letter or option reveal (×0.5 for that blank's evidence only).
- **L10n/A11y:** defaults; blanks are labeled inputs navigable in text order.
- **Analytics+:** per-blank `attempt_graded.partials` retained for grammar diagnostics.
- **Evidence:** per blank: `grammar_point` or `vocab_item` `productive_written` w=1.0 (typed) / 0.6 (choice).
- **Review:** per-entity FSRS/skill updates; the multi-blank partial map is the richest grammar-diagnostic signal in the system.
- **AI/fallback:** none. **Cost:** <$0.0001.

### P07 `selective_translation`

- **Purpose:** Translate a short sentence L1→TL (or TL→L1 as comprehension check) where the *selection* of taught structure matters — cross-lingual anchoring appropriate to A1 learners with L1 literacy.
- **Stage:** Late A1 → A2 (needs enough TL to have alternatives); TL→L1 direction from Early A1.
- **Content:** `{ "source_l1": "Ella es de Perú.", "direction": "l1_to_tl", "mode": "typed|token_bank" }`
- **Key:** `{ "accept": ["she is from peru", "she's from peru"], "reject_with_note": [{ "match": "she is of peru", "note_key": "prep_transfer_de" }] }`
- **Grading:** Tier 0 accept-list first. **Gate-enforced key coverage** (G-key-cov, §9) keeps accept-lists honest: at authoring time the solver model generates 6 paraphrases; any judged-correct paraphrase the key rejects fails the gate. Runtime Tier-2 adjudication of near-misses is deliberately **off** at A1 (sentences are short; accept-lists are enumerable) [proposed]; revisit at B1.
- **Partial credit:** near-miss per §P02; `reject_with_note` matches score 0 but emit targeted L1 transfer feedback.
- **Feedback:** wrong → best-match accept shown with word-level diff; transfer-note when matched.
- **Hints:** L2 = token bank (×0.5). **L10n:** source is L1 content — every enabled L1 needs authored/reviewed source lines (doc 13 D5 pipeline); this is the most L10n-expensive Wave-3 primitive.
- **A11y:** defaults. **Analytics+:** `reject_note_hit {note_key}`.
- **Evidence:** `grammar_point`+`chunk` `productive_written` w=1.0 (typed).
- **Review:** as P05/P06. **AI/fallback:** authoring-time solver only; runtime deterministic. **Cost:** <$0.0001 runtime.

### P08 `dictation`

- **Purpose:** Sound→spelling mapping: hear a short utterance (1 sentence, ≤8 words at A1), type it verbatim. Trains decoding + phoneme–grapheme links.
- **Stage:** word-level Early A1 (U1 alphabet strand), sentence-level Late A1.
- **Content:** `{ "audio": "asset_id", "slow_variant": "asset_id", "length_words": 5 }` (no transcript client-side).
- **Key:** `{ "transcript": "where are you from", "accept_near_miss": false, "token_tolerance": 0 }`
- **Response:** `{ "text": "were are you from", "plays": 3 }`
- **Grading:** Tier 0: normalize → token-align (Levenshtein over tokens) against transcript. Spelling is the construct → near-miss **off** by default (matches WIP grader's dictation exception — adopted).
- **Partial credit:** `1 − WER`, pass ≥ 0.9 with all content words correct.
- **Feedback:** word-level diff (insertions/deletions/substitutions colored), then replay with synced highlight.
- **Hints:** replays free; L2 = show first word (×0.5); no reveal-before-attempt.
- **L10n/A11y:** as P04 including accommodation route.
- **Analytics+:** `wer`, `error_positions` → phoneme-confusion mining.
- **Evidence:** `vocab_item` `receptive_aural` w=1.0 + orthography sub-signal (doc 05 to define storage).
- **Review:** high-WER items re-enter as P04/P11 (perception-first remediation, curriculum §11).
- **AI/fallback:** cached TTS only; fully deterministic runtime. **Cost:** ~$0 marginal.

### P09 `transcription`

- **Purpose:** Sustained listening: transcribe a 2–4 sentence passage (schedule announcement, voicemail). Distinguished from P08 by length, tolerance, and passage-level meaning load.
- **Stage:** A2 (Late A1 stretch variant with scaffold).
- **Content:** `{ "audio": "asset_id", "segments": [{"id":"s1","start_ms":0},…], "scaffold": "partial transcript with gaps|null" }`
- **Key:** `{ "segment_transcripts": { "s1": "…", … }, "token_tolerance": 0.15 }`
- **Response:** `{ "segments": { "s1": "…", … }, "plays": 2 }`
- **Grading:** Tier 0 token alignment per segment; function-word slips weighted 0.5, content-word errors 1.0 in WER.
- **Partial credit:** per-segment `1 − weighted WER`; pass ≥ 0.8 overall.
- **Feedback:** per-segment diff + full replay with highlight.
- **Hints:** segment-by-segment replay free; L2 = reveal one segment (its evidence ×0).
- **L10n/A11y:** as P04. **Analytics+:** per-segment WER.
- **Evidence:** `skill`(listening) + constituent `vocab_item` `receptive_aural`, w=1.0.
- **Review:** failed segments' content words → FSRS `again`.
- **AI/fallback:** none runtime. **Cost:** ~$0 marginal.

### P10 `pronunciation_imitation`

- **Purpose:** Listen-and-repeat with phoneme-level scoring: model audio → learner repeats → per-phoneme feedback. Perception→production bridge; no reading required (audio-first).
- **Stage:** Early A1 onward (U1 sounds lab).
- **Content:** `{ "model_audio": "asset_id", "target_text_tl": "thirteen", "show_text": false, "target_phonemes": ["θ"], "max_seconds": 10 }`
- **Key:** `{ "reference_text": "thirteen", "pass_thresholds": { "accuracy": 70, "target_phoneme": 60 } }`
- **Response:** `{ "audio_upload": "storage_path", "duration_ms": 2400 }`
- **Grading:** Tier 1: Azure PA scripted mode (doc 11 §3.2 — "only source of real phoneme evidence"); score = scaled AccuracyScore with target-phoneme sub-check from `NBestPhonemes`.
- **Partial credit:** continuous; pass at authored thresholds (start lenient at A1: intelligibility, not nativeness [proposed]).
- **Feedback:** syllable/phoneme heat display + model-vs-you replay; **never** an IPA lecture at A1 — one L1-localized articulation tip per weakest phoneme, from a curated tip table [proposed].
- **Hints:** unlimited model replays free; slow model free.
- **L10n:** tips localized; reference locale per target variant (doc 13 D9).
- **A11y:** mic-permission flow with L1 audio instructions; speech-impaired accommodation flag → skip with alternative evidence route [requires validation].
- **Analytics+:** `pa_accuracy`, `phoneme_scores`, `audio_seconds`. Audio retention policy per doc 15 / consent notes in doc 11 §5.3 [documented].
- **Evidence:** `phoneme_contrast` `productive_spoken` w=1.0.
- **Review:** failed phonemes schedule P11 discrimination first, then re-attempt production (perception-first rule, curriculum §11).
- **AI/fallback:** PA outage → record-and-compare mode: attempt stored, self-assessment UI, `evidence w=0`, flagged for async batch scoring (doc 11 Pattern E) — the learner is never blocked.
- **Cost:** $0.003–0.01 [estimated].

### P11 `minimal_pair`

- **Purpose:** Phoneme discrimination (*ship/sheep*, *thirteen/thirty*): hear one, pick which. Builds the perceptual categories production depends on; pairs selected by L1 (Spanish L1 → /ɪ–iː/; Mandarin L1 → /l–r/ …) [documented: curriculum L1 schemas].
- **Stage:** Early A1 onward.
- **Content:** `{ "audio": "asset_id", "options": [{"id":"o1","text_tl":"ship","audio":"a1"},{"id":"o2","text_tl":"sheep","audio":"a2"}], "contrast": "ɪ-iː" }`
- **Key:** `{ "correct_option": "o1" }`
- **Response:** `{ "selected_option": "o1" }`
- **Grading:** Tier 0. Items served in blocks of 6–10 trials (single-trial guessing is 50%); block pass ≥ 80%.
- **Partial credit:** per-block proportion.
- **Feedback:** per-trial instant tick/cross; block end → both words replayed contrastively slow.
- **Hints:** none (task is atomic); replays free.
- **L10n:** pair inventory selected by `(l1, tl)` from contrast registry.
- **A11y:** as P04 accommodation route.
- **Analytics+:** `contrast`, per-trial RT (RT trends inform automatization research, not claims).
- **Evidence:** `phoneme_contrast` `receptive_aural` w=1.0 (block-level, not trial-level).
- **Review:** sub-80% blocks re-queue within 48 h; gates P10 re-attempts for that contrast.
- **AI/fallback:** none runtime. **Cost:** ~$0 marginal.

### P12 `read_aloud`

- **Purpose:** Decode printed TL text aloud: grapheme→phoneme mapping plus fluency (rate, pausing). Complements P10 (which is ear-driven).
- **Stage:** Late A1 (after alphabet strand); A2 adds prosody.
- **Content:** `{ "text_tl": "I get up at seven o'clock.", "model_audio": "asset_id|null", "max_seconds": 20 }`
- **Key:** `{ "reference_text": "…", "pass_thresholds": { "accuracy": 70, "completeness": 85, "fluency": 55 } }`
- **Response:** `{ "audio_upload": "path" }`
- **Grading:** Tier 1: Azure PA scripted (accuracy/fluency/completeness; prosody dimension at A2).
- **Partial credit:** weighted composite (accuracy 0.5, completeness 0.3, fluency 0.2 at A1).
- **Feedback:** word-level coloring on the text (misread/omitted), tap word → model audio of that word.
- **Hints:** model listen-first free at A1, disabled in checkpoint variant.
- **L10n/A11y/Analytics/Review:** as P10; dyslexia-flagged learners get the P10 route instead [proposed] [requires validation].
- **Evidence:** `phoneme_contrast` + decoding sub-signal `productive_spoken` w=1.0.
- **AI/fallback:** as P10. **Cost:** $0.003–0.01 [estimated].

### P13 `guided_response`

- **Purpose:** First truly communicative step: an on-screen interlocutor asks a *known* question ("What's your name?"); learner answers freely (typed or spoken) within a practiced pattern. Bridges drills → dialogue.
- **Stage:** Early A1 (late units) → A2, heavily scaffolded first.
- **Content:** `{ "stimulus_tl": "What's your name?", "stimulus_audio": "asset_id", "mode": "typed|voice", "scaffold": { "frame": "My name ___ ___.", "show_at_hint": 2 } }`
- **Key:** `{ "patterns": ["my name is *", "i'm *", "i am *"], "slot_checks": [{ "slot": 1, "type": "nonempty_proper_noun_loose" }], "rubric": "answers the question with a complete learned pattern" }`
- **Response:** `{ "text": "My name is Amina" }` or `{ "audio_upload": "path" }` (voice → STT → same text path).
- **Grading:** hybrid: Tier 0 pattern+slot match passes outright (~80% of A1 answers [estimated]); non-matches go to Tier 2 mini-rubric (task-fulfillment yes/no + error tags), which may pass novel-but-correct answers. Deterministic floor: empty/L1-only/copied-stimulus → fail without LLM call.
- **Partial credit:** task fulfilled with form errors → 0.7 pass-with-flag; unfulfilled → 0.
- **Feedback:** recast-style: learner's answer replayed with corrected form highlighted (recasts over metalinguistic explanation at A1); L1 one-liner for tagged errors.
- **Hints:** L2 = frame scaffold appears (×0.5, productive→receptive).
- **L10n:** rubric prompts carry `(l1, tl)` context; feedback language per languagePolicy (doc 13 D8).
- **A11y:** typed alternative always; voice path shows live transcript for confirmation before submit.
- **Analytics+:** `graded_by {tier}`, `error_tags[]`, `pattern_matched`.
- **Evidence:** `chunk`+`grammar_point` `productive_written|spoken` w=1.0 — this is the first primitive emitting *communicative* productive evidence.
- **Review:** error tags feed the error taxonomy → micro-drills (curriculum §11 layer 5).
- **AI/fallback:** AI-gateway outage → Tier-0-only mode (pattern matches pass; non-matches get "saved for review" state, graded async when service returns; never silently failed) [proposed].
- **Cost:** $0.000–0.003 typed; +STT $0.002 voice [estimated].

### P14 `info_gap`

- **Purpose:** Genuine information exchange — the learner holds half a grid (e.g., a schedule), the AI partner holds the other half; learner must ask and answer to fill it. Task-based interaction with a *deterministically checkable outcome*.
- **Stage:** Late A1 (structured, form-scaffolded) → A2 (freer).
- **Content:** `{ "learner_card": { "grid": …, "known_cells": … }, "goal_l1_key": "fill_missing_times", "partner_persona": "classmate", "allowed_questions_scaffold": ["What time is ___?"], "max_turns": 8 }`
- **Key:** `{ "partner_card": { …hidden cells… }, "solution_grid": { … }, "required_moves": ["ask_time", "answer_time"] }` (partner's card is answer-key material — server-only, or the client could scrape it).
- **Response:** final `{ "grid_answers": {…} }` + turn events streamed through the conversation runtime.
- **Grading:** outcome Tier 0 (grid vs solution); process Tier 2 lite (did learner *ask* rather than being told; required moves present — checked by move-classifier with keyword fallback).
- **Partial credit:** outcome proportion (pass ≥ 0.8) × process multiplier (no-asking caps score at 0.5).
- **Feedback:** grid corrections + one interaction note ("You answered well — next time ask the question yourself").
- **Hints:** L2 = question-frame reveal (×0.5 on process evidence).
- **L10n:** goal/persona instructions L1; partner speaks TL with graded slow-speech (doc 11 SSML rate control).
- **A11y:** text-mode fully equivalent to voice-mode; grid keyboard-navigable.
- **Analytics+:** `turns_used`, `questions_asked`, `breakdown_repairs`.
- **Evidence:** `task_can_do`(interpersonal) + constituent chunks, `productive_written|spoken` w=1.0.
- **Review:** failed move types → P13 drills of the question form.
- **AI/fallback:** requires interactive AI (doc 11 Pattern B/C). Fallback: scripted-partner variant — partner turns pre-authored, learner picks/types questions from a bank; outcome grading unchanged (Tier 0 end-to-end).
- **Cost:** $0.03–0.10 per completed task (4–8 turns) [estimated].

### P15 `free_writing`

- **Purpose:** Connected written production against a can-do prompt ("Write 4 sentences about your family") — presentational-mode evidence.
- **Stage:** Late A1 (sentence-frame scaffolded) → A2 (paragraph).
- **Content:** `{ "prompt_l1_key": "…", "prompt_tl": "…", "min_sentences": 4, "target_structures": ["have_has","possessive_s"], "frames": ["I have …", "My … is …"] }`
- **Key:** `{ "rubric_id": "a1_family_write_v2", "rubric": { "task": 0-2, "comprehensibility": 0-2, "target_structures": 0-2 }, "pass": 4, "no_zero": true }`
- **Response:** `{ "text": "…" }`
- **Grading:** Tier 0 pre-checks (length, language-id via character/stopword heuristics, copy-of-prompt, gibberish) → Tier 2 rubric (pinned model+prompt = `grader_version`) → deterministic post-bounds (score clamped; target-structure presence verified by pattern match as a cross-check on the judge). Async.
- **Partial credit:** rubric-proportional; band-gate variant uses curriculum §12 thresholds.
- **Feedback:** per-rubric-line L1 comments + ≤3 corrections shown as recasts (not exhaustive red ink); model answer *after* a passing attempt only [proposed].
- **Hints:** L2 = sentence frames (×0.5); frames auto-offered below A1-mastery threshold.
- **L10n:** rubric feedback in L1 per languagePolicy; prompts localized via doc 13 D5 pipeline.
- **A11y:** min-sentence counter announced; speech-to-text dictation input allowed (flagged in `input_mode` — evidence stays `productive_written` but analytics can segment) [proposed, requires validation].
- **Analytics+:** `rubric_scores{}`, `grader_version`, `human_review_sampled` (5% QA sample at launch [proposed]).
- **Evidence:** `task_can_do`(presentational-written) + `grammar_point` for verified target structures; w=1.0.
- **Review:** error tags → taxonomy; low task scores requeue the prompt family, not the same prompt.
- **AI/fallback:** gateway outage → "submitted, feedback pending" queue; deterministic structure-presence check still returns instant partial feedback. Never a fake grade.
- **Cost:** $0.001–0.003 [estimated].

### P16 `reading_comprehension`

- **Purpose:** Meaning from connected text (uses existing `passages` table, migration 20260729164446:67-86 [observed]): gist + detail questions on an A1/A2 passage.
- **Stage:** Late A1 → A2 (Early A1 uses single-sentence P01/P06 instead).
- **Content:** `{ "passage_id": "uuid", "questions": [{ "id":"q1", "kind":"choice", "stem_tl":"…", "options":[…] }, { "id":"q2", "kind":"true_false" }, { "id":"q3", "kind":"short_answer" }] }`
- **Key:** `{ "q1": {"correct_option":"o2"}, "q2": {"answer":true}, "q3": {"accept":["at seven","seven o'clock"]} }`
- **Response:** `{ "answers": { "q1":"o2", "q2":true, "q3":"at 7" } }`
- **Grading:** Tier 0 throughout (short answers via accept-list with number/word normalization).
- **Partial credit:** per-question; pass ≥ 0.75.
- **Feedback:** per-question verdicts; wrong → the evidence sentence in the passage highlights.
- **Hints:** L2 = highlight the paragraph containing the answer (×0.5).
- **L10n:** passage TL; questions TL at A2, L1-glossed stems at Late A1 [proposed].
- **A11y:** passage TTS playback allowed (flag `heard_passage` on evidence — reading vs listening construct blurs; analytics separates) [proposed].
- **Evidence:** `skill`(reading) `receptive_written` + tested `vocab_item`s; w=1.0.
- **Review:** passage vocabulary failures → FSRS.
- **AI/fallback:** none runtime (passages authored via gauntlet). **Cost:** <$0.0001.

### P17 `listening_comprehension`

- **Purpose:** Meaning from connected speech (dialogue/announcement audio): gist + detail, replay-limited at checkpoint tier.
- **Stage:** Late A1 → A2.
- **Content/Key/Response/Grading:** as P16 with `audio_passage_id` (passages table `skill_type='listening'` + `audio_asset_id` [observed]); transcript in key, revealed post-grade.
- **Partial credit/Feedback/Hints:** as P16; L2 hint = replay only the relevant segment.
- **L10n:** slow-speech variant per doc 11 SSML rate control; voices per doc 13 D9.
- **A11y:** as P04 accommodation route.
- **Evidence:** `skill`(listening) `receptive_aural`; w=1.0.
- **AI/fallback:** cached audio; deterministic. **Cost:** ~$0 marginal.

### P18 `branching_dialogue`

- **Purpose:** *Structured conversation* — the first release stage of the owner's structured→guided→open ladder: a pre-authored dialogue graph where the learner picks (or speaks) each turn from options, seeing consequences of pragmatic choices.
- **Stage:** Early A1 (choice-only) → Late A1 (choice + typed slots).
- **Content:** `{ "graph": { "nodes": [{ "id":"n1", "npc_tl":"Hello! What's your name?", "npc_audio":"…", "choices":[{ "id":"c1","text_tl":"…" },…] }…], "start":"n1" }, "goal_l1_key": "…" }` — all NPC turns pre-generated cached TTS (doc 11 "scripted dialogue" route C [documented]).
- **Key:** `{ "edge_quality": { "n1": { "c1": 1.0, "c2": 0.5, "c3": 0 } }, "success_nodes": ["n9"], "optimal_path_len": 5 }` (choice quality server-side so the client can't rank options).
- **Response:** `{ "path": [{ "node":"n1", "choice":"c1" }…] }` (submitted whole, or per-turn for long graphs).
- **Grading:** Tier 0: reached success node? path quality = mean edge quality.
- **Partial credit:** quality mean; pass = success node + quality ≥ 0.7.
- **Feedback:** end-of-dialogue replay of weak turns with the better option shown and why (L1).
- **Hints:** L2 = eliminate the worst choice (×0.5).
- **L10n/A11y:** defaults; per-turn audio; dialogue fully keyboard-driven.
- **Analytics+:** `path`, `dead_end_hits`, per-node dwell.
- **Evidence:** `chunk` `receptive` + `task_can_do`(interpersonal-scripted) w=0.6 — deliberately discounted: recognition-among-options, not free production (owner rule: recognition never proves proficiency).
- **Review:** weak-edge chunks → P03/P13 drills.
- **AI/fallback:** none at runtime — this is the fully deterministic conversation floor (doc 11 route F alignment). **Cost:** ~$0 marginal.

### P19 `roleplay`

- **Purpose:** *Guided conversation*: open-ended spoken/typed interaction in a bounded scenario ("order food", "ask about the schedule") with an AI persona holding a goal checklist. Second release stage.
- **Stage:** Late A1 (heavy scaffold, 4–6 turns) → A2 (8–12 turns).
- **Content:** `{ "scenario_l1_key": "…", "persona": { "role":"cafeteria_worker", "register":"friendly" }, "goal_checklist_l1": ["greet","order","thank"], "scaffold_bar": ["Can I have …?"], "max_turns": 8, "mode": "voice|text" }`
- **Key:** `{ "required_slots": [{ "id":"order_item", "detect":"llm+keyword" }…], "rubric_id": "a2_roleplay_v1", "deviation_policy": "redirect_after_2" }`
- **Response:** conversation transcript reference from the conversation runtime (voice: doc 11 Pattern B; text: same brain, no audio).
- **Grading:** hybrid: slot completion (LLM extraction with keyword fallback — each slot deterministic-checkable in the fallback) + Tier-2 rubric (task, comprehensibility, interaction) with curriculum §12-style anchors. Async.
- **Partial credit:** slots proportion × rubric; pass per authored thresholds.
- **Feedback:** checklist ticks live during the conversation (motivating, non-linguistic); post-task: 2–3 recast highlights + one strength, L1.
- **Hints:** scaffold bar visible at Late A1 (×0.8 [proposed — lighter than L2 since real-time support]); hidden at A2.
- **L10n:** persona speaks TL with SSML-graded rate; learner L1 accepted for repair moves without failing the task at Late A1 (languagePolicy).
- **A11y:** text mode is a first-class equal; captions of NPC speech optional (default on at Late A1, off in checkpoint variant).
- **Analytics+:** `turns`, `slots_filled`, `l1_fallback_turns`, `repair_moves`, latency per doc 11 telemetry.
- **Evidence:** `task_can_do`(interpersonal) `productive_spoken|written` w=1.0; error tags → taxonomy.
- **Review:** unfilled slots → P13/P03 targeted drills within 48 h.
- **AI/fallback:** full AI dependence; fallback ladder: voice → text roleplay → P18 branching version of the same scenario (every roleplay scenario ships with a branching twin — authoring rule [proposed]).
- **Cost:** $0.08–0.20 voice; $0.01–0.04 text [estimated, doc 11 §4].

### P20 `error_correction`

- **Purpose:** Notice and fix errors — editing skill plus explicit-knowledge consolidation ("She **have** a brother" → find it, fix it). Also the delivery vehicle for the learner's *own* recurring error taxonomy items (curriculum §11 layer 5).
- **Stage:** Late A1 → A2 (needs enough grammar to judge); "spot only" variant Early A1.
- **Content:** `{ "sentence_tl": [{ "id":"w1","text":"She" },{ "id":"w2","text":"have" }…], "task": "spot|spot_and_fix", "error_count": 1 }`
- **Key:** `{ "error_tokens": ["w2"], "corrections": { "w2": ["has"] }, "error_tag": "subj_verb_agreement" }`
- **Response:** `{ "selected_tokens": ["w2"], "corrections": { "w2": "has" } }`
- **Grading:** Tier 0: token id match + accept-list on the fix.
- **Partial credit:** spot right + fix wrong = 0.5.
- **Feedback:** rule one-liner in L1 keyed to `error_tag`, + contrast note when the tag matches an L1 transfer pattern.
- **Hints:** L2 = narrow to the clause containing the error (×0.5).
- **L10n/A11y:** defaults; tokens are toggle-buttons in a listbox.
- **Analytics+:** `error_tag`, `spot_hit`, `fix_hit`.
- **Evidence:** `grammar_point` — mode `receptive_written` for spot, `productive_written` w=0.8 for fix (editing ≠ free production).
- **Review:** the primitive is itself the remediation vehicle: generated from the learner's saved error categories; success there closes taxonomy items.
- **AI/fallback:** generation uses the gauntlet; runtime deterministic. **Cost:** <$0.0001.

### P21 `conversational_mission`

- **Purpose:** The product's centerpiece (tasks #14/#16): a multi-turn goal-driven conversation ("You're new — introduce yourself to a classmate and find one thing in common") integrating everything the band taught. *Open conversation* release stage; the unit of interpersonal can-do evidence.
- **Stage:** Late A1 (structured missions with planted supports) → A2 (open missions). Per-band ratios follow the curriculum's 70-80/20-30/0 → shifting split.
- **Content:** `{ "mission_spec_id": "uuid" }` — the mission spec (goal, moves, personas, planted breakdown, scaffolds, exit conditions) lives in the mission tables from task #14 [assumption: schema as drafted], not in `exercises.content`; the exercise row is a pointer so missions sequence inside lessons like any primitive.
- **Key:** `{ "required_moves": […], "rubric_id": "band_gate_interview_v1", "planted_breakdown": { "turn": "~4", "type": "mishearing" } }` (mirrors curriculum §12 spoken-evidence design: task completion / intelligibility / interaction 0–2 each, planted repair test).
- **Response:** mission session reference; the conversation runtime (doc 16 scope) streams turns; `submit-attempt` receives the session-complete event.
- **Grading:** hybrid: move checklist (as P19) + Tier-2 rubric + Tier-1 pronunciation sampling on target phonemes (Azure PA unscripted sample [requires validation — unscripted PA is weaker than scripted]); async; **band-gate variants require rubric calibration against human raters before any gate decision uses them** (curriculum §12 [documented]).
- **Partial credit:** per-strand scores surfaced separately (task/intelligibility/interaction) — never collapsed for gate decisions.
- **Feedback:** post-mission debrief: goal outcome, 2 recasts, 1 strength, repair-move replay; L1.
- **Hints:** in-mission scaffolds are mission-spec-defined; their use is recorded and discounts interaction-strand evidence ×0.8 [proposed].
- **L10n/A11y:** as P19; missions always have a text modality.
- **Analytics+:** full doc-11 telemetry + `move_completion`, `breakdown_repaired`, `scaffolds_used`.
- **Evidence:** `task_can_do` `productive_spoken` w=1.0 — the highest-value evidence in the system; feeds band gates (curriculum §12) and never XP-derived claims.
- **Review:** taxonomy harvest is a first-class output; missed moves schedule the P18 twin + P13 drills.
- **AI/fallback:** hard dependency on the conversation runtime (frozen task #16). Fallback = P18 twin (as P19); a mission cannot silently downgrade for *gate* purposes — gates require the real thing or defer [proposed].
- **Cost:** $0.10–0.25 voice [estimated, doc 11 §4.5's ~$0.10–0.20/lesson blended envelope].

### P22 `checkpoint` (cumulative)

- **Purpose:** Band/unit evidence gate (curriculum §12): a composed assessment sampling all four strands (vocab via FSRS state, grammar via adaptive P06/P05/P20 set, spoken via P21 gate-variant, written via P15 gate-variant). Decides unlocks; the *only* primitive whose outcome moves placement.
- **Stage:** end of each unit (mini) and band (full).
- **Content:** `{ "blueprint": { "strands": [{ "strand":"grammar", "item_pool": ["ex-ids"], "adaptive": true, "n": 20, "pass": 0.7, "sub_scores": { "be": 0.7 } }, …] }, "hints_disabled": true, "replay_limits": { "listening": 2 } }`
- **Key:** per-item keys + `{ "pass_logic": "pass|pass_with_review|remediate", "thresholds": … }` implementing curriculum §12 outcomes verbatim.
- **Response:** child attempts, submitted through the same `submit-attempt` under a `checkpoint_session_id`.
- **Grading:** aggregation is Tier 0 over child grades; strand aggregation deterministic and reproducible from stored child attempts (auditability requirement for districts, doc 14 [assumption]).
- **Partial credit:** strand-level; outcomes per pass logic; failed strands re-tested alone.
- **Feedback:** strand report to learner (L1, can-do framed, no letter grades); teacher view gets sub-scores.
- **Hints:** disabled; a11y accommodations (extended time, text-mode) remain and are flagged on the gate record.
- **L10n/A11y:** defaults; accommodations logged.
- **Analytics+:** `gate_outcome`, `strand_scores`, `evidence_basis` (which attempts fed the decision) — the audit trail behind "which evidence gated the decision" (curriculum §12).
- **Evidence:** confirms/updates `task_can_do` and band placement; explicitly **no XP** (learnerProgress XP table untouched by checkpoint outcomes [proposed]).
- **Review:** `remediate` outcome auto-builds the remediation queue (curriculum §11 rules).
- **AI/fallback:** inherits child primitives'; spoken strand requires P21 (no fallback for gates — defer instead).
- **Cost:** $0.15–0.40 full band gate [estimated].

---

## 4. Stage availability matrix (progressive release) [proposed]

| Primitive | Early A1 | Late A1 | A2 |
|---|---|---|---|
| P01 meaning_recognition | ● core | ● | ○ review-only |
| P02 word_retrieval | ● | ● | ● |
| P03 chunk_retrieval | ● | ● | ● |
| P04 listening_selection | ● | ● | ○ |
| P05 sentence_construction | ● | ● | ○ |
| P06 cloze | ● | ● | ● |
| P07 selective_translation | TL→L1 only | ● | ● |
| P08 dictation | word-level | ● | ● |
| P09 transcription | — | scaffolded | ● |
| P10 pronunciation_imitation | ● | ● | ● |
| P11 minimal_pair | ● | ● | ○ |
| P12 read_aloud | — | ● | ● |
| P13 guided_response | late units, scaffolded | ● | ● |
| P14 info_gap | — | structured | ● |
| P15 free_writing | — | framed | ● |
| P16 reading_comprehension | — | ● | ● |
| P17 listening_comprehension | — | ● | ● |
| P18 branching_dialogue | ● (structured stage) | ● | ○ |
| P19 roleplay | — | scaffolded (guided stage) | ● |
| P20 error_correction | spot-only | ● | ● |
| P21 mission | — | structured missions | ● open (open stage) |
| P22 checkpoint | unit-mini | band gate | band gate |

● = available · ○ = de-emphasized · — = not served. Enforced by the composer (§8), authored in band plans.

---

## 5. Unified exercise content contract (JSON Schema) [proposed]

One envelope, validated at authoring time (gauntlet gate G-schema) and at serve time. Stored: `content` → `exercises.content jsonb`; `answer_key`+`grading` → `exercise_answer_keys`. `$defs` per primitive extend the base; excerpted here (full schema is an implementation artifact):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "palavox:exercise-envelope:1.0",
  "type": "object",
  "required": ["schema_version", "primitive", "content", "evidence", "meta"],
  "properties": {
    "schema_version": { "const": "1.0" },
    "primitive": { "enum": ["meaning_recognition","word_retrieval","chunk_retrieval","listening_selection","sentence_construction","cloze","selective_translation","dictation","transcription","pronunciation_imitation","minimal_pair","read_aloud","guided_response","info_gap","free_writing","reading_comprehension","listening_comprehension","branching_dialogue","roleplay","error_correction","conversational_mission","checkpoint"] },
    "content": { "$dynamicRef": "#per-primitive-content" },
    "answer_key": { "$dynamicRef": "#per-primitive-key", "$comment": "NEVER serialized to clients; stored in exercise_answer_keys" },
    "grading": {
      "type": "object",
      "required": ["tier", "pass_threshold"],
      "properties": {
        "tier": { "enum": [0, 1, 2] },
        "pass_threshold": { "type": "number", "minimum": 0, "maximum": 1 },
        "near_miss": { "type": "boolean" },
        "keep_accents": { "type": "boolean" },
        "rubric_id": { "type": "string" },
        "fallback": { "enum": ["none","tier0_only","async_queue","scripted_twin"] }
      }
    },
    "hints": {
      "type": "array",
      "items": { "type": "object", "required": ["level","type"], "properties": {
        "level": { "enum": [1,2,3] }, "type": { "type": "string" },
        "evidence_discount": { "type": "number" } } }
    },
    "localization": {
      "type": "object",
      "required": ["instruction_key"],
      "properties": {
        "instruction_key": { "type": "string" },
        "instruction_audio_l1": { "type": "string" },
        "l1_dependent_fields": { "type": "array", "items": { "type": "string" } }
      }
    },
    "assets": { "type": "object", "properties": {
      "audio": { "type": "array", "items": { "type": "string", "format": "uuid" } },
      "images": { "type": "array", "items": { "type": "string", "format": "uuid" } } } },
    "evidence": {
      "type": "array", "minItems": 1,
      "items": { "type": "object", "required": ["entity","id","mode","weight"], "properties": {
        "entity": { "enum": ["vocab_item","chunk","grammar_point","phoneme_contrast","skill","task_can_do"] },
        "id": { "type": "string" },
        "mode": { "enum": ["receptive_written","receptive_aural","productive_written","productive_spoken"] },
        "weight": { "type": "number", "minimum": 0, "maximum": 1 } } }
    },
    "meta": { "type": "object", "required": ["cefr","difficulty","phase"], "properties": {
      "cefr": { "enum": ["A1","A2"] },
      "difficulty": { "type": "number", "minimum": 0, "maximum": 1 },
      "phase": { "enum": ["warmup","input","controlled","productive","wrap"] },
      "receptive_productive": { "enum": ["receptive","productive"] },
      "grammar_point": { "type": ["string","null"] },
      "target_vocab": { "type": "array", "items": { "type": "string" } } } }
  }
}
```

Contract rules: (1) unknown `primitive` or failed validation → item cannot leave `draft` (gauntlet G-schema); (2) `schema_version` is bumped only additively within 1.x — renderers must tolerate unknown optional fields; (3) `assets` must resolve to `assets` rows with `transcript` populated for audio (needed by G-audio and post-grade reveals); (4) every `l1_dependent_fields` entry must have coverage for a locale before that locale is *enabled* for the lesson (doc 13 D5 tier model).

**Migration of legacy MCQ [proposed]:** backfill script maps each existing exercise + options into a P01/P16-style envelope (`options` into `content` with new opaque ids, `is_correct` row into `answer_key.correct_option`), writes `exercise_answer_keys`, leaves `exercise_options` in place until the old `submit-exercise` path is retired; dual-write window with a parity check (same verdicts from both paths on replayed attempts, §13 T-6).

---

## 6. Grading service architecture

### 6.1 Options

| Option | Shape | Pros | Cons |
|---|---|---|---|
| A. Extend `submit-exercise` in place | grow the existing function | zero migration | 224-line function already interleaves grading with 5 side-effect writes [observed]; per-primitive logic inline would make it unmaintainable and untestable |
| B. **Refactor-extend: `submit-attempt` dispatcher + `_shared/graders/` registry** (recommended) | one endpoint; pure grader modules `grade(content, key, grading, response) → GradeOutcome`; side-effect pipeline (attempt insert → evidence → lesson progress → XP → streak) stays single-writer; async lane for Tier 2 | preserves proven auth (`guardPaidRequest`), key protection, and anti-grind XP logic (submit-exercise/index.ts:173-196 [observed]); graders are golden-vector testable in isolation; one place enforces "evidence only from graded performance" | one function grows a queue/notify concern for async; needs a `get-attempt` companion |
| C. New per-primitive edge functions | `grade-cloze`, `grade-speech`, … | independent deploys | side-effect logic duplicated or shared-lib-drifted across N functions; N× auth surfaces; the current dual-economy mess (wip-01a §XP) shows what parallel writers do to this codebase |

**Recommendation: B.** Rationale: the progress side effects are the crown jewels (server-authoritative, anti-grind) and must have exactly one writer; graders are pure functions and belong in a registry, not in endpoints. Voice-scored attempts (P10/P12/P19/P21) upload audio to a storage bucket and pass the path; `submit-attempt` orchestrates the vendor call (Tier 1) or enqueues (Tier 2) and returns `pending`; completion writes the grade and notifies via Realtime on the user's channel. `grader_version` (code hash for Tier 0/1, model+prompt hash for Tier 2) is stamped on every attempt row for reproducibility and re-grading audits.

### 6.2 Schema deltas [proposed]

`exercise_attempts` + `score numeric CHECK (0<=score<=1)`, `passed boolean`, `hint_level int`, `grader_version text`, `tier int`, `response jsonb`, `graded_at timestamptz`, `status text CHECK (pending|graded|failed)`; keep `is_correct` as a generated alias during migration. New: `exercise_answer_keys` (§2.3), `attempt_evidence(attempt_id, entity, entity_id, mode, weight_applied)` for the doc-05 mastery pipeline.

### 6.3 Async contract

Tier-2 submit → `202 {attempt_id, status:"pending", eta_ms}`; grade lands ≤ p95 8 s; client shows "checking…" then feedback; on gateway failure status becomes `failed` with `fallback` behavior per the item's `grading.fallback` — **never** an optimistic client-side pass (the anti-pattern behind the lesson-complete lie, doc 02 F2-2).

### 6.4 Verdict on the WIP grader [observed via `git show wip/conversation-engine-preplanning:supabase/functions/_shared/gradeAnswer.ts`]

Adopt: `normalizeText` (case/quotes/terminal-punct/whitespace/diacritics), capped Levenshtein, `isNearMiss` (≤1 edit, len ≥4), dictation near-miss exception, `GradeOutcome` shape with informational `score`, matching partial credit. Reject: (1) **keys smuggled through `exercise_options.label`** — `"left::right"` pair encoding and JSON-arrays-in-label are stringly-typed, unvalidatable, and collide with legitimate labels containing `::`; (2) `speaking` graded as normalized-text equality — that grades typing, not speech, and would let a text submission masquerade as spoken evidence (violates the owner's proficiency-claims rule); (3) flat `TEXT_TYPES`/`ORDER_TYPES` sets with no per-primitive schema validation; (4) `translation` near-miss-on-by-default conflates typo with lexical error at sentence length; (5) partial `score` computed but nowhere persisted or fed to mastery. The §5 contract and §6.1 registry supersede it; its text utilities move to `_shared/graders/textUtils.ts` with golden tests.

---

## 7. Renderer architecture

One player, pluggable renderers [proposed]:

- **Shell (`LessonPlayer` v2)** owns: session state machine (`loading → phase intro → item[idle|answering|submitted|feedback] → requeue → summary`), submission via `useAttempt` hook, the single `aria-live` feedback region, progress UI (server-truth: shows `lesson.solved/total` from grade responses, fixing F2-2), hint API, audio service (one `AudioController`: preload, replay, slow-toggle, global stop), and the in-session **retry queue**: failed items requeue once at session end; the summary screen distinguishes "finished this run" from "lesson complete" using the server's `lesson.complete`.
- **Renderer contract:**

```ts
interface PrimitiveRenderer<C = unknown, R = unknown> {
  primitive: string;                     // registry key = contract enum
  Render: React.FC<{
    content: C;                          // client-safe content only
    locale: { l1: string; tl: string; dir: "ltr" | "rtl" };
    audio: AudioController;
    hints: { available: HintSpec[]; request(level: 1|2|3): HintPayload };
    disabled: boolean;                   // post-submit lock
    onDraft(response: R | null): void;   // null = not yet submittable
  }>;
  Feedback?: React.FC<{ outcome: GradeOutcome; content: C; response: R }>; // optional; shell default otherwise
  validateDraft(response: R): boolean;   // enables the submit button
}
```

- Rules: renderers never grade, never receive keys, never call the network (audio via injected controller, submission via shell); adding a primitive = one renderer module + one grader module + one `$defs` entry — **no shell diff** (AC-9). Unknown-primitive fallback: shell shows a localized "this item type is coming soon" card and skips without penalty (forward-compat during rollout), logged `renderer_missing`.
- Registry ships in the main bundle for Wave-1 primitives; heavier renderers (audio recorder, dialogue) are lazy-loaded route chunks [proposed].

---

## 8. Sequencing within a lesson

Deterministic composer (server-side, in `learn-lesson`'s successor) [proposed]:

- **Phases:** `warmup` (2–3 review items via N−2 interleave + FSRS-due, ≥20% of item count — curriculum §11 layer 2) → `input` (new-material presentation: P01/P04/P10 exposures) → `controlled` (P05/P06/P11/P20 on the new material) → `productive` (P02/P03/P13/P18/P19 as band allows) → `wrap` (1 item previewing the lesson's can-do, or the mission pointer).
- **Rules:** S-1 items carry `meta.phase`; composer orders phase-major. S-2 *within* a phase only, adaptive selection may pick among candidates by `|difficulty − ability|` — `orderByAbility`'s whole-lesson sort (learnerProgress.ts:62-72 [observed]) is retired. S-3 receptive-before-productive per entity within a lesson: a `vocab_item` needs ≥2 receptive exposures (this session or prior mastery state) before its first productive item; composer enforces by reordering or substituting. S-4 ≤1 Tier-2 primitive per core lesson at Early A1 (cost + cognitive load [estimated]). S-5 failed items requeue once in-session (shell) and re-enter the interleave pool (server) — completion still requires every published item solved (submit-exercise/index.ts:141 semantics kept), but now the player actually offers the retry.

---

## 9. Item-quality validation gates (contentGauntlet extension)

Existing gates stay (contentGauntlet.ts: `input_budget` :290, `level` :92, `solver` :123, `pedagogy` :152, `bias` :184, `duplicate` :201 [observed]). New gates [proposed]: **G-schema** (envelope validates; deterministic); **G-key-cov** (solver answers cold; for accept-list items all solver answers judged correct must be accepted by the key — catches under-specified accept-lists; for order items solver proposes alternative valid orders → ambiguity fail); **G-audio** (TTS render → STT round-trip → normalized match ≥0.9, plus asset `transcript` present); **G-phoneme** (minimal pairs differ by exactly one phoneme via pronouncing-dictionary lookup; deterministic); **G-l10n** (instruction keys + `l1_dependent_fields` coverage for enabled locales); **G-a11y** (required audio assets for every TL string at A1; image alt text); **G-rubric-sim** (Tier-2 items: judge grades 6 seeded synthetic answers — 2 good/2 borderline/2 bad; scores must rank monotonically; run 3× — variance beyond band fails).

| Primitive | budget | level | solver | pedagogy | bias | dup | schema | key-cov | audio | phoneme | l10n | a11y | rubric-sim |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P01, P16, P17, P18 (choice) | ● | ● | ● | ● | ● | ● | ● | — | P17/P18: ● | — | ● | ● | — |
| P02, P03, P06, P07 (accept-list) | ● | ● | adapted | ● | ● | ● | ● | ● | — | — | ● | ● | — |
| P05, P20 (order/edit) | ● | ● | adapted | ● | ● | ● | ● | ● (ambiguity) | — | — | ● | ● | — |
| P04, P08, P09, P11 (audio) | ● | ● | ● | ● | ● | ● | ● | ● | ● | P11: ● | ● | ● | — |
| P10, P12 (PA) | waived* | ● | — | ● | ● | ● | ● | — | ● | ● | ● | ● | — |
| P13, P14, P15, P19, P21 (AI-graded) | ● | ● | key-cov on patterns | ● | ● | ● | ● | ● | voice: ● | — | ● | ● | ● |
| P22 blueprint | — | — | — | ● (blueprint review) | — | — | ● | children's own | — | — | ● | ● | strand rubrics: ● |

*single words are not connected input — same waiver logic as `INPUT_BUDGET_EXEMPT` (contentGauntlet.ts:288 [observed]). Also required: fix wip-01a F4.3 — any human edit re-runs the gauntlet and demotes status until re-passed [observed defect].

---

## 10. Rollout order (pedagogical value vs build cost)

| Rank | Primitive | Value | Cost | Depends on | Wave |
|---|---|---|---|---|---|
| 1 | P06 cloze | ●●●● first productive practice in product | S | contract, grader registry | 1 |
| 2 | P02 word_retrieval | ●●●● retrieval workhorse + FSRS | S | same | 1 |
| 3 | P05 sentence_construction | ●●●● grammar production w/o spelling | S | token renderer | 1 |
| 4 | P03 chunk_retrieval | ●●● conversation-first chunks | S | P02+P05 machinery | 1 |
| 5 | P01 meaning_recognition | ●● formalizes what exists | S | migration script | 1 |
| 6 | P20 error_correction (spot) | ●●● remediation vehicle | S | token renderer | 1 |
| 7 | P04 listening_selection | ●●●● audio-first A1 | M | cached TTS pipeline (doc 11) | 2 |
| 8 | P11 minimal_pair | ●●● perception base | M | TTS + phoneme registry | 2 |
| 9 | P08 dictation | ●●● decoding | M | TTS + diff UI | 2 |
| 10 | P16 reading_comprehension | ●●● passage reuse | S | passages [observed] | 2 |
| 11 | P17 listening_comprehension | ●●● | M | P16 + audio passages | 2 |
| 12 | P22 checkpoint v1 (deterministic strands only) | ●●●● unit gates without AI | M | Wave-1/2 primitives | 2 |
| 13 | P18 branching_dialogue | ●●●● structured conversation stage, zero AI | M | dialogue renderer, cached TTS | 3 |
| 14 | P10 pronunciation_imitation | ●●●● phoneme evidence | L | Azure PA integration (doc 11) | 3 |
| 15 | P12 read_aloud | ●●● | S after P10 | P10 stack | 3 |
| 16 | P07 selective_translation | ●●● | M | key-cov gate, L1 content pipeline (doc 13 D5) | 3 |
| 17 | P09 transcription | ●● | S after P08 | P08 stack | 3 |
| 18 | P13 guided_response | ●●●● first communicative production | M | Tier-2 lane + async | 4 |
| 19 | P15 free_writing | ●●● presentational-written | M | Tier-2 + rubric calibration | 4 |
| 20 | P19 roleplay | ●●●● guided conversation stage | L | conversation runtime (doc 11 Pattern B; task #16) | 4 |
| 21 | P14 info_gap | ●●● | M after P19 | P19 stack | 4 |
| 22 | P21 mission + P22 full (spoken/written strands) | ●●●●● the product thesis | L | mission runtime + rubric calibration vs humans | 5 |

Waves are strict gates: a wave ships only when its primitives meet §12 acceptance criteria. Wave 1 alone converts the product from 100% MCQ to majority-productive lessons with **zero new vendor dependencies** — highest value-density step available.

---

## 11. Dependencies and risks

**Dependencies:** doc 05 mastery model (evidence weights ratification — §2.8 interface is designed to be ratified/adjusted without re-speccing primitives); doc 11 voice stack (Waves 2–5 audio/PA/conversation routes and their fallback ladder); doc 13 locale registry + gloss tables (G-l10n, P07); task #14 mission schema, task #16 runtime (P21); curriculum band plans (item pools, §12 gate thresholds); doc 15 (audio retention/consent for minors before P10 ships) [assumption: forthcoming].

**Risks:** R1 Tier-2 grader unreliability for minors → mitigations: deterministic floors, human-rater calibration gate (AC-7), 5% QA sampling, `grader_version` re-grade capability. R2 accept-list brittleness (P07/P13) → G-key-cov + production miss-mining (analytics `near_miss`/fail texts reviewed weekly [proposed]). R3 vendor drift (PA/STT scores shift under same audio) → pinned versions, canary audio set replayed nightly [proposed], doc 11 §6 abstraction. R4 scope: 22 renderers → shell contract keeps each renderer small; waves cap WIP. R5 cost creep on AI primitives → S-4 composer cap + doc 11 admission control. R6 a11y/accommodation policy for listening/speaking constructs in districts [requires validation with real district policies before Wave-3 sales claims]. R7 legacy dual-path during migration → parity test T-6 + hard retirement date for old `submit-exercise` path.

---

## 12. Measurable acceptance criteria

- **AC-1 (key protection):** CI contract test over a canary lesson containing all 22 primitives: zero key-material fields in any client-bound payload; grep-class scan of client bundle for `answer_key` references = 0.
- **AC-2 (determinism):** every Tier-0/1 grader passes its golden-vector suite (≥25 vectors/primitive incl. Unicode, RTL, diacritics, empty, adversarial) with bit-identical outcomes across 3 runs and across deploys.
- **AC-3 (latency):** Tier 0 grade p50 < 400 ms / p95 < 1.2 s; Tier 1 p95 < 4 s; Tier 2 p95 < 8 s async, measured on `attempt_graded.latency_ms` over any 7-day window.
- **AC-4 (coverage):** post-Wave-1, ≥50% of served items in Early-A1 lessons are productive-mode (was 0% [observed doc 02 F2-1]); post-Wave-2, every lesson playable start-to-finish with AI gateway disabled except declared Tier-2 items.
- **AC-5 (completion truth):** 0 sessions where the client shows complete while server `lesson_progress.status != 'completed'` (fixes F2-2), verified by paired-event analytics query.
- **AC-6 (hints):** 100% of hinted attempts persist `hint_level`; mastery pipeline shows discounted weights in `attempt_evidence` (join audit query returns 0 violations).
- **AC-7 (AI-grading quality):** before any Tier-2 primitive serves minors: ≥85% binary pass/fail agreement and quadratic-weighted κ ≥ 0.7 against a ≥200-item double-human-rated set per rubric; re-verified per `grader_version` change [requires validation infrastructure].
- **AC-8 (fallbacks):** chaos test with AI gateway forced down: 16/22 primitives fully functional; the 6 AI-dependent ones display their declared fallback within one interaction; zero fake grades.
- **AC-9 (extensibility):** primitives #2 and #3 shipped after the shell each touch only renderer + grader + schema (verified in PR review; no `LessonPlayer` shell diff).
- **AC-10 (gauntlet):** every non-draft item has `gate_results` for all gates applicable per §9 matrix; human edit → status demotion observed in an audit query (closes wip-01a F4.3).

## 13. Deterministic test designs

- **T-1 Golden vectors:** per grader, JSON fixtures `{content, answer_key, grading, response, expected: GradeOutcome}` run in Deno test; fixtures are the normative spec of grading behavior; failures block deploy.
- **T-2 Key-leak contract test:** serialize canary `learn-lesson` responses; assert-absent set {`answer_key`,`is_correct`,`rationale`,`transcript` (pre-grade listening),`edge_quality`,`partner_card`,`solution*`,`accept*`,`correct_option`}.
- **T-3 Property tests:** `normalizeText` idempotence; near-miss bounds (never accepts distance>1 or key len<4); partial-credit monotonicity (superset of correct blanks never scores lower); token-order grading invariant under token-id relabeling.
- **T-4 Seeded-shuffle test:** option shuffling with injected RNG seed produces stable order (removes flake from renderer tests).
- **T-5 Gauntlet unit tests:** mock `chatJson`/`embed` (canned verdicts) → each gate's pass/fail logic tested deterministically; G-schema and G-phoneme need no mocks.
- **T-6 Migration parity:** replay 1,000 recorded legacy MCQ attempts through old `submit-exercise` and new `submit-attempt`; verdict parity 100%.
- **T-7 Async replay:** Tier-2 queue integration test with a stub grader: submit → pending → graded → Realtime event, incl. failure path → `failed` + fallback surfaced.
- **T-8 A11y scripts:** per renderer: axe-core clean; scripted keyboard-only completion; screen-reader label snapshot.
- **T-9 Composer tests:** fixed item pool + fixed mastery state → byte-identical lesson sequence; S-1..S-5 rule assertions (e.g., productive-before-receptive violation impossible).
- **T-10 E2E deterministic lesson:** seeded lesson of Wave-1 primitives, scripted answers → exact expected `exercise_attempts`, `attempt_evidence`, `lesson_progress`, XP rows (extends the existing server-authoritative invariants observed in submit-exercise/index.ts:173-201).

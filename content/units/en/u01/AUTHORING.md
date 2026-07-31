# Unit 1 authoring guide — schema v0.1 (Phase 0 slice)

Audience: author agents writing lesson files for `content/units/en/u01/`.
Source of truth: `content/schema/authoring-v0.1.schema.json` + `content/schema/unit.schema.json`
(implementing the lesson/exercise/vocab subset of the unified schema in
`docs/palavox-overhaul-plan/wip-07-08-consistency-report.md` §2). Curriculum content comes from
`docs/palavox-overhaul-plan/wip-curriculum-en-early-a1.md` §15 (U1 lesson list) and §13a (the
calibration exemplar). **Quality over quantity: every item must be pedagogically real, never filler.**

## Files

- `unit.json` — unit manifest. `lessons: []` order is load-bearing: it sets lesson positions
  AND the cumulative vocabulary boundary (a lesson may only use words taught in itself or earlier).
- `EN-U01-Lnn.json` — one file per lesson, name must match the `id` inside.

## Lesson shape (all required unless marked ?)

| Field | Rule |
|---|---|
| `id` | `EN-U01-Lnn` |
| `title`, `objective` | learner-facing; objective = one line |
| `skill_type` | `vocab\|grammar\|reading\|listening\|speaking\|writing` (DB skills CHECK) |
| `position` | must equal its 1-based index in `unit.json` `lessons` |
| `est_minutes` | integer; band target 8–18 (validator warns outside) |
| `intro_md` | rendered in learner's L1; `{{l1_contrast:<id>}}` slots allowed |
| `status`? | only `draft` in Phase 0 |
| `vocabulary_refs` | lemmas recycled from EARLIER lessons (must resolve there) |
| `new_vocabulary` | items taught here: `lemma, pos, cefr_level, example_sentence, ipa?, translations:{es: required, …}` |
| `exercises` | 6–14, warm-up ramp (first `difficulty` ≤ last), each 0–1 |

Exercise `type` is exactly the DB CHECK list: `flashcard, cloze, matching, ordering, dictation,
listening_mc, speaking, translation, dialogue`.

Conventions in `prompt`: `[L1: …]` renders in the learner's L1; `[audio, 0.75x]` is an audio
stage direction; `{slot}` marks a fill-in. Bracketed/`{}` text is NOT vocab-checked — everything
else the learner sees is.

Per-type requirements (gate **G-keys**):
- every exercise: `rationale` (why this item exists — no rationale, no item);
- options (any type that has them, required for `listening_mc`): **exactly one** `is_correct: true`,
  and that option MUST carry a `rationale` (distractor rationales: warned if missing — write them);
- `ordering`: `tokens` + `key`, tokens must re-assemble into key; `cloze`: `keys` matching the
  number of `___` blanks (put learner-visible wrong choices in `distractor_bank`); `matching`:
  `pairs`; `dictation`: `key`; `speaking`: use `expected_pattern` + `asr_focus`.
- `receptive_productive`: `receptive|productive|receptive_to_productive` (the third is authoring-
  level FSRS semantics; seeding collapses it to `productive` until the DB CHECK is extended).

## Deterministic gates (run before you hand off)

```
node tools/content-pipeline/validate.mjs content/units/en/u01        # gates + JSON report
node tools/content-pipeline/seed-gen.mjs content/units/en/u01        # writes content/seed/u01-seed.sql (PREPARED, NOT APPLIED)
```

- **G-schema** shape; **G-keys** answer-key integrity; **G-counts** 6–14 exercises/lesson, unit
  vocabulary within `vocab_budget` (110 for U1); **G-difficulty** range + warm-up ramp.
- **G-vocab-boundary**: every content word in prompts/options/tokens/keys/pairs/distractors/
  expected_pattern must be in {this + prior lessons' `new_vocabulary`} ∪ a ~190-word function-word
  allowlist (grammatical words + contractions only — greetings, politeness items, numbers and day
  names are TAUGHT vocabulary, not allowlisted). Mid-sentence capitalized names (Ana) are exempt
  but reported. If the gate flags a word, either teach it, recycle it properly, or rewrite.
- AI-judged gates (solver, pedagogy rubric, bias screen, level classifier in
  `supabase/functions/_shared/contentGauntlet.ts`) are **not** run locally — they remain
  *requires validation* for this slice and run after seeding.

## Calibration exemplar (band file §13a, re-expressed in v0.1)

The full machine-checked version of this exemplar lives in
`tests/server-pure/contentPipeline.test.ts` (fixtures `L01`/`L05` — kept green by CI).
Abbreviated here; match this bar, not the minimum that passes:

```json
{
  "id": "EN-U01-L05",
  "title": "Where Are You From?",
  "skill_type": "speaking",
  "position": 5,
  "objective": "Ask and answer Where are you from? with I'm from + country.",
  "est_minutes": 13,
  "intro_md": "[L1: In this lesson you learn to ask and answer \"Where are you from?\" …]\n{{l1_contrast:copula_be}}",
  "status": "draft",
  "prerequisites": ["EN-U01-L03", "EN-U01-L04"],
  "vocabulary_refs": ["name", "nice", "meet", "What's your name?", "Nice to meet you."],
  "new_vocabulary": [
    { "lemma": "country", "pos": "noun", "cefr_level": "A1",
      "example_sentence": "Mexico is a country.", "ipa": "/ˈkʌntri/", "translations": { "es": "país" } },
    { "lemma": "Where are you from?", "pos": "chunk", "cefr_level": "A1",
      "example_sentence": "Where are you from? I'm from Brazil.", "translations": { "es": "¿De dónde eres?" } },
    { "lemma": "I'm from…", "pos": "chunk", "cefr_level": "A1",
      "example_sentence": "I'm from China.", "translations": { "es": "Soy de…" } },
    { "lemma": "Mexico", "pos": "noun", "cefr_level": "A1",
      "example_sentence": "She's from Mexico.", "translations": { "es": "México" } }
  ],
  "exercises": [
    { "seq": 1, "type": "flashcard",
      "prompt": "country · Where are you from? · I'm from… · Mexico · Brazil · China",
      "difficulty": 0.2, "receptive_productive": "receptive_to_productive", "timing_s": 180,
      "rationale": "Establish form-meaning link with audio before any production." },
    { "seq": 2, "type": "listening_mc",
      "prompt": "[audio, 0.75x] 'She's from Mexico.' — [L1: Where is she from?]",
      "difficulty": 0.2, "receptive_productive": "receptive", "timing_s": 40,
      "rationale": "Comprehension of 'from + country' in connected speech.",
      "options": [
        { "label": "Mexico", "is_correct": true, "rationale": "Heard after 'from'." },
        { "label": "Brazil", "is_correct": false,
          "rationale": "Distractor: also taught this lesson; forces listening, not guessing." },
        { "label": "She's", "is_correct": false,
          "rationale": "Catches learners matching first word heard, not meaning." }
      ] },
    { "seq": 4, "type": "cloze",
      "prompt": "A: Where ___ you from?  B: I'm ___ Brazil.",
      "keys": ["are", "from"], "distractor_bank": ["is", "am", "in", "of"],
      "difficulty": 0.4, "receptive_productive": "productive", "timing_s": 60,
      "rationale": "Targets copula agreement (are) and the preposition; 'in/of' catch L1 preposition transfer (es: 'de', zh: '从')." },
    { "seq": 5, "type": "ordering",
      "prompt": "[L1: Put the words in order.]",
      "tokens": ["from", "where", "you", "are", "?"], "key": "Where are you from?",
      "difficulty": 0.4, "receptive_productive": "productive", "timing_s": 45,
      "rationale": "Inversion practice; predicted zh/vi error is 'Where you are from?' — feedback names the moved word." },
    { "seq": 9, "type": "dialogue",
      "prompt": "[L1: Have a short conversation: say hello, give your name, and say where you are from.]",
      "difficulty": 0.6, "receptive_productive": "productive", "timing_s": 120,
      "rationale": "Integrates L01+L03+L05 chunks in real time; counts toward guided-interaction minutes.",
      "ai_interaction_ref": "EN-U01-L05-DLG" }
  ]
}
```

What makes this the bar: distractors encode *predicted L1-specific errors* with a written reason;
difficulty ramps 0.2 → 0.6; recycled chunks come with `vocabulary_refs`; the dialogue exists for
guided-interaction minutes, not decoration. If you cannot write the rationale, cut the item.

## Honest-state notes

- Seeding output is a **prepared file only** (`content/seed/u01-seed.sql`, header `PREPARED,
  NOT APPLIED`, all rows `status='draft'`, deterministic md5 UUIDs + `ON CONFLICT DO NOTHING`).
  Applying it is an **owner action**.
- `translations.es` → `vocabulary.translation_l1`; other L1 translations are authored but NOT
  seeded until the `vocabulary_translations` table lands (plan 13) — TODO emitted in the SQL.
- `prerequisites`, `can_do_refs`, `grammar_refs`, `pron_refs`, `ai_interaction_ref` are
  authoring-only metadata for tables that don't exist yet; they are validated for shape but
  not seeded.

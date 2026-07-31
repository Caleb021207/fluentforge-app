# Palavox content pipeline

Deterministic, dependency-free tooling that takes authored lesson JSON from
`content/units/<lang>/<unit>/` through the **content gauntlet** and (once a unit
passes) into a **prepared, not-applied** seed file.

| Script | Role |
| --- | --- |
| `validate.mjs` | Runs the deterministic gauntlet gates against a unit directory; emits a deterministic JSON report. Exit `0` all pass · `1` failures · `2` usage/IO error. |
| `seed-gen.mjs` | After a unit validates, generates idempotent `PREPARED, NOT APPLIED` seed SQL with deterministic md5 UUIDs. Refuses to run on a unit with missing/unparseable files. |

```bash
node tools/content-pipeline/validate.mjs content/units/en/u01                 # gates + JSON to stdout
node tools/content-pipeline/validate.mjs content/units/en/u01 --out report.json
```

No npm dependencies. The JSON-Schema check is a hand-rolled subset interpreter
(`validate.mjs` §"JSON Schema subset checker") that throws on any keyword it does
not implement, so the schema files can never silently promise validation the
validator skips.

---

## Gate matrix (plan 06 §E7 / §9)

The gauntlet has two tiers. **Deterministic** gates run here, offline, with no
model or network access — they are the local pre-flight every lesson must clear
before it costs a model call. **AI-/pipeline-judged** gates are *declared* by the
runner (`summary.gate_declaration`) but not run locally; they need model access,
a voice pipeline, or a seeded DB with embeddings, and every finding they produce
is `[requires validation]` until staging exists.

### Deterministic — run by `validate.mjs` (9)

| Gate | What it enforces | Scope / notes |
| --- | --- | --- |
| **G-schema** | Lesson/unit shape conforms to `content/schema/authoring-v0.1.schema.json` + `unit.schema.json`. | Hand-rolled JSON-Schema subset. |
| **G-schema-strict** | Every `exercise.type` is in the **DB CHECK** list (`public.exercises.type`). | Pinned to migration `20260729164446` in `DB_EXERCISE_TYPES`, **independently of the schema enum** — a drift backstop: if the authoring enum is ever loosened, a value the DB would reject at INSERT is still caught pre-seed. Runs even when G-schema fails. A vitest test pins the set to the migration text. |
| **G-keys** | Per-type answer-key **structure**: exactly one correct option + a rationale on it; ordering tokens re-assemble the key; matching pairs; cloze blank/key parity; every exercise carries a pedagogical rationale. | Structural axis. |
| **G-key-coverage** | Per-type answer-key **coverage**: every gradable item exposes ≥1 accepted key / correct option so it is answerable at all. | Coverage axis, complements G-keys. **Net-new catch vs G-keys: `translation`** (which G-keys never inspects) — an under-specified translation accept-list (plan 06 R2) would otherwise ship silently. `flashcard`/`speaking`/`dialogue` are *declared exempt* (reveal / ASR / AI-graded). |
| **G-vocab-boundary** | Every learner-visible content word is in the unit's cumulative allowed-lemma set (`new_vocabulary` of this + prior lessons + a curated function-word allowlist). | Stricter than an unknown-ratio budget: target is **0** unmapped content words. Mid-sentence proper nouns are exempted and reported. |
| **G-counts** | 6–14 exercises per lesson; unit `new_vocabulary` within `vocab_budget`. | `est_minutes` band 8–18 warns, does not fail. |
| **G-difficulty** | Every `difficulty` in `[0,1]`; first exercise ≤ last (warm-up ramp). | |
| **G-l10n** | l10n-completeness (slice policy): every `new_vocabulary` item has a **non-blank** translation for each enabled L1 (`es` today, `ENABLED_L1_LOCALES`). | Stronger than the schema's `required:["es"]` + `minLength:1`, which a whitespace-only value would satisfy; here the value is trimmed. Broader plan-06 G-l10n (instruction keys + every `l1_dependent_field` × every enabled locale) lands with the doc-13 locale registry. |
| **G-a11y** | Every item that **presents audio** (its prompt carries an `[audio …]` marker) is answerable without hearing it: a written stand-in exists inline (the quoted transcript surviving stage-direction stripping, or a readable `expected_pattern`). | A listening/speaking item with no `[audio]` marker presents no stimulus audio and is answerable from its readable prompt/options by construction, so it is not scanned. When no inline stand-in exists, a `TODO_audio` note naming the exercise is the accepted 0.7 fallback (asset pending) → warning, not fail; neither → hard fail. **Image-alt-text (plan-06 §9) is N/A**: schema v0.1 has no image field. |

### AI-/pipeline-judged — declared, not run (`[requires validation]`)

Emitted under `summary.gate_declaration.declared`.

| Gate | What it will check | Runs once… |
| --- | --- | --- |
| **G-audio** (audio round-trip) | TTS render → STT → normalized match ≥ 0.9, and asset `transcript` present. | the doc-11 voice pipeline (TTS + STT routes) exists in staging. |
| **G-phoneme** (phoneme-distance) | Minimal pairs differ by **exactly one** phoneme via a pronouncing-dictionary lookup. *Deterministic in principle*, but has **no runnable items** — schema v0.1 has no `minimal_pair` primitive — and would need a bundled pronouncing dictionary (barred: no new deps). | the `minimal_pair` primitive (plan 06 P11) ships and a dictionary asset is vendored. |
| **G-rubric-stability** | Tier-2 judge grades 6 seeded synthetic answers (2 good / 2 borderline / 2 bad); scores must rank monotonically; run 3× — variance beyond band fails. | model access + Tier-2 grader exist; gates on minors also need human-rater calibration (plan 06 AC-7). |
| **solver** | Blind LLM solver must reach the keyed answer (catches ambiguous keys/distractors). | model access; runs post-seed. |
| **pedagogy** | Rubric /20: coherence, objective alignment, distractor quality, single-point-of-failure. | model access. |
| **bias** | Cultural-sensitivity / bias screen. | model access. |
| **level** | Flesch-Kincaid ceiling + independent CEFR classifier vs the target band. | model access. |
| **duplicate** | Embedding cosine < 0.92 vs existing content. | content is seeded and embeddings exist. |

The five model gates (`solver`/`pedagogy`/`bias`/`level`/`duplicate`) already
exist in `supabase/functions/_shared/contentGauntlet.ts`; wiring is: **seed the
unit (prepared SQL, owner-applied) → run contentGauntlet against the seeded rows →
fold its verdicts into this report's per-lesson `gates` map**. Until then the
deterministic pass-rate is an **upper bound** on the true gauntlet pass-rate.

> **`input_budget` (deterministic, not ported here).** contentGauntlet's
> `inputBudgetGate` caps the unknown-content-word ratio at ≤ 30%. It is
> deterministic and could live locally, but **G-vocab-boundary already enforces a
> strictly stronger 0-unmapped-content-word rule**, so porting it would be
> redundant. Documented here so the omission is a decision, not a gap.

---

## Authoring conventions the gates rely on

- `[L1: …]` = renders in the learner's L1; `[audio, 0.75x]` = play instruction.
  Bracketed `[…]` segments and `{slot}` placeholders are **excluded** from
  G-vocab-boundary scanning and from the G-a11y stand-in test.
- The spoken line of an audio item is written as a **quoted transcript in the
  prompt** (e.g. `[audio] 'Hello!' — [L1: …]`); that quoted text is the a11y
  stand-in. `notes` carries a `TODO_audio:` line enumerating the exercises whose
  recordings are not yet produced.
- `receptive_to_productive` is authoring-level; seed-gen maps it to the DB's
  `productive` with a TODO. `translations.es` maps to `vocabulary.translation_l1`
  until the doc-13 `vocabulary_translations` table lands.

## Adding a gate

1. Add a pure `gateX(lesson[, …])` function in `validate.mjs` returning
   `gate(pass, detail, extra)`; export it.
2. Wire it into `validateUnit` (inside the `schemaErrors.length === 0` block
   unless it is a schema backstop like G-schema-strict).
3. If it is deterministic, add its name to `GATE_DECLARATION.deterministic`;
   otherwise add a `declared` entry whose text ends `[requires validation]`.
4. Add pass **and** fail vitest vectors in
   `tests/server-pure/contentPipeline.test.ts`. If the gate is pinned to a DB
   constraint, add a test that reads the migration and asserts the pin matches.

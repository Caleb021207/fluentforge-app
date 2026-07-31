# WIP 2.4 — Content-pipeline productionization + gauntlet extension

Workstream 2.4 · 2026-07-30 · branch `exec/overhaul`
Scope: extend the deterministic content gauntlet (`tools/content-pipeline/validate.mjs`)
with the deterministic subset of the seven new plan-06 §E7/§9 gates, declare the
AI-judged remainder, document the full gate matrix, and re-measure Unit 1.

State labels: **[observed]** measured directly · **[implemented]** code written + unit-tested ·
**[validated-locally]** run against the real u01 slice · **[requires validation]** needs
model / voice-pipeline / seeded-DB access · **[requires production apply]**.

Builds on 0.7 (`wip-0.7-slice-report.md`): U1 stood at 17/18 (94.4%) under the five
original deterministic gates.

---

## 1. Gates added [implemented]

Four new **deterministic** gates now run in `validate.mjs` (total deterministic: 9). The
task's brief fixed exactly this subset; the other three of the seven §9 gates are AI-/pipeline-
judged and are **declared, not run** (§4).

| New gate | Enforces | Net-new value over existing gates |
| --- | --- | --- |
| **G-schema-strict** | every `exercise.type` ∈ the DB CHECK list, pinned to migration `20260729164446` in `DB_EXERCISE_TYPES` **independently of the authoring-schema enum** | drift backstop: if the schema enum is loosened, a value the DB rejects at INSERT is still caught pre-seed. Runs even when G-schema fails. A vitest test pins the set to the migration text. |
| **G-key-coverage** | every gradable item exposes ≥1 accepted key / correct option (coverage axis) | **catches `translation` items, which G-keys never inspects** — a keyless translation currently passes G-keys silently. `flashcard`/`speaking`/`dialogue` declared exempt (reveal/ASR/AI). |
| **G-l10n** | every `new_vocabulary` item has a **non-blank** `es` translation | stronger than schema `required:["es"]` + `minLength:1`, which a whitespace-only value satisfies (G-l10n trims). |
| **G-a11y** | every item that presents audio (`[audio …]` in the prompt) has an inline written stand-in so it is answerable without hearing it | catches audio items with no transcript; `TODO_audio` note is the accepted 0.7 fallback (→ warning). Image-alt N/A (no image field in v0.1). |

Design correction made during implementation [observed]: an early cut scoped G-a11y to
*types* `listening_mc`/`dictation`/`speaking`, which false-flagged (a) register-choice
`listening_mc` items with no audio (L01 ex5) and (b) single-letter spelled transcripts
`'E'`, `'H-E-L-L-O'` (L02) that the vocab tokenizer drops as 1-char tokens. Final scope is
**marker-based** (`[audio` in the prompt) with a raw-alnum stand-in test, so both classes pass
cleanly with **zero** reliance on the `TODO_audio` fallback.

## 2. Unit 1 re-measurement [validated-locally]

`node tools/content-pipeline/validate.mjs content/units/en/u01`

**Pass rate: 17/18 (94.4%) — unchanged.** No u01 lesson fails any **new** deterministic gate.

| Gate | Passed / 18 |
| --- | --- |
| G-schema · G-schema-strict | 18 · 18 |
| G-keys · G-key-coverage | 18 · 18 |
| G-vocab-boundary | 17 (L12) |
| G-counts · G-difficulty | 18 · 18 |
| G-l10n · G-a11y | 18 · 18 |

Evidence, 170 exercises / 106 vocab items:
- **G-a11y:** 49 audio-bearing exercises scanned; **0** fell back to `TODO_audio` — every
  audio item carries its transcript inline (the 0.7 convention held under audit).
- **G-key-coverage:** all **4** `translation` items are keyed (the newly-covered gap is clean
  in u01); 49 items correctly exempted (18 flashcard + 13 speaking + 18 dialogue).
- **G-l10n:** **106/106** new_vocabulary items have a non-blank `es` translation.

**Only failure: `EN-U01-L12` G-vocab-boundary** — `"sara"`/`"com"` from the literal
`sara@email.com` (ex seq 3). This is the **pre-existing** 0.7 finding (a tokenizer blind spot
on email literals, judged band-sanctioned, disposition owner-pending), **not** introduced by
2.4. Not fixed here: it is outside this workstream's gate set and its disposition is already
recorded in `wip-0.7-slice-report.md` §3. No new deterministic violation exists to fix.

Committed artifact: **`content/units/en/u01/validation-report.json`** (deterministic, no
timestamps; byte-identical on regeneration).

## 3. Full gate matrix documented [implemented]

`tools/content-pipeline/README.md` now carries the complete matrix: the 9 deterministic gates
(run offline) vs the AI-/pipeline-judged gates (declared), each with its scope and the
condition under which it becomes runnable. The runner also emits the matrix at
`summary.gate_declaration` in every report.

## 4. AI-/pipeline-judged gates — declared, not run [requires validation]

`summary.gate_declaration.declared`: **G-audio** (TTS→STT round-trip; needs the doc-11 voice
pipeline), **G-phoneme** (deterministic in principle but no `minimal_pair` primitive in schema
v0.1 and no vendored pronouncing dictionary — no new deps), **G-rubric-stability** (Tier-2
judge variance; needs model access + human-rater calibration for minors), and the five existing
`contentGauntlet.ts` model gates (**solver, pedagogy, bias, level, duplicate**). Wiring, once
staging exists: owner applies the prepared seed → run contentGauntlet on the seeded rows → fold
verdicts into this report's per-lesson `gates`. The deterministic 94.4% remains an **upper
bound** on the true gauntlet pass-rate until these run. `input_budget` is deterministic but
**not ported**: G-vocab-boundary already enforces a strictly stronger 0-unmapped rule (decision,
not gap).

## 5. Verification [observed]

- `npx vitest run` — **377/377** green (18 files); `contentPipeline.test.ts` **28 → 49** (21
  new vectors: pass+fail per new gate, the migration-pin test, the translation gap, the
  whitespace-`es` case, the a11y single-letter/register/fallback cases, `todoAudioCoversSeq`,
  and the declaration).
- `npx tsc -p tsconfig.app.json --noEmit` — clean.
- `node tools/db-harness/apply-migrations.mjs --from 20260211` — **19/19** green (confirms the
  G-schema-strict pin references an intact, applied `20260729164446`).
- `deno check` — N/A (no edge function touched).

## 6. Residual risks

1. Pre-existing L12 email-literal violation stands (0.7 disposition, owner-pending) — 2.4 leaves
   it untouched by design.
2. The four new gates are **[validated-locally]** on one 18-lesson unit; they have not seen a
   second unit or an adversarial fixture beyond the added test vectors.
3. G-phoneme is declared deterministic but is **unrunnable** until the `minimal_pair` primitive
   and a pronouncing-dictionary asset exist — do not count it as covered.
4. The AI half of the gauntlet is still unrun; the Phase-0 "measured gauntlet pass-rate" exit
   metric remains half-measured (§4) — **[requires validation]**.

## 7. Draft LEDGER lines

- `2.4 content-gauntlet extension: +4 deterministic gates (G-schema-strict, G-key-coverage,`
  `G-l10n, G-a11y) in validate.mjs; u01 re-measured 17/18 (unchanged, no new violation);`
  `AI gates declared not-run. [validated-locally]`
- `2.4 G-schema-strict pins exercise types to public.exercises.type CHECK (mig 20260729164446),`
  `independent of the schema enum; drift guarded by a migration-reading vitest test. [implemented]`
- `2.4 gate matrix documented (tools/content-pipeline/README.md); validation-report.json`
  `committed as the u01 deterministic artifact. [implemented]`
- `2.4 verification: vitest 377/377 (contentPipeline 28→49), tsc clean, harness 19/19. [observed]`

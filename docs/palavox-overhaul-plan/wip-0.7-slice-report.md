# WIP 0.7 — Unit 1 Vertical Content Slice: Validation + Measurement Report

Workstream 0.7c (slice validation) · 2026-07-30 · branch `exec/overhaul`
Scope: measure the authored U1 slice against the deterministic gauntlet, prepare the seed
file, and cross-check the curriculum contract — per plan 17 Phase 0 ("vertical content slice:
1 ESL unit (U1) through authoring schema → gauntlet → seeded → playable; measured gauntlet
pass-rate, h/lesson actuals").

State labels used: **[observed]** measured directly · **[estimated]** derived, method stated ·
**[requires validation]** cannot be confirmed from this workstream · **[owner action required]**.

---

## 1. Items authored [observed]

| Metric | Value | Contract | Verdict |
| --- | --- | --- | --- |
| Lessons | 18 (`EN-U01-L01`…`L18`) | 18 per band file §2/§15 | match |
| Exercises | 170 (6–14/lesson band: min 8, max 11) | 6–14 per lesson | in band |
| New vocabulary | 106 items | budget 110 (§4, unit.json) | under budget |
| est_minutes | 227 total (9–16/lesson) | 8–18 band | in band |
| Dialogue (interaction-bearing) exercises | 18 across 15 lessons | see §5 | partial — see §5 |

Exercise type distribution [observed]: listening_mc 40 · cloze 31 · matching 24 · flashcard 18 ·
ordering 18 · dialogue 18 · speaking 13 · dictation 4 · translation 4. All 9 schema types except
none unused — every DB CHECK type appears. Every exercise carries a rationale; **zero**
missing-distractor-rationale warnings (the validator lints these) — a strong signal the
quality-over-quantity bar was applied, not just the schema minimum.

## 2. Deterministic-gauntlet results

**First run as received by 0.7c [observed]: 17/18 lessons pass (94.4%).**
Per-author first-run rates are **not observable** — `content/` is untracked (no per-file
history) and authoring transcripts were not available to this workstream. The 94.4% figure is
the honest measurable proxy: the state the authoring wave handed off.

| Gate | Passed | Failed |
| --- | --- | --- |
| G-schema | 18 | 0 |
| G-keys (answer-key integrity) | 18 | 0 |
| G-vocab-boundary | 17 | 1 (L12) |
| G-counts | 18 | 0 |
| G-difficulty (range + warm-up ramp) | 18 | 0 |

**Final state: unchanged — 17/18.** Per the 0.7c mandate ("fix nothing except trivial
mechanical schema violations") the single violation is reported, not patched (§3). Unit-level
manifest errors: 0. Full machine report: run
`node tools/content-pipeline/validate.mjs content/units/en/u01` (deterministic output).

**Mechanical fix applied by 0.7c (disclosed):** `content/units/en/u01/unit.json` did not exist —
the authoring wave produced lesson files only, and both validate.mjs and seed-gen.mjs hard-fail
without the manifest. 0.7c created it as a purely mechanical transcription of the
`tests/server-pure/contentPipeline.test.ts` MANIFEST fixture + band file §15 (id EN-U01,
budget 110, ratios 0.78/0.22/0.0, course en-esl-a0-a2) + the 18 lesson filenames in §2 order.
No pedagogical judgment was exercised. Process gap for bulk authoring: the manifest must be an
explicit authoring deliverable.

## 3. Violations remaining, with judgments

1. **L12 (`EN-U01-L12`, "Filling In a Form"), exercise seq 3 (matching), G-vocab-boundary:**
   `"sara"` and `"com"` flagged, both from the pair value `sara@email.com`.
   **Judgment: validator blind spot, not bad authoring.** The item teaches form-literacy by
   value-format recognition (`@` + dot = email) — pedagogically real and exactly on-objective
   for L12. The tokenizer splits the email literal into words; lowercase `sara` misses the
   proper-noun exemption and `com` is no word at all. Recommended disposition (owner/0.7a
   choice, not applied here): teach the validator to exempt email/URL literals (e.g. skip
   tokens inside `\S+@\S+` spans) — preferable to rewriting realistic content into
   unrealistic capitalized emails. Until then U1 stands at 17/18 with cause understood.
2. **Warnings (non-blocking) [observed]:** proper-noun exemptions in 12 lessons (recurring cast:
   Ana, Omar, Sara, Tom, Maria, Dan, Eva, Leo, Nina, Dana, Lee, Sam, Diaz, Vancouver) — all
   plausibly intentional persona names; no duplicate-lemma warnings; no missing distractor
   rationales; no est_minutes band warnings.

## 4. Authoring effort vs the plan's ~6 h/lesson estimate

**[estimated — from file mtimes, not transcripts; mtimes capture only the last write]**
17 of 18 lesson files were last written in a 14-minute window (18:57–19:11 local, 2026-07-30),
L12 revised at 20:02 — consistent with parallel AI-agent authoring with one follow-up fix.
Wall-clock for the whole unit ≈ 65 min end-to-end, i.e. **≈ 4 min/lesson wall-clock** vs the
plan's 6 h/lesson conventional-staffing figure (plan 17 explicitly prices Phase 0 assuming
conventional staffing; the Option B founder-led AI-accelerated path is what actually ran).
Honest caveats: (a) elapsed agent compute + prompt-engineering time is not in the mtimes;
(b) the 6 h/lesson figure includes gauntlet remediation and human review that has NOT happened
yet (AI gates unrun, zero human pedagogical review) — so this is a lower bound on true cost,
not a like-for-like comparison. **[requires validation]** against a human-reviewed lesson before
the C1/E-cost model in plan 16 is re-based on it.

## 5. Curriculum cross-check (wip-curriculum-en-early-a1.md)

- **Lesson count + ids vs §2 [observed]: match.** 18/18 ids (`EN-U01-L01`…`L18`), positions
  1–18 in §2 order, titles match the §2 list (L17 drops §2's "(integration)" annotation —
  cosmetic).
- **Vocab vs §4/§15 [observed]: 106 authored ≤ 110 budget.** Per-lesson counts match the §15
  machine map *exactly* (8/4/6/21/9/8/4/0/0/0/12/6/10/10/8/0/0/0). Note: §15's own
  `vocab_count: 110` header disagrees with its per-lesson sum (106) — a pre-existing 4-item
  internal inconsistency in the band file, now surfaced; authors followed the per-lesson map.
- **Interaction rule: partial — judgment, note honestly.** 15/18 lessons embed ≥1 `dialogue`
  exercise (18 dialogue exercises total, each with an `ai_interaction_ref`; L18 carries the
  three-part "Three Introductions" mission set M01A/B/C per §2/§15). The three without —
  L02 (alphabet), L04 (numbers 0–20), L16 (sound lab) — are precisely the §2 lessons with no
  (X) interaction tag; each carries `speaking` exercises instead. So the slice is consistent
  with the curriculum's mode tags, and the *every-unit-embeds-interaction* rule is satisfied,
  but a strict every-lesson-dialogue reading is not met. Flag for the bulk-authoring style
  guide: pick one interpretation before scaling.
- **Runtime gap [observed, honest]:** `dialogue` exercises and the L18 mission exist as typed
  rows + authoring metadata only. `ai_interaction_ref` is NOT seeded (no target table until
  plan 13/Phase 3) and the mission/conversation runtime is Phase 3. The Phase 0 deliverable's
  "→ playable" leg is **not demonstrated** by this workstream: nothing was applied to a
  database and no renderer was exercised. Static exercise types (cloze/matching/ordering/
  listening_mc/flashcard) have a renderer path today; dialogue playback does not.

## 6. What the AI-judged gauntlet still needs to check [requires validation]

Per `supabase/functions/_shared/contentGauntlet.ts`, not run locally (model calls; runs after
seeding). For all 170 exercises:

| Gate | Checks |
| --- | --- |
| solverGate | blind LLM solver reaches the keyed answer (catches ambiguous keys/distractors) |
| pedagogyGate | rubric /20: coherence, objective alignment, distractor quality, single point of failure |
| levelGate | Flesch-Kincaid ceiling + independent CEFR classifier vs A1 target |
| biasGate | cultural sensitivity / bias screen |
| duplicateGate | embedding cosine < 0.92 vs existing content (needs DB/embeddings) |
| inputBudgetGate | deterministic ≤30% unknown-content-word ratio — could be added to the local validator cheaply (recommendation for 0.7a follow-up) |

The deterministic 94.4% is therefore an **upper bound** on the true gauntlet pass rate; the
plan's "measured gauntlet pass-rate" exit metric is only half-measured until these run.

## 7. Seed file stats [observed]

`content/seed/u01-seed.sql` — 733 lines, header **PREPARED, NOT APPLIED**, all rows
`status='draft'` (RLS exposes only `operational`), deterministic md5 UUIDs
(namespace `palavox-content-v0.1`) + `ON CONFLICT DO NOTHING`; regeneration is byte-identical.

| Table | Rows |
| --- | --- |
| courses | 1 |
| units | 1 |
| skills | 5 (vocab, grammar, reading, listening, speaking) |
| lessons | 18 |
| exercises | 170 |
| exercise_options | 103 |
| vocabulary | 106 |
| vocab_lesson_map | 268 |
| **Total** | **672** |

Known lossy mappings (emitted in the SQL header): 18 exercises authored
`receptive_to_productive` collapsed to `productive` (DB CHECK; plan 06/13 TODO); only
`translations.es` seeded to `translation_l1` (multi-L1 awaits `vocabulary_translations`,
plan 13). Applying the file is an **[owner action required]**.

## 8. Test suite [observed]

`npx vitest run`: **188/188 passing (8 files), green.** No tests added by 0.7c (measurement
only); the pipeline suite `tests/server-pure/contentPipeline.test.ts` covers the
validator/seeder used here.

## 9. Go/no-go for bulk authoring (plan 17 Phase 0 exit)

**Recommendation: CONDITIONAL GO — proceed to gauntlet-completion on U1; do NOT start bulk
authoring (Phase 3 scale, ~2,600 ch) yet.**

For: schema + deterministic pipeline held up under a real 18-lesson load (94.4% first-run,
100% G-keys/G-schema); authored content is pedagogically substantive (rationales everywhere,
L1-aware distractors, curriculum-exact vocab); marginal authoring cost is far below plan;
seeding is deterministic and safe-by-status.

Blocking conditions before bulk authoring:
1. Run the AI-judged gauntlet on all 170 U1 items and measure the real pass rate (§6) — the
   Phase 0 exit metric is otherwise unmeasured. **[requires validation]**
2. Demonstrate "playable": owner applies `u01-seed.sql` to a dev/staging DB and a learner
   renders at least the static exercise types end-to-end. **[owner action required]**
3. Human pedagogical spot-review of ≥2 lessons (e.g. L05 vs its §13a exemplar, plus one
   grammar lesson) — zero human review has occurred. **[requires validation]**
4. Close the three process gaps found: unit.json as an authoring deliverable (§2), the
   email-literal validator blind spot (§3), and the every-lesson-vs-every-unit interaction
   interpretation (§5).

Residual risks: single L12 violation stands (understood, disposition pending); effort figures
are lower bounds; dialogue content is inert until Phase 3 runtime; §15 band-file internal
vocab-count inconsistency (110 vs 106) should be corrected at source.

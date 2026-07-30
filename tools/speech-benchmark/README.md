# Beginner-speech benchmark harness (workstream 0.6)

Reproducible WER/CER scoring harness and data contract for the beginner-L2 /
child speech eval set that gates the voice-provider migration
(plan `docs/palavox-overhaul-plan/11-voice-provider-study.md` §5, §6.4, §7 —
"11 §x" below). It implements plan 11 §5.1 **measurement 5** (STT WER
bake-off) and the data contract behind it.

**Status honesty:** this directory contains a *harness*, not results. No
recordings exist yet, no provider has been called, and no benchmark claim is
made anywhere in this tree. The only runnable adapter
(`reference-passthrough`) is a self-test that scores the references against
themselves — labeled NOT A BENCHMARK in every output.

## Layout

```
tools/speech-benchmark/
  manifest.schema.json        # the published data contract (JSON Schema)
  examples/manifest.template.json  # placeholder-only template (no real data)
  src/
    manifest.ts               # types + hand-rolled validator (enforces the contract)
    wer.ts                    # pure WER/CER: normalization, alignment, pooling, equity ratio
    gates.ts                  # 11 §6.4 gate evaluation (pass/fail/insufficient-data)
    run.ts                    # CLI runner: manifest → hypotheses → scores → reports
    adapters/                 # provider adapters (registry; one self-test + three stubs)
  .gitignore                  # results/ and audio never enter git
```

Tests live in `tests/server-pure/wer.test.ts` (vitest; `npm test`).

## How the eval set must be collected (11 §5.2, §5.3)

No vendor publishes beginner-L2 or child WER — this set is the study's core
asset, and it must be **real, consented recordings**. Never synthesize,
pitch-shift, or repurpose production learner audio (the repo has no consent
framework for production audio — doc 15 dependency, defect D16).

Composition targets (11 §5.2):

- **3–4 hours total, two directions:** (a) ESL — speakers whose L1s sample the
  platform's top UI languages (Spanish, Gujarati, Korean, +2), speaking A1/A2
  English; (b) English-L1 speakers producing A1/A2 Spanish.
- **Per speaker:** 20 scripted curriculum utterances (from the
  `wip-curriculum-*` docs), 10 minimal pairs, 2 min spontaneous answers,
  5 code-switched utterances. Include deliberate disfluencies, long
  mid-sentence pauses, and classroom-noise overlays (tag them).
- **Native-adult baseline:** the equity bound needs native-adult recordings
  in *both* languages scored on this same harness — plan the baseline cells
  into recruitment, not as an afterthought.
- **Target N per gated cell:** the harness refuses to report pass/fail for
  any cell (language × adult-L2, per-L1 group, baseline) with fewer than
  **30 clips** (11 §5.1's ≥30-trials convention; `--min-clips` to override
  explicitly — overriding downward weakens the claim and must be flagged in
  any report).
- **Children (8–13):** only under separate guardian consent + child assent;
  the contract makes `guardianConsent: true` mandatory for `ageBand: "child"`.
  If recruitment stalls, ship the adult set first and treat child WER as a
  district-pilot gate (11 §5.2) — do not fake it.
- **References:** human double-transcription with adjudication; phoneme
  annotation on the minimal-pair subset (inter-rater κ ≥ 0.8) — the phoneme
  annotation feeds measurement 6 (PA validity), not this WER harness.
- **Storage:** frozen audio + references live in **private storage**,
  versioned; only the manifest schema and harness code live in git. Audio
  extensions and `results/` are gitignored here as a backstop.

Every clip's manifest entry must carry a consent record
(`speaker.consent.obtained: true`, method, date). A manifest without consent
fields **fails validation and the harness will not run it.**

## How to run

Validate a manifest against the data contract:

```sh
npx tsx tools/speech-benchmark/src/run.ts \
  --manifest path/to/manifest.json --validate-only
```

Harness self-test (NOT a benchmark — scores references against themselves,
all gates forced to insufficient-data):

```sh
npx tsx tools/speech-benchmark/src/run.ts \
  --manifest tools/speech-benchmark/examples/manifest.template.json \
  --provider reference-passthrough \
  --out /tmp/speech-benchmark-selftest
```

A real provider run (once an adapter is implemented and approved):

```sh
DEEPGRAM_API_KEY=… npx tsx tools/speech-benchmark/src/run.ts \
  --manifest /private/eval-set/manifest.json \
  --provider deepgram
```

Outputs per run: `results.json` (per-clip scores, group aggregates, gate
results — contains reference text, treat as private) and `summary.md`.
Plain `node` ≥ 23.6 also works (type-stripping); no dependencies are used.

Unit tests: `npm test` (repo root) runs `tests/server-pure/wer.test.ts`.

## What the gates mean (11 §6.4)

| Gate | Threshold | Meaning |
|---|---|---|
| `wer-en` | ≤ 12% | Pooled WER, adult beginner-L2 English (adult speakers whose L1 ≠ en) |
| `wer-es` | ≤ 14% | Pooled WER, adult beginner-L2 Spanish |
| `equity-en` / `equity-es` | ≤ 1.4× | Every adult-L2 L1 group's WER vs the native-adult baseline WER *measured on the same harness* — the anti-accent-penalty bound |
| `code-switch` | ≥ 85% segment accuracy | Currently always `insufficient-data`: needs segment-level language annotation the manifest doesn't carry yet (pooled WER on `code-switch`-tagged clips is reported as a proxy only) |
| `pa-validity` | r ≥ 0.7 | Azure PA phoneme accuracy vs 2 human expert raters (measurement 6). **Out of this harness's scope** — always `insufficient-data` here until that study runs |

Every gate reports `pass`, `fail`, or `insufficient-data` — never a silent
skip. `insufficient-data` is the honest default: undersized cells, missing
baseline, self-test adapter, or unmeasurable-by-this-harness.

**No-go rule (11 §6.4):** if the STT gate fails for all vendors, the
migration holds and the incumbent stack stays — the pipeline is only as good
as its ASR for accented beginners.

## Owner actions required (nothing below can proceed without them)

1. **Recordings:** approve budget + recruitment for the consented eval set
   (adult cells first; child cells per the guardian-consent rule). Decide
   the compensation disclosed in the consent form.
2. **Consent authority:** counsel review of the consent form (11 §5.3 —
   purpose-limited, vendor list, deletion on request, retention ≤ 24 months)
   before the first recording session. Confirm the COPPA/FERPA position
   (benchmarking is Palavox acting as itself; school-sourced audio out of
   scope).
3. **API keys + accounts:** provider accounts with no-training/zero-retention
   verified *before* any audio is sent (11 §5.3): Deepgram
   (`DEEPGRAM_API_KEY`, `mip_opt_out`), AssemblyAI (`ASSEMBLYAI_API_KEY`,
   training opt-out), OpenAI (`OPENAI_API_KEY`, ZDR endpoints). Azure and
   Speechmatics adapters are future additions per the 11 §2.2 bake-off list.
4. **Approval to implement live adapters:** the shipped deepgram /
   assemblyai / openai adapters are stubs that throw; wiring real network
   calls is a separate, explicitly approved change.
5. **Private storage location** for frozen audio + references (versioned),
   and who holds access.

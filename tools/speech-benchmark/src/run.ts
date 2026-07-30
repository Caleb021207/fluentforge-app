/**
 * Benchmark harness runner (workstream 0.6; plan 11 §5 and §6.4).
 *
 * Usage:
 *   npx tsx tools/speech-benchmark/src/run.ts \
 *     --manifest <path/to/manifest.json> \
 *     --provider reference-passthrough \
 *     [--out <dir>] [--min-clips 30] [--validate-only]
 *
 * Also runs under plain Node 24 (type-stripping): node tools/speech-benchmark/src/run.ts …
 *
 * Behavior:
 * 1. Load + validate the manifest against the data contract
 *    (manifest.schema.json, enforced by src/manifest.ts). Invalid ⇒ exit 1.
 * 2. Build the requested provider adapter from the registry. For non-self-
 *    test adapters, every clip's audio file must exist before any call.
 * 3. Transcribe each clip, score WER/CER (src/wer.ts), aggregate by
 *    language/ageBand/l1, compute equity ratios vs the native-adult
 *    baseline, evaluate the §6.4 gates (src/gates.ts).
 * 4. Emit results.json + summary.md into the output directory.
 *
 * Self-test runs (reference-passthrough) are labeled NOT A BENCHMARK
 * everywhere and force all gates to insufficient-data.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { validateManifest } from "./manifest.ts";
import type { EvalManifest } from "./manifest.ts";
import {
  equityRatio,
  groupBy,
  isNativeSpeaker,
  poolClipScores,
  scoreClip,
} from "./wer.ts";
import type { EvalLanguage } from "./wer.ts";
import { GATE_THRESHOLDS, evaluateGates } from "./gates.ts";
import type { GateResult, ScoredClip } from "./gates.ts";
import { ADAPTERS, ADAPTER_NAMES } from "./adapters/index.ts";

const HARNESS_VERSION = "0.1.0";

interface CliArgs {
  manifestPath: string;
  provider: string;
  outDir: string | null;
  minClips: number;
  validateOnly: boolean;
}

function usage(): string {
  return [
    "Usage: npx tsx tools/speech-benchmark/src/run.ts --manifest <file> --provider <name> [--out <dir>] [--min-clips N] [--validate-only]",
    `Providers: ${ADAPTER_NAMES.join(", ")}`,
  ].join("\n");
}

function parseArgs(argv: string[]): CliArgs {
  let manifestPath = "";
  let provider = "";
  let outDir: string | null = null;
  let minClips = GATE_THRESHOLDS.DEFAULT_MIN_CLIPS as number;
  let validateOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--manifest") manifestPath = argv[++i] ?? "";
    else if (a === "--provider") provider = argv[++i] ?? "";
    else if (a === "--out") outDir = argv[++i] ?? null;
    else if (a === "--min-clips") minClips = Number(argv[++i]);
    else if (a === "--validate-only") validateOnly = true;
    else if (a === "--help" || a === "-h") {
      console.log(usage());
      process.exit(0);
    } else throw new Error(`Unknown argument: ${a}\n${usage()}`);
  }
  if (!manifestPath) throw new Error(`--manifest is required.\n${usage()}`);
  if (!validateOnly && !provider) throw new Error(`--provider is required.\n${usage()}`);
  if (!Number.isFinite(minClips) || minClips < 1) {
    throw new Error("--min-clips must be a positive integer");
  }
  return { manifestPath, provider, outDir, minClips, validateOnly };
}

function loadManifest(manifestPath: string): EvalManifest {
  const abs = resolve(manifestPath);
  if (!existsSync(abs)) throw new Error(`Manifest not found: ${abs}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    throw new Error(`Manifest is not valid JSON: ${abs} — ${(e as Error).message}`);
  }
  const v = validateManifest(parsed);
  if (!v.ok) {
    throw new Error(
      `Manifest failed the data contract (${v.errors.length} error(s)):\n  - ${v.errors.join("\n  - ")}`,
    );
  }
  return v.manifest;
}

interface GroupReportRow {
  language: EvalLanguage;
  ageBand: string;
  l1: string;
  native: boolean;
  clipCount: number;
  refWords: number;
  errors: number;
  wer: number | null;
  /** vs native-adult baseline of the same language; null when not computable. */
  equityRatio: number | null;
}

function buildGroupReport(scored: ScoredClip[]): GroupReportRow[] {
  const rows: GroupReportRow[] = [];
  for (const language of ["en", "es"] as EvalLanguage[]) {
    const langClips = scored.filter((s) => s.clip.language === language);
    if (langClips.length === 0) continue;
    const baseline = poolClipScores(
      langClips
        .filter(
          (s) =>
            s.clip.speaker.ageBand === "adult" &&
            isNativeSpeaker(language, s.clip.speaker.l1),
        )
        .map((s) => s.score),
    );
    const groups = groupBy(
      langClips,
      (s) => `${s.clip.speaker.ageBand}|${s.clip.speaker.l1.trim().toLowerCase()}`,
    );
    for (const [key, members] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const [ageBand, l1] = key.split("|");
      const pooled = poolClipScores(members.map((s) => s.score));
      const native = isNativeSpeaker(language, l1);
      rows.push({
        language,
        ageBand,
        l1,
        native,
        clipCount: pooled.clipCount,
        refWords: pooled.refWords,
        errors: pooled.errors,
        wer: pooled.wer,
        equityRatio: native ? null : equityRatio(pooled.wer, baseline.wer),
      });
    }
  }
  return rows;
}

function pct(wer: number | null): string {
  return wer === null ? "n/a" : `${(wer * 100).toFixed(2)}%`;
}

function buildSummaryMarkdown(opts: {
  manifest: EvalManifest;
  manifestPath: string;
  providerName: string;
  selfTest: boolean;
  minClips: number;
  scored: ScoredClip[];
  groups: GroupReportRow[];
  gates: GateResult[];
  generatedAt: string;
}): string {
  const { manifest, providerName, selfTest, scored, groups, gates } = opts;
  const lines: string[] = [];
  lines.push(`# Speech benchmark ${selfTest ? "SELF-TEST " : ""}summary`);
  lines.push("");
  if (selfTest) {
    lines.push(
      "> **SELF-TEST — NOT A BENCHMARK.** The `reference-passthrough` adapter returns each clip's own",
      "> reference transcript; 0% WER here verifies harness plumbing only and says nothing about any",
      "> speech provider. All gates are forced to `insufficient-data` on self-test runs.",
      "",
    );
  }
  lines.push(`- Generated: ${opts.generatedAt}`);
  lines.push(`- Harness: v${HARNESS_VERSION} (workstream 0.6; plan 11 §5, §6.4)`);
  lines.push(`- Provider: \`${providerName}\`${selfTest ? " (self-test only)" : ""}`);
  lines.push(`- Manifest: ${manifest.name ?? "(unnamed)"} — ${scored.length} clips (${opts.manifestPath})`);
  lines.push(`- Min clips per gated cell: ${opts.minClips}`);
  lines.push("");

  lines.push("## Overall pooled WER");
  lines.push("");
  lines.push("| Language | Clips | Ref words | WER |");
  lines.push("|---|---|---|---|");
  for (const language of ["en", "es"] as EvalLanguage[]) {
    const langScores = scored.filter((s) => s.clip.language === language).map((s) => s.score);
    if (langScores.length === 0) continue;
    const pooled = poolClipScores(langScores);
    lines.push(`| ${language} | ${pooled.clipCount} | ${pooled.refWords} | ${pct(pooled.wer)} |`);
  }
  lines.push("");

  lines.push("## Groups (language × ageBand × L1)");
  lines.push("");
  lines.push("Equity ratio = group WER / native-adult baseline WER of the same language (plan 11 §6.4 gate 1; bound ≤ 1.4×).");
  lines.push("");
  lines.push("| Language | Age band | L1 | Native | Clips | Ref words | WER | Equity ratio |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const g of groups) {
    lines.push(
      `| ${g.language} | ${g.ageBand} | ${g.l1} | ${g.native ? "yes" : "no"} | ${g.clipCount} | ${g.refWords} | ${pct(g.wer)} | ${
        g.equityRatio === null ? "n/a" : `${g.equityRatio.toFixed(2)}×`
      } |`,
    );
  }
  lines.push("");

  lines.push("## Gates (plan 11 §6.4)");
  lines.push("");
  lines.push("| Gate | Threshold | Measured | Status |");
  lines.push("|---|---|---|---|");
  for (const g of gates) {
    lines.push(`| ${g.id} | ${g.threshold} | ${g.measured} | **${g.status}** |`);
  }
  lines.push("");
  lines.push("### Gate detail");
  lines.push("");
  for (const g of gates) {
    lines.push(`- **${g.id}** — ${g.description}. ${g.detail}`);
  }
  lines.push("");
  lines.push(
    "_Honest-state note: `insufficient-data` means exactly that — no pass/fail claim is made. " +
      "Numbers become benchmark claims only on real provider adapters over the consented eval set " +
      "(README: owner actions required)._",
  );
  lines.push("");
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadManifest(args.manifestPath);
  const manifestAbs = resolve(args.manifestPath);
  const manifestDir = dirname(manifestAbs);

  if (args.validateOnly) {
    console.log(`Manifest OK: ${manifest.clips.length} clip(s) pass the data contract.`);
    return;
  }

  const factory = ADAPTERS[args.provider];
  if (!factory) {
    throw new Error(`Unknown provider "${args.provider}". Available: ${ADAPTER_NAMES.join(", ")}`);
  }
  const adapter = factory({ manifest, manifestDir });
  const selfTest = adapter.selfTestOnly === true;

  if (!selfTest) {
    // Real providers read audio: refuse to start with missing files rather
    // than failing mid-run (frozen eval set discipline, plan 11 §5.2).
    const missing = manifest.clips
      .map((c) => resolve(manifestDir, c.path))
      .filter((p) => !existsSync(p));
    if (missing.length > 0) {
      throw new Error(
        `${missing.length} audio file(s) missing; first: ${missing[0]}. ` +
          "The eval set must be complete before a provider run (plan 11 §5.2).",
      );
    }
  }

  const scored: ScoredClip[] = [];
  for (const clip of manifest.clips) {
    const clipPath = resolve(manifestDir, clip.path);
    const hypothesis = await adapter.transcribe(clipPath, clip.language);
    const refText = clip.reference.normalizedTranscript ?? clip.reference.transcript;
    scored.push({ clip, score: scoreClip(refText, hypothesis, clip.language) });
  }

  const groups = buildGroupReport(scored);
  const gates = evaluateGates(scored, { minClips: args.minClips, selfTest });
  const generatedAt = new Date().toISOString();

  const outDir = resolve(
    args.outDir ??
      join(
        process.cwd(),
        "tools/speech-benchmark/results",
        `${generatedAt.replace(/[:.]/g, "-")}-${adapter.name}`,
      ),
  );
  mkdirSync(outDir, { recursive: true });

  const results = {
    generatedAt,
    harnessVersion: HARNESS_VERSION,
    warning: selfTest
      ? "SELF-TEST — NOT A BENCHMARK. reference-passthrough verifies harness plumbing only."
      : undefined,
    provider: { name: adapter.name, selfTestOnly: selfTest },
    manifest: {
      name: manifest.name ?? null,
      path: manifestAbs,
      schemaVersion: manifest.schemaVersion,
      clipCount: manifest.clips.length,
    },
    minClips: args.minClips,
    perClip: scored.map(({ clip, score }) => ({
      id: clip.id,
      language: clip.language,
      ageBand: clip.speaker.ageBand,
      l1: clip.speaker.l1,
      tags: clip.tags ?? [],
      ...score,
    })),
    groups,
    gates,
  };

  const resultsPath = join(outDir, "results.json");
  const summaryPath = join(outDir, "summary.md");
  writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  writeFileSync(
    summaryPath,
    buildSummaryMarkdown({
      manifest,
      manifestPath: manifestAbs,
      providerName: adapter.name,
      selfTest,
      minClips: args.minClips,
      scored,
      groups,
      gates,
      generatedAt,
    }),
    "utf8",
  );

  console.log(`${selfTest ? "[SELF-TEST — NOT A BENCHMARK] " : ""}Scored ${scored.length} clip(s) with ${adapter.name}.`);
  console.log(`Results: ${resultsPath}`);
  console.log(`Summary: ${summaryPath}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

/**
 * Go/no-go gate evaluation (plan 11 §6.4, restated in §7 acceptance
 * criteria): every gate reports pass / fail / insufficient-data — never a
 * silent skip. Pure module (no I/O) so the arithmetic is unit-testable.
 *
 * Honesty rules built in:
 * - A gate only reports pass/fail when its cell has at least `minClips`
 *   clips (default 30, matching plan 11 §5.1's "≥30 trials" convention);
 *   otherwise it reports insufficient-data with the observed value.
 * - Runs made with a self-test adapter (reference-passthrough) force every
 *   gate to insufficient-data: a harness self-test is NOT A BENCHMARK.
 * - Gates the WER harness cannot measure (PA validity r≥0.7 — plan 11 §5.1
 *   measurement 6; code-switch segment accuracy) are reported as
 *   insufficient-data with what is missing, instead of being omitted.
 */

import type { ClipScore, EvalLanguage } from "./wer.ts";
import {
  equityRatio,
  groupBy,
  isNativeSpeaker,
  poolClipScores,
} from "./wer.ts";
import type { EvalClip } from "./manifest.ts";

export const GATE_THRESHOLDS = {
  /** Plan 11 §6.4 gate 1: adult beginner-L2 English WER. */
  EN_WER_MAX: 0.12,
  /** Plan 11 §6.4 gate 1: adult beginner-L2 Spanish WER. */
  ES_WER_MAX: 0.14,
  /** Plan 11 §6.4 gate 1: group WER ≤ 1.4× native-adult baseline. */
  EQUITY_MAX: 1.4,
  /** Plan 11 §6.4 gate 2: PA phoneme accuracy vs expert ratings. */
  PA_MIN_R: 0.7,
  /** Plan 11 §6.4 gate 1: code-switch segment accuracy. */
  CODE_SWITCH_MIN_ACCURACY: 0.85,
  /** Plan 11 §5.1: ≥30 trials per cell before a number is trusted. */
  DEFAULT_MIN_CLIPS: 30,
} as const;

export type GateStatus = "pass" | "fail" | "insufficient-data";

export interface GateResult {
  id: string;
  description: string;
  threshold: string;
  measured: string;
  status: GateStatus;
  detail: string;
}

export interface ScoredClip {
  clip: EvalClip;
  score: ClipScore;
}

export interface GateOptions {
  minClips?: number;
  /** True when the hypotheses came from a self-test adapter — forces insufficient-data. */
  selfTest?: boolean;
}

function fmtWer(wer: number | null): string {
  return wer === null ? "n/a" : `${(wer * 100).toFixed(2)}%`;
}

function fmtRatio(r: number | null): string {
  return r === null ? "n/a" : `${r.toFixed(2)}×`;
}

function isAdultL2(s: ScoredClip): boolean {
  return (
    s.clip.speaker.ageBand === "adult" &&
    !isNativeSpeaker(s.clip.language, s.clip.speaker.l1)
  );
}

function isNativeAdult(s: ScoredClip): boolean {
  return (
    s.clip.speaker.ageBand === "adult" &&
    isNativeSpeaker(s.clip.language, s.clip.speaker.l1)
  );
}

function werGate(
  lang: EvalLanguage,
  scored: ScoredClip[],
  minClips: number,
): GateResult {
  const max = lang === "en" ? GATE_THRESHOLDS.EN_WER_MAX : GATE_THRESHOLDS.ES_WER_MAX;
  const cell = scored.filter((s) => s.clip.language === lang && isAdultL2(s));
  const pooled = poolClipScores(cell.map((s) => s.score));
  const base = {
    id: `wer-${lang}`,
    description: `Adult beginner-L2 ${lang.toUpperCase()} pooled WER (plan 11 §6.4 gate 1)`,
    threshold: `≤ ${(max * 100).toFixed(0)}%`,
    measured: `${fmtWer(pooled.wer)} over ${pooled.clipCount} clips / ${pooled.refWords} ref words`,
  };
  if (pooled.clipCount < minClips || pooled.wer === null) {
    return {
      ...base,
      status: "insufficient-data",
      detail: `Need ≥${minClips} adult non-native ${lang} clips with scorable references; have ${pooled.clipCount}.`,
    };
  }
  return {
    ...base,
    status: pooled.wer <= max ? "pass" : "fail",
    detail: `Pooled over adult speakers whose L1 primary subtag ≠ "${lang}".`,
  };
}

function equityGate(
  lang: EvalLanguage,
  scored: ScoredClip[],
  minClips: number,
): GateResult {
  const langClips = scored.filter((s) => s.clip.language === lang);
  const baseline = poolClipScores(langClips.filter(isNativeAdult).map((s) => s.score));
  const l2Adult = langClips.filter(isAdultL2);
  const groups = groupBy(l2Adult, (s) => s.clip.speaker.l1.trim().toLowerCase());

  const base = {
    id: `equity-${lang}`,
    description: `Per-L1 adult-L2 ${lang.toUpperCase()} WER ≤ ${GATE_THRESHOLDS.EQUITY_MAX}× native-adult baseline (plan 11 §6.4 gate 1 equity bound)`,
    threshold: `≤ ${GATE_THRESHOLDS.EQUITY_MAX}×`,
  };

  if (baseline.clipCount < minClips || baseline.wer === null || baseline.wer <= 0) {
    return {
      ...base,
      measured: `baseline ${fmtWer(baseline.wer)} over ${baseline.clipCount} clips`,
      status: "insufficient-data",
      detail:
        `Native-adult ${lang} baseline needs ≥${minClips} clips and a non-zero pooled WER measured on the same harness; ` +
        `have ${baseline.clipCount} clips at ${fmtWer(baseline.wer)}.`,
    };
  }

  const lines: string[] = [];
  let evaluated = 0;
  let failed = 0;
  let worst: number | null = null;
  for (const [l1, members] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const pooled = poolClipScores(members.map((s) => s.score));
    const ratio = equityRatio(pooled.wer, baseline.wer);
    if (pooled.clipCount < minClips || ratio === null) {
      lines.push(`l1=${l1}: ${fmtWer(pooled.wer)} (${pooled.clipCount} clips) — undersized, not gated`);
      continue;
    }
    evaluated++;
    if (worst === null || ratio > worst) worst = ratio;
    const ok = ratio <= GATE_THRESHOLDS.EQUITY_MAX;
    if (!ok) failed++;
    lines.push(
      `l1=${l1}: ${fmtWer(pooled.wer)} → ${fmtRatio(ratio)} vs baseline ${fmtWer(baseline.wer)} (${pooled.clipCount} clips) — ${ok ? "within bound" : "EXCEEDS bound"}`,
    );
  }

  if (evaluated === 0) {
    return {
      ...base,
      measured: `baseline ${fmtWer(baseline.wer)}; no L1 group with ≥${minClips} clips`,
      status: "insufficient-data",
      detail: lines.join("; ") || "No adult-L2 groups present.",
    };
  }
  return {
    ...base,
    measured: `worst group ratio ${fmtRatio(worst)} across ${evaluated} gated L1 group(s)`,
    status: failed === 0 ? "pass" : "fail",
    detail: lines.join("; "),
  };
}

function codeSwitchGate(scored: ScoredClip[], minClips: number): GateResult {
  const tagged = scored.filter((s) => (s.clip.tags ?? []).includes("code-switch"));
  const pooled = poolClipScores(tagged.map((s) => s.score));
  return {
    id: "code-switch",
    description: `Code-switch segment accuracy (plan 11 §6.4 gate 1)`,
    threshold: `≥ ${(GATE_THRESHOLDS.CODE_SWITCH_MIN_ACCURACY * 100).toFixed(0)}% segment accuracy`,
    measured:
      pooled.clipCount === 0
        ? "no clips tagged 'code-switch'"
        : `WER proxy ${fmtWer(pooled.wer)} over ${pooled.clipCount} tagged clips (NOT segment accuracy)`,
    // Always insufficient-data for now: segment accuracy needs segment-level
    // language annotations the manifest does not yet carry. The pooled WER on
    // tagged clips is reported as a proxy only.
    status: "insufficient-data",
    detail:
      `Requires segment-level code-switch annotation (which words are in which language) to score ` +
      `segment accuracy; the manifest currently tags whole clips only. Collect ≥${minClips} annotated clips ` +
      `and extend the contract before gating.`,
  };
}

function paValidityGate(): GateResult {
  return {
    id: "pa-validity",
    description:
      "Pronunciation-assessment validity: Azure PA phoneme accuracy vs expert ratings (plan 11 §5.1 measurement 6, §6.4 gate 2)",
    threshold: `r ≥ ${GATE_THRESHOLDS.PA_MIN_R} (Pearson/Spearman vs 2 human raters), en-US and es-ES/es-MX`,
    measured: "not measured by this harness",
    status: "insufficient-data",
    detail:
      "This WER harness does not produce PA scores. Measurement 6 needs: the minimal-pair subset with " +
      "phoneme annotation (κ ≥ 0.8), Azure PA (and SpeechAce fallback) runs, and 2 human expert raters. " +
      "Owner action required before this gate can be evaluated.",
  };
}

/** Evaluate every §6.4 gate this harness knows about. Order is stable. */
export function evaluateGates(scored: ScoredClip[], opts: GateOptions = {}): GateResult[] {
  const minClips = opts.minClips ?? GATE_THRESHOLDS.DEFAULT_MIN_CLIPS;
  const results: GateResult[] = [
    werGate("en", scored, minClips),
    werGate("es", scored, minClips),
    equityGate("en", scored, minClips),
    equityGate("es", scored, minClips),
    codeSwitchGate(scored, minClips),
    paValidityGate(),
  ];
  if (opts.selfTest) {
    return results.map((r) => ({
      ...r,
      status: "insufficient-data" as GateStatus,
      detail: `SELF-TEST RUN (reference-passthrough adapter) — harness verification only, NOT A BENCHMARK. ${r.detail}`,
    }));
  }
  return results;
}

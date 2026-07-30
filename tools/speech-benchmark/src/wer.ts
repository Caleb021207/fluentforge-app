/**
 * Pure WER/CER scoring for the beginner-speech benchmark harness.
 *
 * Plan 11 §5.1 measurement 5 (STT WER, "NIST-style normalization"),
 * §5.2 (scoring: WER overall + per L1 group + per CEFR band) and
 * §6.4 gate 1 (EN ≤12%, ES ≤14%, equity bound ≤1.4× vs the vendor's
 * native-speech WER on the same harness).
 *
 * Zero I/O, zero Deno globals, zero URL imports — safe under vitest
 * (see vitest.config.ts header note) and under `npx tsx` / Node 24
 * type-stripping. No dependencies.
 *
 * ── Normalization policy (documented choices) ─────────────────────────
 * 1. Unicode NFC — composed and decomposed accented forms compare equal.
 * 2. Lowercase.
 * 3. Curly/typographic apostrophes (’ ‘ ‛ ` ´) → ASCII apostrophe, so
 *    "don’t" ≡ "don't". Internal apostrophes are KEPT (contractions);
 *    leading/trailing apostrophes are stripped per token.
 * 4. Hyphens/dashes → space ("well-known" ≡ "well known").
 * 5. All other punctuation removed (incl. Spanish ¿ ¡).
 * 6. Diacritics are PRESERVED: "está" vs "esta" is a scored error. For a
 *    language-learning product the accent distinction is part of correct
 *    orthography; dropping it would hide exactly the ASR confusions the
 *    study exists to measure. (NFC in step 1 removes pure encoding noise.)
 * 7. Number-words policy: eval-set references must spell numbers as words,
 *    matching what A1/A2 speakers actually say (collection instruction in
 *    README). As a safety net, SINGLE digits 0–9 are mapped to words per
 *    language ("2"→"two"/"dos"). Multi-digit tokens are left as-is and
 *    will score as errors against a spelled-out reference — deliberate,
 *    so that lazy digit references are surfaced instead of silently
 *    absorbed by an ambiguous inverse-normalization ("42" → "forty-two"
 *    vs "cuarenta y dos" is not 1:1 across languages).
 * 8. Whitespace collapsed.
 */

export type EvalLanguage = "en" | "es";
export type AgeBand = "child" | "teen" | "adult";

const EN_DIGIT_WORDS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
  "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
};

const ES_DIGIT_WORDS: Record<string, string> = {
  "0": "cero", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro",
  "5": "cinco", "6": "seis", "7": "siete", "8": "ocho", "9": "nueve",
};

/** Apply the documented normalization policy; returns a space-joined string. */
export function normalizeText(text: string, lang: EvalLanguage): string {
  const digitWords = lang === "es" ? ES_DIGIT_WORDS : EN_DIGIT_WORDS;
  const cleaned = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‘’‛`´]/g, "'") // typographic apostrophes → '
    .replace(/[-‐‑‒–—]/g, " ") // hyphens/dashes → space
    .replace(/[^\p{L}\p{N}' ]+/gu, " "); // strip remaining punctuation (incl. ¿ ¡)
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, "")) // strip edge apostrophes, keep internal
    .filter((t) => t.length > 0)
    .map((t) => (/^\d$/.test(t) ? digitWords[t] : t));
  return tokens.join(" ");
}

/** Split a normalized string into word tokens. */
export function tokenize(normalized: string): string[] {
  return normalized.length === 0 ? [] : normalized.split(" ");
}

export interface AlignmentCounts {
  refLength: number;
  hypLength: number;
  hits: number;
  substitutions: number;
  deletions: number;
  insertions: number;
}

/**
 * Levenshtein alignment (uniform costs 1/1/1) with backtrace to split the
 * distance into substitutions/deletions/insertions. Tie-break preference on
 * the backtrace: diagonal (hit/substitution) > deletion > insertion. Ties
 * never change the total distance, only how it is split — documented so
 * per-category counts are reproducible.
 */
export function alignSequences(ref: string[], hyp: string[]): AlignmentCounts {
  const n = ref.length;
  const m = hyp.length;
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) cost[i][0] = i;
  for (let j = 1; j <= m; j++) cost[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub = cost[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1);
      const del = cost[i - 1][j] + 1;
      const ins = cost[i][j - 1] + 1;
      cost[i][j] = Math.min(sub, del, ins);
    }
  }
  const counts: AlignmentCounts = {
    refLength: n,
    hypLength: m,
    hits: 0,
    substitutions: 0,
    deletions: 0,
    insertions: 0,
  };
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      cost[i][j] === cost[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1)
    ) {
      if (ref[i - 1] === hyp[j - 1]) counts.hits++;
      else counts.substitutions++;
      i--;
      j--;
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      counts.deletions++;
      i--;
    } else {
      counts.insertions++;
      j--;
    }
  }
  return counts;
}

/**
 * Error-rate convention (word or character level):
 * - refLength > 0            → (S + D + I) / refLength (may exceed 1.0)
 * - refLength = 0, hyp empty → 0
 * - refLength = 0, hyp not   → null ("undefined"; the run report surfaces
 *   these clips instead of pooling a fake number). Insertions still count
 *   toward pooled totals.
 */
function errorRate(counts: AlignmentCounts): number | null {
  const errors = counts.substitutions + counts.deletions + counts.insertions;
  if (counts.refLength > 0) return errors / counts.refLength;
  return counts.hypLength === 0 ? 0 : null;
}

export interface ClipScore {
  refNorm: string;
  hypNorm: string;
  refWords: number;
  hypWords: number;
  hits: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  errors: number;
  wer: number | null;
  cer: number | null;
}

/** Character error rate over already-normalized strings (spaces included). */
export function characterErrorRate(refNorm: string, hypNorm: string): number | null {
  return errorRate(alignSequences(Array.from(refNorm), Array.from(hypNorm)));
}

/** Score one clip: normalize both sides, align, compute WER + CER. */
export function scoreClip(refText: string, hypText: string, lang: EvalLanguage): ClipScore {
  const refNorm = normalizeText(refText, lang);
  const hypNorm = normalizeText(hypText, lang);
  const ref = tokenize(refNorm);
  const hyp = tokenize(hypNorm);
  const counts = alignSequences(ref, hyp);
  const errors = counts.substitutions + counts.deletions + counts.insertions;
  return {
    refNorm,
    hypNorm,
    refWords: counts.refLength,
    hypWords: counts.hypLength,
    hits: counts.hits,
    substitutions: counts.substitutions,
    deletions: counts.deletions,
    insertions: counts.insertions,
    errors,
    wer: errorRate(counts),
    cer: characterErrorRate(refNorm, hypNorm),
  };
}

export interface PooledScore {
  clipCount: number;
  refWords: number;
  errors: number;
  /** Pooled (corpus-level) WER: Σ errors / Σ ref words — NOT the mean of per-clip WERs. */
  wer: number | null;
}

/** Pool clip scores into a corpus-level WER (standard corpus convention). */
export function poolClipScores(scores: ClipScore[]): PooledScore {
  let refWords = 0;
  let errors = 0;
  for (const s of scores) {
    refWords += s.refWords;
    errors += s.errors;
  }
  const wer = refWords > 0 ? errors / refWords : errors === 0 ? 0 : null;
  return { clipCount: scores.length, refWords, errors, wer };
}

/** Primary BCP-47 subtag, lowercased: "es-MX" → "es". */
export function primaryLangSubtag(tag: string): string {
  return tag.trim().toLowerCase().split("-")[0];
}

/** Native speaker of the clip's target language? ("es-MX" L1 is native for "es" clips.) */
export function isNativeSpeaker(language: EvalLanguage, l1: string): boolean {
  return primaryLangSubtag(l1) === language;
}

/**
 * Equity ratio: group WER / native-adult-baseline WER (plan 11 §6.4 gate 1,
 * bound ≤1.4×). Returns null when either side is unknown or the baseline is
 * 0 (a 0-WER baseline makes the ratio meaningless — flagged, not divided).
 */
export function equityRatio(groupWer: number | null, baselineWer: number | null): number | null {
  if (groupWer === null || baselineWer === null || baselineWer <= 0) return null;
  return groupWer / baselineWer;
}

/** Stable grouping helper used by the runner and gate evaluation. */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const bucket = out.get(key);
    if (bucket) bucket.push(item);
    else out.set(key, [item]);
  }
  return out;
}

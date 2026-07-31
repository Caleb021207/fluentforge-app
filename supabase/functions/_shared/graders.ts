/**
 * Deterministic (Tier-0) grading registry for the Wave-1/Wave-2 exercise
 * primitives.
 *
 * Plan 06 §E2 (grading service) / §E3 (tiers) / §E10 (Wave 1). This module is
 * the pure, server-side core of the grading service: it takes a learner
 * `response` plus the server-only `key` for an exercise and returns a
 * `GradeResult`. It never reads a database, never touches the network, never
 * trusts the client for correctness, and never sees a JWT.
 *
 * IMPORT-CLEAN: no URL imports, no `Deno.*`, no side effects — so it runs
 * bit-identically under `deno` (edge runtime) and `vitest` (golden vectors in
 * tests/server-pure/graders.test.ts), exactly like _shared/learnerProgress.ts.
 * Do not add a `https://` import or a Deno global to this file.
 *
 * Text utilities (`normalizeText` / capped `editDistance` / `isNearMiss`) are
 * adopted from the quarantined WIP grader per plan 06 §6.4 ("Adopt the
 * utilities"); its storage model (keys encoded in `exercise_options.label`) and
 * its treatment of speech as text equality are deliberately NOT carried over.
 */

/* ------------------------------------------------------------------ types -- */

export interface GradeResult {
  /** Did the response pass this primitive's threshold? Drives is_correct. */
  correct: boolean;
  /** Continuous quality in [0,1]; may be > 0 on a fail (informational). */
  score: number;
  /** Learner-facing hint tag/message. Safe to reveal post-grade only. */
  feedback?: string;
  /** The revealed answer — post-grade only; never serialized before grading. */
  expected?: string | string[] | null;
  /** Per-part scores (per-blank, per-token) for diagnostics/feedback. */
  partials?: Array<{ part: string; score: number }>;
}

/**
 * A grader for one primitive. `grade(submission, key)` is pure and total: it
 * must return a GradeResult for ANY input (including malformed client data)
 * rather than throw. The `key` carries both answer material and the per-item
 * grading knobs (near-miss, accents, pass threshold), mirroring the plan's
 * per-primitive Key examples (06 §3, e.g. P02 `{accept, accept_near_miss}`).
 */
export interface Grader<Resp = unknown, Key = unknown> {
  type: string;
  grade(submission: Resp, key: Key): GradeResult;
}

/** Stamped on every graded attempt for reproducibility / re-grade audits. */
export const GRADER_VERSION = "wave1-graders@1";

interface NormOpts {
  keepAccents?: boolean;
}

/* -------------------------------------------------------------- text utils -- */

/** Strip combining diacritics so "cafe" matches "café". */
export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Normalize a free-text answer for comparison: trim, lowercase, straighten
 * curly quotes, drop terminal punctuation, collapse internal whitespace and
 * (unless keepAccents) strip diacritics. Idempotent by construction.
 */
export function normalizeText(input: unknown, opts?: NormOpts): string {
  let s = (typeof input === "string" ? input : "").trim().toLowerCase();
  s = s.replace(/[‘’‛]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[.,!?;:]+$/g, "");
  s = s.replace(/\s+/g, " ");
  if (!opts?.keepAccents) s = stripDiacritics(s);
  return s;
}

/** Levenshtein distance (full DP; inputs here are short single words/chunks). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * A single-character slip on a word of reasonable length — a typo, not a
 * language error. Never fires for keys shorter than 4 chars (06 §P02).
 */
export function isNearMiss(answer: string, key: string): boolean {
  if (Math.abs(answer.length - key.length) > 2) return false;
  if (key.length < 4) return false;
  return editDistance(answer, key) <= 1;
}

const tokens = (s: string): string[] => s.split(/\s+/).filter(Boolean);

function arraysEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** Longest-common-subsequence length over two token arrays. */
function lcsLength(a: readonly string[], b: readonly string[]): number {
  const m = a.length;
  const n = b.length;
  if (!m || !n) return 0;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}

function firstDivergence(a: readonly string[], b: readonly string[]): number {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return -1;
}

/**
 * Token-level Levenshtein alignment: distance counts word insertions,
 * deletions and substitutions; `refHit[i]` marks reference tokens matched
 * exactly in one optimal alignment (drives the word-level diff, 06 §P08).
 * Utterances here are short (≤8 words at A1), so a full DP matrix is fine.
 */
function alignTokens(
  ref: readonly string[],
  hyp: readonly string[],
): { distance: number; refHit: boolean[] } {
  const m = ref.length;
  const n = hyp.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1),
      );
    }
  }
  const refHit: boolean[] = new Array(m).fill(false);
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1] === hyp[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      refHit[i - 1] = true;
      i--;
      j--;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      i--;
      j--; // substitution
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      i--; // deletion
    } else {
      j--; // insertion
    }
  }
  return { distance: d[m][n], refHit };
}

/** True when two normalized chunks differ by exactly one near-miss token. */
function oneTokenNearMiss(a: string, b: string): boolean {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length !== tb.length || ta.length === 0) return false;
  let diffs = 0;
  let idx = -1;
  for (let i = 0; i < ta.length; i++) {
    if (ta[i] !== tb[i]) {
      diffs++;
      idx = i;
    }
  }
  return diffs === 1 && editDistance(ta[idx], tb[idx]) <= 1;
}

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/* --------------------------------------------------------------- primitives */

/** P01 meaning_recognition — receptive option match; also hosts legacy MCQ. */
interface MeaningRecognitionKey {
  correct_option?: string | null;
  rationale_l1_key?: string | null;
}
interface MeaningRecognitionResponse {
  selected_option?: string | null;
}
export const meaningRecognitionGrader: Grader<MeaningRecognitionResponse, MeaningRecognitionKey> = {
  type: "meaning_recognition",
  grade(submission, key) {
    const selected = submission?.selected_option ?? null;
    const correct = selected != null && selected === (key?.correct_option ?? null);
    return { correct, score: correct ? 1 : 0, expected: key?.correct_option ?? null };
  },
};

/** P02 word_retrieval — productive single-word recall against an accept-list. */
interface AcceptKey {
  accept?: string[];
  accept_near_miss?: boolean;
  keep_accents?: boolean;
}
interface TextResponse {
  text?: string;
}
export const wordRetrievalGrader: Grader<TextResponse, AcceptKey> = {
  type: "word_retrieval",
  grade(submission, key) {
    const opts: NormOpts = { keepAccents: !!key?.keep_accents };
    const accept = asStringArray(key?.accept);
    const expected = accept[0] ?? null;
    const text = normalizeText(submission?.text, opts);
    if (!text) return { correct: false, score: 0, expected, feedback: "empty" };
    const normAccept = accept.map((a) => normalizeText(a, opts));
    if (normAccept.includes(text)) return { correct: true, score: 1, expected };
    if (key?.accept_near_miss !== false) {
      for (const a of normAccept) {
        if (isNearMiss(text, a)) return { correct: true, score: 0.9, expected, feedback: "spelling" };
      }
    }
    return { correct: false, score: 0, expected };
  },
};

/** P03 chunk_retrieval — typed accept-list OR ordered token-bank assembly. */
interface ChunkKey extends AcceptKey {
  token_solution?: string[];
}
interface ChunkResponse extends TextResponse {
  tokens?: string[];
}
export const chunkRetrievalGrader: Grader<ChunkResponse, ChunkKey> = {
  type: "chunk_retrieval",
  grade(submission, key) {
    const opts: NormOpts = { keepAccents: !!key?.keep_accents };
    // Token-bank mode: ordered match, order matters, pass requires 1.0.
    if (Array.isArray(submission?.tokens) && Array.isArray(key?.token_solution)) {
      const sol = asStringArray(key.token_solution).map((t) => normalizeText(t, opts));
      const sub = asStringArray(submission.tokens).map((t) => normalizeText(t, opts));
      let inPlace = 0;
      for (let i = 0; i < sol.length; i++) if (sub[i] !== undefined && sub[i] === sol[i]) inPlace++;
      const score = sol.length ? Number((inPlace / sol.length).toFixed(4)) : 0;
      const correct = score === 1 && sub.length === sol.length;
      return {
        correct,
        score,
        expected: asStringArray(key.token_solution).join(" "),
        partials: [{ part: "tokens", score }],
      };
    }
    // Typed mode: accept-list, one-word near miss = 0.85 pass (06 §P03).
    const accept = asStringArray(key?.accept);
    const expected = accept[0] ?? null;
    const text = normalizeText(submission?.text, opts);
    if (!text) return { correct: false, score: 0, expected, feedback: "empty" };
    const normAccept = accept.map((a) => normalizeText(a, opts));
    if (normAccept.includes(text)) return { correct: true, score: 1, expected };
    for (const a of normAccept) {
      if (oneTokenNearMiss(text, a) || isNearMiss(text, a)) {
        return { correct: true, score: 0.85, expected, feedback: "spelling" };
      }
    }
    return { correct: false, score: 0, expected };
  },
};

/** P04 listening_selection — aural option match; transcript reveals post-grade. */
interface ListeningSelectionKey {
  correct_option?: string | null;
  transcript?: string | null;
}
interface ListeningSelectionResponse {
  selected_option?: string | null;
}
export const listeningSelectionGrader: Grader<ListeningSelectionResponse, ListeningSelectionKey> = {
  type: "listening_selection",
  grade(submission, key) {
    const selected = submission?.selected_option ?? null;
    const correct = selected != null && selected === (key?.correct_option ?? null);
    // Expected is the TL transcript, not the option id: post-grade the client
    // shows what was said (06 §P04 feedback: reveal transcript after grading).
    return { correct, score: correct ? 1 : 0, expected: key?.transcript ?? null };
  },
};

/** P05 sentence_construction — ordered token ids, text fallback on id desync. */
interface SentenceKey {
  solutions?: string[][];
  solution_texts?: string[];
  keep_accents?: boolean;
}
interface SentenceResponse {
  ordered_tokens?: string[];
  ordered_texts?: string[];
}
export const sentenceConstructionGrader: Grader<SentenceResponse, SentenceKey> = {
  type: "sentence_construction",
  grade(submission, key) {
    const opts: NormOpts = { keepAccents: !!key?.keep_accents };
    const solutions = Array.isArray(key?.solutions) ? key!.solutions : [];
    const solutionTexts = asStringArray(key?.solution_texts);
    const expected: string[] | null = solutionTexts.length ? solutionTexts : null;
    const sub = asStringArray(submission?.ordered_tokens);

    for (const sol of solutions) {
      if (Array.isArray(sol) && arraysEqual(sub, asStringArray(sol))) {
        return { correct: true, score: 1, expected };
      }
    }
    // Text fallback (token ids desynced from the served content).
    const orderedTexts = asStringArray(submission?.ordered_texts);
    if (orderedTexts.length) {
      const joined = normalizeText(orderedTexts.join(" "), opts);
      const normSolTexts = solutionTexts.map((t) => normalizeText(t, opts));
      if (normSolTexts.includes(joined)) return { correct: true, score: 1, expected };
    }
    // Partial (feedback only — grammar is the construct, pass needs full match).
    let bestRatio = 0;
    let firstDiv = -1;
    for (const sol of solutions) {
      const solIds = asStringArray(sol);
      const denom = Math.max(sub.length, solIds.length, 1);
      const ratio = lcsLength(sub, solIds) / denom;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        firstDiv = firstDivergence(sub, solIds);
      }
    }
    const partials = [{ part: "order", score: Number(bestRatio.toFixed(4)) }];
    if (firstDiv >= 0) partials.push({ part: "first_divergence_index", score: firstDiv });
    return { correct: false, score: Number(bestRatio.toFixed(4)), expected, partials };
  },
};

/** P06 cloze — per-blank typed accept-list or option match; averaged score. */
interface ClozeBlankKey {
  accept?: string[];
  correct_option?: string;
  near_miss?: boolean;
  spelling?: boolean;
}
interface ClozeKey {
  [blankId: string]: ClozeBlankKey | number | boolean | undefined;
  pass_threshold?: number;
  keep_accents?: boolean;
}
interface ClozeResponse {
  blanks?: Record<string, string>;
}
const isBlankKey = (v: unknown): v is ClozeBlankKey =>
  typeof v === "object" && v !== null && ("accept" in v || "correct_option" in v);

export const clozeGrader: Grader<ClozeResponse, ClozeKey> = {
  type: "cloze",
  grade(submission, key) {
    const opts: NormOpts = { keepAccents: !!key?.keep_accents };
    const passThreshold = typeof key?.pass_threshold === "number" ? key.pass_threshold : 1;
    const blankIds = Object.keys(key ?? {}).filter((k) => isBlankKey(key[k]));
    if (!blankIds.length) return { correct: false, score: 0, expected: null };

    const submitted = submission?.blanks ?? {};
    const partials: Array<{ part: string; score: number }> = [];
    const expected: string[] = [];
    let sum = 0;
    for (const id of blankIds) {
      const bk = key[id] as ClozeBlankKey;
      const given = submitted[id];
      let s = 0;
      if (bk.correct_option !== undefined) {
        expected.push(bk.correct_option ?? "");
        s = given != null && given === bk.correct_option ? 1 : 0;
      } else {
        const accept = asStringArray(bk.accept);
        expected.push(accept[0] ?? "");
        const text = normalizeText(given, opts);
        const normAccept = accept.map((a) => normalizeText(a, opts));
        if (text && normAccept.includes(text)) s = 1;
        else if (text && bk.near_miss !== false && bk.spelling !== true) {
          for (const a of normAccept) {
            if (isNearMiss(text, a)) {
              s = 0.9;
              break;
            }
          }
        }
      }
      partials.push({ part: id, score: s });
      sum += s;
    }
    const score = Number((sum / blankIds.length).toFixed(4));
    const correct = score >= passThreshold - 1e-9;
    return { correct, score, expected, partials };
  },
};

/** P08 dictation — sound→spelling: token-aligned WER, spelling not forgiven. */
interface DictationKey {
  transcript?: string;
  /** Allowed WER; pass at score >= 1 - tolerance. Default 0.1 (06 §P08). */
  token_tolerance?: number;
  keep_accents?: boolean;
}
export const dictationGrader: Grader<TextResponse, DictationKey> = {
  type: "dictation",
  grade(submission, key) {
    const opts: NormOpts = { keepAccents: !!key?.keep_accents };
    const expected = typeof key?.transcript === "string" ? key.transcript : null;
    const ref = tokens(normalizeText(key?.transcript, opts));
    if (!ref.length) return { correct: false, score: 0, expected };
    const hyp = tokens(normalizeText(submission?.text, opts));
    if (!hyp.length) return { correct: false, score: 0, expected, feedback: "empty" };
    const { distance, refHit } = alignTokens(ref, hyp);
    // score = 1 - WER clamped to [0,1] (WER can exceed 1 on long insertions).
    const score = Number(Math.min(1, Math.max(0, 1 - distance / ref.length)).toFixed(4));
    const tolerance = typeof key?.token_tolerance === "number" ? key.token_tolerance : 0.1;
    // No isNearMiss forgiveness here: spelling IS the construct (06 §P08,
    // the WIP grader's dictation exception — adopted).
    const correct = score >= 1 - tolerance - 1e-9;
    return {
      correct,
      score,
      expected,
      // Per-reference-token verdicts, in transcript order (word-level diff).
      partials: refHit.map((hit, i) => ({ part: `t${i}`, score: hit ? 1 : 0 })),
    };
  },
};

/** P20 error_correction (spot / spot_and_fix) — token-id match + fix accept. */
interface ErrorCorrectionKey {
  error_tokens?: string[];
  corrections?: Record<string, string[]>;
  error_tag?: string;
  task?: "spot" | "spot_and_fix";
  keep_accents?: boolean;
}
interface ErrorCorrectionResponse {
  selected_tokens?: string[];
  corrections?: Record<string, string>;
}
export const errorCorrectionGrader: Grader<ErrorCorrectionResponse, ErrorCorrectionKey> = {
  type: "error_correction",
  grade(submission, key) {
    const task = key?.task ?? (key?.corrections ? "spot_and_fix" : "spot");
    const errorTokens = asStringArray(key?.error_tokens);
    const errs = new Set(errorTokens);
    const sel = new Set(asStringArray(submission?.selected_tokens));
    const spotCorrect = errs.size > 0 && setsEqual(errs, sel);

    if (task === "spot") {
      return {
        correct: spotCorrect,
        score: spotCorrect ? 1 : 0,
        expected: errorTokens,
        feedback: key?.error_tag,
      };
    }

    // spot_and_fix
    const corrections = key?.corrections ?? {};
    const expectedFix = Object.keys(corrections).map(
      (t) => `${t}: ${asStringArray(corrections[t])[0] ?? ""}`,
    );
    if (!spotCorrect) {
      return { correct: false, score: 0, expected: expectedFix, feedback: key?.error_tag };
    }
    const opts: NormOpts = { keepAccents: !!key?.keep_accents };
    let allFixed = true;
    for (const tok of Object.keys(corrections)) {
      const accept = asStringArray(corrections[tok]).map((a) => normalizeText(a, opts));
      const given = normalizeText((submission?.corrections ?? {})[tok], opts);
      if (!(given && accept.includes(given))) {
        allFixed = false;
        break;
      }
    }
    if (allFixed) return { correct: true, score: 1, expected: expectedFix, feedback: key?.error_tag };
    // Spotted the error but the fix was wrong (06 §P20 partial credit).
    return { correct: false, score: 0.5, expected: expectedFix, feedback: key?.error_tag };
  },
};

/* ---------------------------------------------------------------- registry -- */

export const GRADERS: Record<string, Grader> = {
  meaning_recognition: meaningRecognitionGrader as Grader,
  word_retrieval: wordRetrievalGrader as Grader,
  chunk_retrieval: chunkRetrievalGrader as Grader,
  listening_selection: listeningSelectionGrader as Grader,
  sentence_construction: sentenceConstructionGrader as Grader,
  cloze: clozeGrader as Grader,
  dictation: dictationGrader as Grader,
  error_correction: errorCorrectionGrader as Grader,
};

/** Returns the grader for a primitive, or undefined if none is registered. */
export function getGrader(primitive: string): Grader | undefined {
  return GRADERS[primitive];
}

/**
 * Dispatch a graded attempt. Throws for an unregistered primitive so the caller
 * can return a clean 4xx rather than silently mark the learner wrong.
 */
export function gradeAttempt(primitive: string, submission: unknown, key: unknown): GradeResult {
  const grader = GRADERS[primitive];
  if (!grader) throw new Error(`No Tier-0 grader for primitive '${primitive}'`);
  return grader.grade(submission, key);
}

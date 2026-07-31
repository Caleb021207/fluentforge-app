import { describe, expect, it } from "vitest";
import {
  GRADER_VERSION,
  editDistance,
  gradeAttempt,
  getGrader,
  isNearMiss,
  normalizeText,
  chunkRetrievalGrader,
  clozeGrader,
  errorCorrectionGrader,
  meaningRecognitionGrader,
  sentenceConstructionGrader,
  wordRetrievalGrader,
} from "../../supabase/functions/_shared/graders";

/**
 * Golden vectors for the Wave-1 Tier-0 grading registry (plan 06 §E10, §T-1:
 * "fixtures are the normative spec of grading behavior"). Every primitive has
 * a correct / near-miss / partial / wrong vector. These run under vitest
 * because graders.ts is import-clean (no URL imports, no Deno globals), the
 * same discipline as learnerProgress.test.ts.
 */

describe("text utilities (adopted from WIP grader, 06 §6.4)", () => {
  it("normalizeText folds case / whitespace / terminal punct / diacritics", () => {
    expect(normalizeText("  Café! ")).toBe("cafe");
    expect(normalizeText("She   is  from  Peru.")).toBe("she is from peru");
    // Terminal-punctuation stripping only reaches the true end of the string,
    // so a comma tucked inside a closing quote is preserved.
    expect(normalizeText("“Hello,”")).toBe('"hello,"');
  });

  it("normalizeText keeps accents when asked", () => {
    expect(normalizeText("Café", { keepAccents: true })).toBe("café");
  });

  it("normalizeText is idempotent (T-3 property)", () => {
    for (const s of ["Café!", "  A  B  c. ", "ÀÉÎ õ ñ", "what's up?", ""]) {
      expect(normalizeText(normalizeText(s))).toBe(normalizeText(s));
    }
  });

  it("normalizeText tolerates non-string input", () => {
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(42 as unknown)).toBe("");
  });

  it("editDistance basics", () => {
    expect(editDistance("teacher", "teacher")).toBe(0);
    expect(editDistance("techer", "teacher")).toBe(1);
    expect(editDistance("", "abc")).toBe(3);
  });

  it("isNearMiss never accepts distance>1 or key shorter than 4 (T-3 bounds)", () => {
    expect(isNearMiss("techer", "teacher")).toBe(true); // 1 edit, len>=4
    expect(isNearMiss("cat", "bat")).toBe(false); // key len 3
    expect(isNearMiss("teachr", "teacher")).toBe(true); // deletion, 1 edit
    expect(isNearMiss("house", "mouse")).toBe(true); // 1 substitution
    expect(isNearMiss("xyz", "teacher")).toBe(false); // length gap > 2
    expect(isNearMiss("techher", "teacher")).toBe(false); // 2 edits
  });
});

describe("meaning_recognition (P01) — also the legacy MCQ path", () => {
  const g = meaningRecognitionGrader;
  it("correct option", () => {
    expect(g.grade({ selected_option: "o1" }, { correct_option: "o1" })).toEqual({
      correct: true,
      score: 1,
      expected: "o1",
    });
  });
  it("wrong option", () => {
    const r = g.grade({ selected_option: "o2" }, { correct_option: "o1" });
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0);
  });
  it("no selection is never correct (empty floor)", () => {
    expect(g.grade({ selected_option: null }, { correct_option: "o1" }).correct).toBe(false);
    expect(g.grade({}, { correct_option: "o1" }).correct).toBe(false);
  });
});

describe("word_retrieval (P02) — productive recall", () => {
  const g = wordRetrievalGrader;
  const key = { accept: ["teacher"], accept_near_miss: true, keep_accents: false };
  it("exact (case/space-insensitive) → 1.0", () => {
    expect(g.grade({ text: "  Teacher " }, key)).toMatchObject({ correct: true, score: 1 });
  });
  it("accepts diacritic-folded match", () => {
    expect(g.grade({ text: "PROFESOR" }, { accept: ["profesor"] })).toMatchObject({
      correct: true,
      score: 1,
    });
  });
  it("near-miss → correct, score 0.9, spelling flag (06 §P02 partial credit)", () => {
    const r = g.grade({ text: "techer" }, key);
    expect(r).toMatchObject({ correct: true, score: 0.9, feedback: "spelling", expected: "teacher" });
  });
  it("near-miss OFF → wrong", () => {
    const r = g.grade({ text: "techer" }, { accept: ["teacher"], accept_near_miss: false });
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0);
  });
  it("set-membership: any of N accepted", () => {
    const multi = { accept: ["hi", "hello", "hey"] };
    expect(g.grade({ text: "HELLO" }, multi).correct).toBe(true);
    expect(g.grade({ text: "hey" }, multi).correct).toBe(true);
  });
  it("empty → wrong with expected revealed", () => {
    expect(g.grade({ text: "" }, key)).toMatchObject({ correct: false, score: 0, expected: "teacher" });
  });
  it("wrong word → 0", () => {
    expect(g.grade({ text: "dog" }, key).correct).toBe(false);
  });
});

describe("chunk_retrieval (P03) — typed + token-bank", () => {
  const g = chunkRetrievalGrader;
  const typed = { accept: ["what's your name", "what is your name"] };
  it("typed exact accept variant → 1.0", () => {
    expect(g.grade({ text: "What is your name?" }, typed)).toMatchObject({ correct: true, score: 1 });
  });
  it("typed one-word near miss → 0.85 pass (06 §P03)", () => {
    const r = g.grade({ text: "what is yur name" }, typed);
    expect(r).toMatchObject({ correct: true, score: 0.85, feedback: "spelling" });
  });
  it("token-bank ordered exact → 1.0", () => {
    const r = g.grade(
      { tokens: ["what's", "your", "name"] },
      { token_solution: ["what's", "your", "name"] },
    );
    expect(r).toMatchObject({ correct: true, score: 1 });
  });
  it("token-bank wrong order → partial score, not passed (order matters)", () => {
    const r = g.grade(
      { tokens: ["your", "what's", "name"] },
      { token_solution: ["what's", "your", "name"] },
    );
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0.3333); // 1/3, rounded to 4 dp
    expect(r.partials?.[0]).toEqual({ part: "tokens", score: r.score });
  });
  it("typed wrong → 0", () => {
    expect(g.grade({ text: "hello there" }, typed).correct).toBe(false);
  });
});

describe("sentence_construction (P05) — ordered tokens", () => {
  const g = sentenceConstructionGrader;
  const key = {
    solutions: [["t3", "t1", "t4", "t5"]],
    solution_texts: ["she is from peru"],
  };
  it("correct id order → 1.0", () => {
    expect(g.grade({ ordered_tokens: ["t3", "t1", "t4", "t5"] }, key)).toMatchObject({
      correct: true,
      score: 1,
    });
  });
  it("accepts any of multiple valid orders", () => {
    const multi = { solutions: [["a", "b"], ["b", "a"]], solution_texts: ["a b"] };
    expect(g.grade({ ordered_tokens: ["b", "a"] }, multi).correct).toBe(true);
  });
  it("text fallback when token ids desync", () => {
    const r = g.grade({ ordered_tokens: ["x1", "x2", "x3", "x4"], ordered_texts: ["She", "is", "from", "Peru"] }, key);
    expect(r).toMatchObject({ correct: true, score: 1 });
  });
  it("wrong order → not passed, LCS partial reported (grammar is the construct)", () => {
    const r = g.grade({ ordered_tokens: ["t1", "t3", "t4", "t5"] }, key);
    expect(r.correct).toBe(false);
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(1);
    expect(r.partials?.some((p) => p.part === "order")).toBe(true);
  });
  it("empty → 0", () => {
    expect(g.grade({ ordered_tokens: [] }, key).correct).toBe(false);
  });
});

describe("cloze (P06) — multi-blank partial credit", () => {
  const g = clozeGrader;
  const key = {
    b1: { accept: ["is", "'s"] },
    b2: { correct_option: "o1" },
  };
  it("all blanks correct → score 1, pass", () => {
    const r = g.grade({ blanks: { b1: "is", b2: "o1" } }, key);
    expect(r).toMatchObject({ correct: true, score: 1 });
    expect(r.partials).toEqual([
      { part: "b1", score: 1 },
      { part: "b2", score: 1 },
    ]);
  });
  it("half correct → score 0.5, fails default threshold 1.0", () => {
    const r = g.grade({ blanks: { b1: "is", b2: "o2" } }, key);
    expect(r.score).toBe(0.5);
    expect(r.correct).toBe(false);
  });
  it("authored pass_threshold 0.75 lets a 4-blank item pass at 3/4", () => {
    const k = {
      pass_threshold: 0.75,
      b1: { accept: ["a"] },
      b2: { accept: ["b"] },
      b3: { accept: ["c"] },
      b4: { accept: ["d"] },
    };
    const r = g.grade({ blanks: { b1: "a", b2: "b", b3: "c", b4: "WRONG" } }, k);
    expect(r.score).toBe(0.75);
    expect(r.correct).toBe(true);
  });
  it("typed near-miss on a blank → 0.9 for that blank", () => {
    const r = g.grade({ blanks: { b1: "iss", b2: "o1" } }, { b1: { accept: ["island"] }, b2: { correct_option: "o1" } });
    // "iss" vs "island" is not a near miss; verify the near-miss path with a real slip:
    const r2 = g.grade({ blanks: { x: "housr" } }, { x: { accept: ["house"] } });
    expect(r2.partials?.[0].score).toBe(0.9);
    expect(r).toBeDefined();
  });
  it("partial-credit monotonicity: a superset of correct blanks never scores lower (T-3)", () => {
    const k = { b1: { accept: ["a"] }, b2: { accept: ["b"] }, b3: { accept: ["c"] } };
    const one = g.grade({ blanks: { b1: "a" } }, k).score;
    const two = g.grade({ blanks: { b1: "a", b2: "b" } }, k).score;
    const three = g.grade({ blanks: { b1: "a", b2: "b", b3: "c" } }, k).score;
    expect(two).toBeGreaterThanOrEqual(one);
    expect(three).toBeGreaterThanOrEqual(two);
  });
});

describe("error_correction (P20) — spot / spot_and_fix", () => {
  const g = errorCorrectionGrader;
  it("spot-only: exact token set → correct", () => {
    const r = g.grade({ selected_tokens: ["w2"] }, { error_tokens: ["w2"], task: "spot", error_tag: "subj_verb_agreement" });
    expect(r).toMatchObject({ correct: true, score: 1, feedback: "subj_verb_agreement" });
  });
  it("spot-only: wrong token → 0", () => {
    expect(g.grade({ selected_tokens: ["w1"] }, { error_tokens: ["w2"], task: "spot" }).correct).toBe(false);
  });
  it("spot_and_fix: spot right + fix right → 1.0", () => {
    const key = { error_tokens: ["w2"], corrections: { w2: ["has"] } };
    expect(g.grade({ selected_tokens: ["w2"], corrections: { w2: "has" } }, key)).toMatchObject({
      correct: true,
      score: 1,
    });
  });
  it("spot_and_fix: spot right + fix wrong → 0.5, not passed (06 §P20)", () => {
    const key = { error_tokens: ["w2"], corrections: { w2: ["has"] } };
    const r = g.grade({ selected_tokens: ["w2"], corrections: { w2: "have" } }, key);
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0.5);
  });
  it("spot_and_fix: spot wrong → 0 regardless of fix", () => {
    const key = { error_tokens: ["w2"], corrections: { w2: ["has"] } };
    expect(g.grade({ selected_tokens: ["w3"], corrections: { w2: "has" } }, key).score).toBe(0);
  });
});

describe("registry dispatch", () => {
  it("getGrader resolves every Wave-1 primitive", () => {
    for (const p of [
      "meaning_recognition",
      "word_retrieval",
      "chunk_retrieval",
      "sentence_construction",
      "cloze",
      "error_correction",
    ]) {
      expect(getGrader(p)?.type).toBe(p);
    }
  });
  it("gradeAttempt dispatches by primitive", () => {
    expect(gradeAttempt("word_retrieval", { text: "teacher" }, { accept: ["teacher"] }).correct).toBe(true);
  });
  it("gradeAttempt throws on unknown primitive (caller returns 4xx, never a silent wrong)", () => {
    expect(() => gradeAttempt("roleplay", {}, {})).toThrow(/No Tier-0 grader/);
  });
  it("exposes a stable grader version", () => {
    expect(GRADER_VERSION).toBe("wave1-graders@1");
  });
  it("graders never throw on malformed client input", () => {
    expect(() => meaningRecognitionGrader.grade({} as never, {} as never)).not.toThrow();
    expect(() => wordRetrievalGrader.grade({} as never, {} as never)).not.toThrow();
    expect(() => clozeGrader.grade({} as never, {} as never)).not.toThrow();
    expect(() => sentenceConstructionGrader.grade({} as never, {} as never)).not.toThrow();
    expect(() => chunkRetrievalGrader.grade({} as never, {} as never)).not.toThrow();
    expect(() => errorCorrectionGrader.grade({} as never, {} as never)).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import {
  MASTERY_MIN_ATTEMPTS,
  MASTERY_THRESHOLD,
  MASTERY_WINDOW,
  computeMastery,
  nextAbility,
  orderByAbility,
} from "../../supabase/functions/_shared/learnerProgress";

/**
 * CHARACTERIZATION + golden vectors — the grading engine's mastery core
 * (plan 05 §1: "what the existing EWMA actually does", 12 §T0 grading
 * characterization).
 *
 * This module is pure TypeScript with zero imports and no Deno globals
 * [observed], so it is safe to exercise under vitest despite living in
 * supabase/functions/. Anything in _shared/ that grows a URL import or
 * Deno.* call must NOT be imported here — that is what the vitest config
 * warning refers to.
 *
 * Plan 05 replaces this window-mean with a time-decayed Beta posterior in
 * Phase 2; these vectors are the before-picture that migration must
 * reconcile against (05 §8 dual-write diff).
 */

describe("constants the curriculum gates depend on", () => {
  it("pins the published thresholds", () => {
    expect(MASTERY_THRESHOLD).toBe(0.8);
    expect(MASTERY_MIN_ATTEMPTS).toBe(5);
    expect(MASTERY_WINDOW).toBe(10);
  });
});

describe("computeMastery golden vectors", () => {
  it("first-ever attempt, correct", () => {
    const r = computeMastery(null, true);
    expect(r).toEqual({
      mastery: 1,
      ability: nextAbility(0.3, true), // 0.3 + 0.08*0.7 = 0.356
      attempts: 1,
      correct: 1,
      window: [1],
      mastered: false, // needs MASTERY_MIN_ATTEMPTS
      newlyMastered: false,
    });
    expect(r.ability).toBe(0.356);
  });

  it("first-ever attempt, incorrect", () => {
    const r = computeMastery(null, false);
    expect(r.mastery).toBe(0);
    expect(r.attempts).toBe(1);
    expect(r.correct).toBe(0);
    expect(r.window).toEqual([0]);
    expect(r.ability).toBe(0.252); // 0.3 - 0.16*0.3
  });

  it("crossing the mastery gate: 4 correct then a 5th correct → newlyMastered", () => {
    const row = { mastery: 1, ability: 0.5, attempts: 4, correct: 4, recent_window: [1, 1, 1, 1] };
    const r = computeMastery(row, true);
    expect(r.attempts).toBe(5);
    expect(r.mastery).toBe(1);
    expect(r.mastered).toBe(true);
    expect(r.newlyMastered).toBe(true); // wasMastered=false because attempts(4) < 5
  });

  it("already mastered → mastered stays true, newlyMastered false", () => {
    const row = { mastery: 0.9, ability: 0.6, attempts: 9, correct: 8, recent_window: [1, 1, 1, 1, 1, 1, 1, 1, 0] };
    const r = computeMastery(row, true);
    expect(r.mastered).toBe(true);
    expect(r.newlyMastered).toBe(false);
  });

  it("window is capped at MASTERY_WINDOW and drops the oldest sample", () => {
    const row = { attempts: 12, correct: 10, recent_window: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1] };
    const r = computeMastery(row, false);
    expect(r.window).toHaveLength(MASTERY_WINDOW);
    expect(r.window).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 0]); // leading 0 dropped, new 0 appended
    expect(r.mastery).toBe(0.9);
  });

  it("KNOWN DEFECT (pinned, do not 'fix' silently): a mastered skill can never decay below the gate while idle", () => {
    // 05 §1 [observed]: mastery derives only from the last 10 attempts —
    // there is no time decay. A learner mastered a year ago still reads
    // mastered. Phase 2 replaces this; the vector documents the before-state.
    const row = { mastery: 1, ability: 0.9, attempts: 100, correct: 100, recent_window: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] };
    const r = computeMastery(row, false); // one failure after long mastery
    expect(r.mastery).toBe(0.9); // still ≥ threshold
    expect(r.mastered).toBe(true);
  });

  it("malformed recent_window (non-array) is treated as empty", () => {
    const r = computeMastery({ attempts: 3, correct: 2, recent_window: "corrupt" }, true);
    expect(r.window).toEqual([1]);
    expect(r.mastery).toBe(1);
  });
});

describe("nextAbility golden vectors", () => {
  it("asymmetric EWMA: gains 8% of headroom, loses 16% of value", () => {
    expect(nextAbility(0.5, true)).toBe(0.54);
    expect(nextAbility(0.5, false)).toBe(0.42);
  });

  it("clamps to [0.05, 0.95]", () => {
    expect(nextAbility(0.95, true)).toBe(0.95);
    expect(nextAbility(0.05, false)).toBe(0.05);
  });

  it("non-finite ability resets to the 0.3 prior", () => {
    expect(nextAbility(NaN, true)).toBe(0.356);
    expect(nextAbility(Infinity, false)).toBe(0.252);
  });
});

describe("orderByAbility (characterization — replaced by five-phase composer in 06 §E6)", () => {
  it("sorts by |difficulty − ability| with position as tiebreak", () => {
    const items = [
      { id: "hard", difficulty: 0.9, position: 0 },
      { id: "easy", difficulty: 0.2, position: 1 },
      { id: "mid", difficulty: 0.5, position: 2 },
      { id: "mid2", difficulty: 0.5, position: 0 },
    ];
    const out = orderByAbility(items, 0.5).map((i) => i.id);
    expect(out).toEqual(["mid2", "mid", "easy", "hard"]);
  });

  it("missing difficulty defaults to 0.5", () => {
    const out = orderByAbility([{ id: "a", position: 1 }, { id: "b", difficulty: 0.5, position: 0 }], 0.5);
    expect(out.map((i) => i.id)).toEqual(["b", "a"]);
  });
});

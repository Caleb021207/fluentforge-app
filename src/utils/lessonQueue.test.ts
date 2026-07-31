import { describe, expect, it } from "vitest";
import { applyGrade, buildRequeue, endOfPassOutcome } from "./lessonQueue";

/** Fold a sequence of graded answers into the wrong-id list. */
const runPass = (
  wrongIds: string[],
  answers: Array<[id: string, correct: boolean]>,
): string[] => answers.reduce((acc, [id, ok]) => applyGrade(acc, id, ok), wrongIds);

describe("lessonQueue golden vectors", () => {
  it("all correct -> complete", () => {
    const order = ["a", "b", "c"];
    const wrong = runPass(
      [],
      order.map((id) => [id, true] as [string, boolean]),
    );
    expect(wrong).toEqual([]);
    expect(
      endOfPassOutcome({ serverComplete: true, passOrder: order, wrongIds: wrong }),
    ).toEqual({ kind: "complete" });
  });

  it("some wrong -> requeue exactly those, in presentation order", () => {
    const order = ["a", "b", "c", "d"];
    const wrong = runPass([], [
      ["a", true],
      ["b", false],
      ["c", true],
      ["d", false],
    ]);
    expect(wrong).toEqual(["b", "d"]);
    expect(
      endOfPassOutcome({ serverComplete: false, passOrder: order, wrongIds: wrong }),
    ).toEqual({ kind: "requeue", queue: ["b", "d"] });
  });

  it("second-pass partial -> shrinking queue until server says complete", () => {
    // Pass 1: miss b and c.
    const order = ["a", "b", "c", "d"];
    let wrong = runPass([], [
      ["a", true],
      ["b", false],
      ["c", false],
      ["d", true],
    ]);
    let outcome = endOfPassOutcome({
      serverComplete: false,
      passOrder: order,
      wrongIds: wrong,
    });
    expect(outcome).toEqual({ kind: "requeue", queue: ["b", "c"] });

    // Pass 2: solve b, miss c again -> queue shrinks to just c.
    wrong = runPass(wrong, [
      ["b", true],
      ["c", false],
    ]);
    outcome = endOfPassOutcome({
      serverComplete: false,
      passOrder: ["b", "c"],
      wrongIds: wrong,
    });
    expect(outcome).toEqual({ kind: "requeue", queue: ["c"] });

    // Pass 3: solve c, server confirms completion.
    wrong = runPass(wrong, [["c", true]]);
    expect(wrong).toEqual([]);
    expect(
      endOfPassOutcome({ serverComplete: true, passOrder: ["c"], wrongIds: wrong }),
    ).toEqual({ kind: "complete" });
  });

  it("server incomplete with nothing left to retry -> blocked (never claims complete)", () => {
    expect(
      endOfPassOutcome({ serverComplete: false, passOrder: ["a", "b"], wrongIds: [] }),
    ).toEqual({ kind: "blocked" });
  });

  it("server completion wins even with client-side wrongs (solved in an earlier session)", () => {
    expect(
      endOfPassOutcome({ serverComplete: true, passOrder: ["a", "b"], wrongIds: ["b"] }),
    ).toEqual({ kind: "complete" });
  });
});

describe("applyGrade", () => {
  it("never duplicates an id and does not mutate its input", () => {
    const w1 = applyGrade([], "a", false);
    const w2 = applyGrade(w1, "a", false);
    expect(w2).toEqual(["a"]);
    const w3 = applyGrade(w2, "a", true);
    expect(w3).toEqual([]);
    expect(w2).toEqual(["a"]); // input untouched by the later call
    expect(w1).toEqual(["a"]);
  });

  it("a correct answer removes only that id", () => {
    expect(applyGrade(["a", "b"], "a", true)).toEqual(["b"]);
  });
});

describe("buildRequeue", () => {
  it("keeps pass order and ignores ids not in the pass", () => {
    expect(buildRequeue(["a", "b", "c"], ["c", "a", "zz"])).toEqual(["a", "c"]);
  });

  it("empty wrong list -> empty queue", () => {
    expect(buildRequeue(["a", "b"], [])).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  FINISHED_STATUSES,
  TERMINAL_STATUSES,
  isFinished,
  isInProgress,
  isTerminal,
  needsGrading,
  statusLabel,
} from "./assignmentStatus";

/**
 * CHARACTERIZATION + golden vectors — assignment status semantics.
 *
 * These helpers are the single source of truth that fixed the
 * grading-corrupts-metrics defect (01 §2 item; 03 row 12/13 lineage):
 * before them, dashboards filtered on the literal 'completed' and every
 * graded submission vanished from completion metrics. Any change to these
 * vectors changes teacher-facing numbers — treat failures as breaking.
 */

const LIFECYCLE = ["pending", "in_progress", "completed", "incomplete", "graded"] as const;

describe("status vocabulary golden vectors", () => {
  const expected: Record<
    (typeof LIFECYCLE)[number],
    { finished: boolean; terminal: boolean; inProgress: boolean; needsGrading: boolean; label: string }
  > = {
    pending: { finished: false, terminal: false, inProgress: false, needsGrading: false, label: "Not started" },
    in_progress: { finished: false, terminal: false, inProgress: true, needsGrading: false, label: "In progress" },
    completed: { finished: true, terminal: true, inProgress: false, needsGrading: true, label: "Completed" },
    incomplete: { finished: false, terminal: true, inProgress: false, needsGrading: false, label: "Incomplete" },
    graded: { finished: true, terminal: true, inProgress: false, needsGrading: false, label: "Graded" },
  };

  for (const status of LIFECYCLE) {
    it(`vector: ${status}`, () => {
      expect(isFinished(status)).toBe(expected[status].finished);
      expect(isTerminal(status)).toBe(expected[status].terminal);
      expect(isInProgress(status)).toBe(expected[status].inProgress);
      expect(needsGrading(status)).toBe(expected[status].needsGrading);
      expect(statusLabel(status)).toBe(expected[status].label);
    });
  }
});

describe("the regression this module exists to prevent", () => {
  it("grading a completed submission must NOT remove it from completion metrics", () => {
    // The old bug: dashboards used `status === 'completed'`, so 'graded' fell out.
    expect(isFinished("completed")).toBe(true);
    expect(isFinished("graded")).toBe(true);
  });

  it("'graded' leaves the needs-grading queue; 'completed' is the queue", () => {
    expect(needsGrading("completed")).toBe(true);
    expect(needsGrading("graded")).toBe(false);
  });
});

describe("defensive behavior", () => {
  it("null/undefined/unknown are never finished, terminal, or gradable", () => {
    for (const v of [null, undefined, "", "bogus"]) {
      expect(isFinished(v as never)).toBe(false);
      expect(isTerminal(v as never)).toBe(false);
      expect(needsGrading(v as never)).toBe(false);
    }
    expect(statusLabel("bogus")).toBe("Unknown");
    expect(statusLabel(null)).toBe("Unknown");
  });

  it("exported status sets stay consistent with the predicates", () => {
    expect([...FINISHED_STATUSES].sort()).toEqual(["completed", "graded"]);
    expect([...TERMINAL_STATUSES].sort()).toEqual(["completed", "graded", "incomplete"]);
  });
});

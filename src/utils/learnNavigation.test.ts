import { describe, expect, it } from "vitest";
import { findNextLesson, isLessonDone, unitAnchorId, NavUnit } from "./learnNavigation";

const lesson = (id: string, done: boolean) => ({
  id,
  title: `Lesson ${id}`,
  progress: done ? { status: "completed", completed_at: "2026-01-01T00:00:00Z" } : null,
});

const unit = (id: string, unlocked: boolean, lessonSpecs: Array<[string, boolean]>): NavUnit => ({
  id,
  unlocked,
  skills: [{ lessons: lessonSpecs.map(([lid, done]) => lesson(lid, done)) }],
});

describe("findNextLesson", () => {
  it("returns the first unsolved lesson of the first unlocked unit", () => {
    const units = [unit("u1", true, [["l1", true], ["l2", false], ["l3", false]])];
    expect(findNextLesson(units)).toEqual({ unitId: "u1", lessonId: "l2", title: "Lesson l2" });
  });

  it("skips locked units even when they hold unsolved lessons", () => {
    const units = [
      unit("u1", false, [["l1", false]]),
      unit("u2", true, [["l2", false]]),
    ];
    expect(findNextLesson(units)).toEqual({ unitId: "u2", lessonId: "l2", title: "Lesson l2" });
  });

  it("crosses into the next unlocked unit when the current one is fully completed", () => {
    const units = [
      unit("u1", true, [["l1", true], ["l2", true]]),
      unit("u2", true, [["l3", false]]),
    ];
    expect(findNextLesson(units)).toEqual({ unitId: "u2", lessonId: "l3", title: "Lesson l3" });
  });

  it("returns null when every unlocked lesson is done", () => {
    const units = [unit("u1", true, [["l1", true]]), unit("u2", false, [["l2", false]])];
    expect(findNextLesson(units)).toBeNull();
  });

  it("returns null for an empty path", () => {
    expect(findNextLesson([])).toBeNull();
  });
});

describe("isLessonDone", () => {
  it("counts completed_at alone as done (mirrors Learn.tsx chips)", () => {
    expect(
      isLessonDone({ id: "l", title: "L", progress: { completed_at: "2026-01-01" } }),
    ).toBe(true);
  });

  it("counts status 'completed' alone as done (mirrors unit clearing)", () => {
    expect(isLessonDone({ id: "l", title: "L", progress: { status: "completed" } })).toBe(true);
  });

  it("in-progress or missing progress is not done", () => {
    expect(isLessonDone({ id: "l", title: "L", progress: { status: "in_progress" } })).toBe(false);
    expect(isLessonDone({ id: "l", title: "L", progress: null })).toBe(false);
    expect(isLessonDone({ id: "l", title: "L" })).toBe(false);
  });
});

describe("unitAnchorId", () => {
  it("is stable and prefix-namespaced", () => {
    expect(unitAnchorId("abc-123")).toBe("unit-abc-123");
  });
});

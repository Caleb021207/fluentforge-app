import { describe, expect, it } from "vitest";
import {
  effectiveStreak,
  mergeLeaderboardRows,
  rankLeaderboard,
  type CanonicalStreakRow,
  type ProgressionRow,
} from "../../supabase/functions/_shared/streakLeaderboard";

/**
 * WORKSTREAM 1.5 — streak/leaderboard coherence (wip-01a F6.3; plan 05 §7
 * rule 4: learner_streaks is canonical, current_streak_days is frozen).
 *
 * The exact bug being pinned: get-leaderboard-data sorted the streak board
 * by user_progression.current_streak_days, which only the broken
 * check-streak function ever advanced, while real progress advances
 * learner_streaks.current_streak — so the board ranked by a number almost
 * nothing writes and three streak values could disagree on one screen.
 */

const prog = (
  user_id: string,
  fields: Partial<ProgressionRow> = {}
): ProgressionRow => ({ user_id, ...fields });

const canon = (user_id: string, current_streak: number): CanonicalStreakRow => ({
  user_id,
  current_streak,
});

describe("effectiveStreak — canonical-wins semantics (05 §7)", () => {
  it("prefers learner_streaks when the row exists", () => {
    expect(
      effectiveStreak(canon("u1", 7), prog("u1", { current_streak_days: 99 }))
    ).toEqual({ value: 7, source: "learner_streaks" });
  });

  it("a canonical 0 is NOT rescued by a stale legacy number", () => {
    expect(
      effectiveStreak(canon("u1", 0), prog("u1", { current_streak_days: 42 }))
    ).toEqual({ value: 0, source: "learner_streaks" });
  });

  it("falls back to user_progression only when no canonical row exists", () => {
    expect(
      effectiveStreak(undefined, prog("u1", { current_streak_days: 5 }))
    ).toEqual({ value: 5, source: "user_progression" });
  });

  it("defaults to 0 when neither source has data", () => {
    expect(effectiveStreak(undefined, undefined)).toEqual({
      value: 0,
      source: "user_progression",
    });
    expect(effectiveStreak({ user_id: "u1", current_streak: null }, undefined))
      .toEqual({ value: 0, source: "learner_streaks" });
  });
});

describe("mergeLeaderboardRows", () => {
  it("covers the union of user_ids from both sources", () => {
    const merged = mergeLeaderboardRows(
      [prog("only-progression", { total_xp: 100 })],
      [canon("only-canonical", 3)]
    );
    const ids = merged.map((r) => r.user_id).sort();
    expect(ids).toEqual(["only-canonical", "only-progression"]);
  });

  it("keeps display fields from progression and streak from canonical", () => {
    const merged = mergeLeaderboardRows(
      [
        prog("u1", {
          total_xp: 500,
          current_level: 4,
          current_streak_days: 1, // stale legacy — must lose
          lessons_completed: 12,
        }),
      ],
      [canon("u1", 9)]
    );
    expect(merged).toEqual([
      {
        user_id: "u1",
        total_xp: 500,
        current_level: 4,
        current_streak_days: 9,
        lessons_completed: 12,
        streak_source: "learner_streaks",
      },
    ]);
  });

  it("defaults numeric display fields for canonical-only users", () => {
    const [row] = mergeLeaderboardRows([], [canon("u1", 2)]);
    expect(row.total_xp).toBe(0);
    expect(row.current_level).toBe(1);
    expect(row.lessons_completed).toBe(0);
    expect(row.current_streak_days).toBe(2);
  });

  it("de-duplicates repeated rows per user (first wins)", () => {
    const merged = mergeLeaderboardRows(
      [prog("u1", { total_xp: 10 }), prog("u1", { total_xp: 999 })],
      [canon("u1", 5), canon("u1", 50)]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].total_xp).toBe(10);
    expect(merged[0].current_streak_days).toBe(5);
  });
});

describe("rankLeaderboard", () => {
  const rows = mergeLeaderboardRows(
    [
      prog("dead-column-hero", { total_xp: 10, current_streak_days: 40 }),
      prog("real-streaker", { total_xp: 20, current_streak_days: 0 }),
      prog("legacy-only", { total_xp: 5, current_streak_days: 6 }),
    ],
    [
      canon("dead-column-hero", 0), // canonical says the 40 is stale
      canon("real-streaker", 12),
    ]
  );

  it("F6.3 regression: streak board ranks by canonical streak, not the dead column", () => {
    const ranked = rankLeaderboard(rows, "streak", 50);
    expect(ranked.map((r) => r.user_id)).toEqual([
      "real-streaker", // canonical 12
      "legacy-only", // fallback 6 (no canonical row)
      "dead-column-hero", // canonical 0 beats stale legacy 40
    ]);
  });

  it("sorts xp and lessons boards by their own keys", () => {
    const byXp = rankLeaderboard(rows, "xp", 50);
    expect(byXp[0].user_id).toBe("real-streaker");
    const byLessons = rankLeaderboard(
      mergeLeaderboardRows(
        [
          prog("a", { lessons_completed: 3 }),
          prog("b", { lessons_completed: 30 }),
        ],
        []
      ),
      "lessons",
      50
    );
    expect(byLessons[0].user_id).toBe("b");
  });

  it("applies the limit after sorting", () => {
    expect(rankLeaderboard(rows, "streak", 2)).toHaveLength(2);
  });

  it("is deterministic on ties (xp desc, then user_id asc)", () => {
    const tied = mergeLeaderboardRows(
      [
        prog("bbb", { total_xp: 10 }),
        prog("aaa", { total_xp: 10 }),
        prog("ccc", { total_xp: 90 }),
      ],
      [canon("aaa", 4), canon("bbb", 4), canon("ccc", 4)]
    );
    const ranked = rankLeaderboard(tied, "streak", 50);
    expect(ranked.map((r) => r.user_id)).toEqual(["ccc", "aaa", "bbb"]);
  });

  it("tolerates a nonsensical limit by returning everything", () => {
    expect(rankLeaderboard(rows, "streak", Number.NaN)).toHaveLength(3);
    expect(rankLeaderboard(rows, "streak", -1)).toHaveLength(3);
  });
});

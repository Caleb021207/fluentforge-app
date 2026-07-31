/**
 * Streak/leaderboard coherence — pure merge + rank logic for
 * get-leaderboard-data (wip-01a F6.3; plan 05 §7 rule 4).
 *
 * The bug: three streak numbers could disagree on one screen because the
 * leaderboard sorted by user_progression.current_streak_days — a column
 * only the broken check-streak function ever advanced — while real
 * progress advances learner_streaks.current_streak (touchStreak,
 * _shared/learnerProgress.ts). Plan 05 §7: learner_streaks is CANONICAL;
 * current_streak_days is frozen legacy kept for audit.
 *
 * These helpers merge the two sources with canonical-wins semantics:
 * a learner_streaks row, when present, is the truth (even when 0 — a
 * canonical 0 must not be "rescued" by a stale legacy number); the legacy
 * column is only a fallback for users the canonical table has never seen.
 *
 * IMPORT-CLEAN: pure TypeScript, zero imports, no Deno globals — safe
 * under vitest (same rule as _shared/learnerProgress.ts).
 */

export interface ProgressionRow {
  user_id: string;
  total_xp?: number | null;
  current_level?: number | null;
  current_streak_days?: number | null;
  lessons_completed?: number | null;
}

export interface CanonicalStreakRow {
  user_id: string;
  current_streak?: number | null;
}

export interface MergedLeaderboardRow {
  user_id: string;
  total_xp: number;
  current_level: number;
  /** Effective (coherent) streak — canonical when the row exists, else legacy. */
  current_streak_days: number;
  lessons_completed: number;
  /** True when the streak came from learner_streaks (canonical). */
  streak_source: "learner_streaks" | "user_progression";
}

export type LeaderboardSortType = "xp" | "streak" | "lessons";

/**
 * Canonical-wins effective streak. A learner_streaks row — even one whose
 * current_streak is 0 — overrides the frozen legacy column; the legacy
 * value applies only when no canonical row exists at all.
 */
export function effectiveStreak(
  canonical: CanonicalStreakRow | undefined,
  legacy: ProgressionRow | undefined,
): { value: number; source: MergedLeaderboardRow["streak_source"] } {
  if (canonical !== undefined) {
    return { value: canonical.current_streak ?? 0, source: "learner_streaks" };
  }
  return {
    value: legacy?.current_streak_days ?? 0,
    source: "user_progression",
  };
}

/**
 * Merge progression rows with canonical streak rows into display rows.
 * The result covers the UNION of user_ids from both inputs (a user with a
 * canonical streak but no progression row still belongs on a streak
 * board), de-duplicated, with numeric fields defaulted to 0.
 */
export function mergeLeaderboardRows(
  progressionRows: readonly ProgressionRow[],
  canonicalRows: readonly CanonicalStreakRow[],
): MergedLeaderboardRow[] {
  const progressionByUser = new Map<string, ProgressionRow>();
  for (const row of progressionRows) {
    if (!progressionByUser.has(row.user_id)) {
      progressionByUser.set(row.user_id, row);
    }
  }
  const canonicalByUser = new Map<string, CanonicalStreakRow>();
  for (const row of canonicalRows) {
    if (!canonicalByUser.has(row.user_id)) {
      canonicalByUser.set(row.user_id, row);
    }
  }

  const userIds = new Set<string>([
    ...progressionByUser.keys(),
    ...canonicalByUser.keys(),
  ]);

  const merged: MergedLeaderboardRow[] = [];
  for (const userId of userIds) {
    const progression = progressionByUser.get(userId);
    const canonical = canonicalByUser.get(userId);
    const streak = effectiveStreak(canonical, progression);
    merged.push({
      user_id: userId,
      total_xp: progression?.total_xp ?? 0,
      current_level: progression?.current_level ?? 1,
      current_streak_days: streak.value,
      lessons_completed: progression?.lessons_completed ?? 0,
      streak_source: streak.source,
    });
  }
  return merged;
}

/**
 * Stable rank: primary key descending by the requested type, ties broken
 * by total_xp descending, then user_id ascending (deterministic order —
 * no duplicate-rank flapping between refreshes).
 */
export function rankLeaderboard(
  rows: readonly MergedLeaderboardRow[],
  type: LeaderboardSortType,
  limit: number,
): MergedLeaderboardRow[] {
  const key = (row: MergedLeaderboardRow): number => {
    if (type === "streak") return row.current_streak_days;
    if (type === "lessons") return row.lessons_completed;
    return row.total_xp;
  };
  const sorted = [...rows].sort((a, b) => {
    const primary = key(b) - key(a);
    if (primary !== 0) return primary;
    const xpTie = (b.total_xp ?? 0) - (a.total_xp ?? 0);
    if (xpTie !== 0) return xpTie;
    return a.user_id < b.user_id ? -1 : a.user_id > b.user_id ? 1 : 0;
  });
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : sorted.length;
  return sorted.slice(0, safeLimit);
}

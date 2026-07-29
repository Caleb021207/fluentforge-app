/**
 * Shared learner-progress engine.
 *
 * Everything in here runs with the service role inside edge functions: mastery,
 * adaptive difficulty, XP and streaks are authoritative server state. The
 * browser never writes any of these tables (RLS grants students SELECT only).
 */

export interface SupabaseLike {
  // deno-lint-ignore no-explicit-any
  from: (t: string) => any;
  // deno-lint-ignore no-explicit-any
  rpc: (fn: string, args?: Record<string, unknown>) => any;
}

/* ------------------------------------------------------------ mastery/BKT */

/** Rolling-accuracy window used for skill mastery. */
export const MASTERY_WINDOW = 10;
/** A skill counts as mastered (and unlocks the next unit) at this accuracy... */
export const MASTERY_THRESHOLD = 0.8;
/** ...but only after this many recorded attempts. */
export const MASTERY_MIN_ATTEMPTS = 5;

/** Birdbrain-style ability update: climb slowly on wins, ease down fast on losses. */
export function nextAbility(ability: number, correct: boolean): number {
  const a = Number.isFinite(ability) ? ability : 0.3;
  const updated = correct ? a + 0.08 * (1 - a) : a - 0.16 * a;
  return Number(Math.min(0.95, Math.max(0.05, updated)).toFixed(4));
}

export interface MasteryUpdate {
  mastery: number;
  ability: number;
  attempts: number;
  correct: number;
  window: number[];
  mastered: boolean;
  newlyMastered: boolean;
}

export function computeMastery(
  row: { mastery?: number; ability?: number; attempts?: number; correct?: number; recent_window?: unknown } | null,
  isCorrect: boolean,
): MasteryUpdate {
  const prevWindow: number[] = Array.isArray(row?.recent_window) ? (row!.recent_window as number[]) : [];
  const window = [...prevWindow, isCorrect ? 1 : 0].slice(-MASTERY_WINDOW);
  const attempts = (row?.attempts ?? 0) + 1;
  const correct = (row?.correct ?? 0) + (isCorrect ? 1 : 0);
  const mastery = Number((window.reduce((a, b) => a + b, 0) / window.length).toFixed(4));
  const ability = nextAbility(row?.ability ?? 0.3, isCorrect);
  const wasMastered =
    (row?.attempts ?? 0) >= MASTERY_MIN_ATTEMPTS && (row?.mastery ?? 0) >= MASTERY_THRESHOLD;
  const mastered = attempts >= MASTERY_MIN_ATTEMPTS && mastery >= MASTERY_THRESHOLD;
  return { mastery, ability, attempts, correct, window, mastered, newlyMastered: mastered && !wasMastered };
}

/**
 * Adaptive ordering: serve items whose difficulty sits closest to the learner's
 * current ability, so the queue stays inside the zone of proximal development.
 */
export function orderByAbility<T extends { difficulty?: number | null; position?: number }>(
  items: T[],
  ability: number,
): T[] {
  return [...items].sort((a, b) => {
    const da = Math.abs((a.difficulty ?? 0.5) - ability);
    const db = Math.abs((b.difficulty ?? 0.5) - ability);
    if (Math.abs(da - db) > 0.001) return da - db;
    return (a.position ?? 0) - (b.position ?? 0);
  });
}

/* ------------------------------------------------------------------ streak */

function utcDate(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/**
 * Streaks only advance on *meaningful* work (mastery progress or a completed
 * spaced review), never on raw taps. One missed day can be absorbed by a
 * streak freeze; freezes refill to 2 at the start of each calendar month.
 */
export async function touchStreak(db: SupabaseLike, userId: string) {
  const today = utcDate();
  const monthStart = today.slice(0, 7) + "-01";

  const { data: row } = await db
    .from("learner_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!row) {
    const insert = {
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      freezes_available: 2,
      freeze_refilled_on: monthStart,
    };
    await db.from("learner_streaks").insert(insert);
    return { ...insert, freeze_used: false };
  }

  let freezes = row.freezes_available ?? 0;
  let freezesUsed = row.freezes_used ?? 0;
  let lastFreeze = row.last_freeze_used_on ?? null;
  let refilled = row.freeze_refilled_on ?? null;
  if (refilled !== monthStart) {
    freezes = 2;
    refilled = monthStart;
  }

  const last = row.last_activity_date as string | null;
  let streak = row.current_streak ?? 0;
  let usedFreeze = false;

  if (last === today) {
    // Already counted today; only persist a possible freeze refill.
    if (refilled !== row.freeze_refilled_on) {
      await db
        .from("learner_streaks")
        .update({ freezes_available: freezes, freeze_refilled_on: refilled })
        .eq("user_id", userId);
    }
    return { ...row, freezes_available: freezes, freeze_used: false };
  }

  const gap = last ? daysBetween(last, today) : Infinity;
  if (gap === 1) {
    streak += 1;
  } else if (gap === 2 && freezes > 0) {
    // One missed day absorbed by a freeze — the streak survives.
    streak += 1;
    freezes -= 1;
    freezesUsed += 1;
    lastFreeze = utcDate(new Date(Date.parse(today) - 86_400_000));
    usedFreeze = true;
  } else {
    streak = 1;
  }

  const longest = Math.max(row.longest_streak ?? 0, streak);
  const update = {
    current_streak: streak,
    longest_streak: longest,
    last_activity_date: today,
    freezes_available: freezes,
    freezes_used: freezesUsed,
    last_freeze_used_on: lastFreeze,
    freeze_refilled_on: refilled,
  };
  await db.from("learner_streaks").update(update).eq("user_id", userId);
  return { ...row, ...update, freeze_used: usedFreeze };
}

/* ---------------------------------------------------------------------- XP */

export const XP = {
  exercise_first_correct: 5,
  lesson_complete: 20,
  skill_mastered: 30,
  vocab_review: 3,
  vocab_review_lapse: 1,
};

/** Record an XP event and roll it into user_progression (server-side only). */
export async function awardXp(
  db: SupabaseLike,
  userId: string,
  source: string,
  amount: number,
  ref?: { type?: string; id?: string; metadata?: Record<string, unknown> },
) {
  if (amount <= 0) return { awarded: 0 };

  await db.from("xp_events").insert({
    user_id: userId,
    source,
    amount,
    ref_type: ref?.type ?? null,
    ref_id: ref?.id ?? null,
    metadata: ref?.metadata ?? {},
  });

  const { data: prog } = await db
    .from("user_progression")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const totalXp = (prog?.total_xp ?? 0) + amount;
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);

  if (prog) {
    await db
      .from("user_progression")
      .update({ total_xp: totalXp, level, current_level: level, last_activity_date: utcDate() })
      .eq("user_id", userId);
  } else {
    await db.from("user_progression").insert({
      user_id: userId,
      total_xp: totalXp,
      level,
      current_level: level,
      last_activity_date: utcDate(),
    });
  }

  return { awarded: amount, total_xp: totalXp, level, leveled_up: (prog?.level ?? 1) < level };
}

/* --------------------------------------------------------- content status */

/**
 * Learners see approved content first and fall back to gated content when a
 * lesson has not been human-approved yet. Draft/retired items never ship.
 */
export const LEARNER_STATUSES = ["operational", "gated"] as const;

export function preferOperational<T extends { status: string }>(rows: T[]): T[] {
  const operational = rows.filter((r) => r.status === "operational");
  return operational.length ? operational : rows.filter((r) => r.status === "gated");
}

/**
 * Pooled voice-allowance allocation + degrade-decision logic (Palavox overhaul
 * WS 2.3; policy source: docs/palavox-overhaul-plan/16-cost-and-capacity-model.md
 * §7 "AI allowances, pooling, and safeguards").
 *
 * This is the SINGLE SOURCE OF TRUTH for the routing arithmetic. The
 * SECURITY DEFINER RPC `public.consume_voice_minutes` (migration
 * 20260731030000_pooled_voice_allowance.sql) re-implements the SAME formulas in
 * PL/pgSQL and is behavior-tested against them in the DB harness
 * (tools/db-harness/voicePool.behavior.mjs).
 *
 * Intentionally pure TypeScript with ZERO imports and no Deno globals, so it can
 * be characterized under vitest from tests/server-pure/ (same pattern as
 * usageBounds.ts / learnerProgress.ts).
 *
 * --- Policy encoded here (16 §7) ---
 * Per activated (licensed) seat, per school year, pooled district/school-wide:
 *   • 1,000 voice minutes total pool.
 *   • 400 of those are a PROTECTED realtime sub-pool (a pooled floor, NOT an
 *     individual entitlement).
 *   • the remaining ~600 fund cascade + drill (non-realtime) routes.
 *
 * Two rules follow, and this module enforces both:
 *   1. "Drills degrade first." Non-realtime traffic (cascade, drill) may draw
 *      ONLY the general allocation (600/seat). When that is gone it degrades to
 *      a free cached/deterministic route — even though pool minutes remain,
 *      because those remaining minutes are the protected realtime reserve.
 *   2. "Realtime is the last thing to yield." Realtime traffic may draw the
 *      WHOLE pool (its 400/seat reserve plus any general headroom non-realtime
 *      has not used). It only degrades once the entire pool is exhausted.
 *
 * NEVER creates an overage and NEVER bills: at exhaustion a request is routed
 * to a cheaper/free tier (degrade-not-bill, 16 §7 "No overage billing"). Extra
 * pool capacity is *granted* by an admin raising `minutesAllocated`, never
 * invoiced.
 */

/** Per-licensed-seat allowance, per school year (16 §7 allowance table). */
export const VOICE_MINUTES_PER_SEAT = 1000;
/** Protected realtime sub-pool floor, per licensed seat (16 §7). */
export const REALTIME_MINUTES_PER_SEAT = 400;
/** Non-realtime (cascade + drill) share, per licensed seat (= total − realtime). */
export const GENERAL_MINUTES_PER_SEAT =
  VOICE_MINUTES_PER_SEAT - REALTIME_MINUTES_PER_SEAT;

/** Admin-notification threshold on total pool utilization (16 §7: notify at 80%). */
export const POOL_NOTIFY_THRESHOLD = 0.8;

/**
 * Voice tiers, most→least expensive (16 §2 route table):
 *   realtime  native S2S,           ~$0.020/min, draws the pool
 *   cascade   STT→LLM→TTS,          ~$0.013/min, draws the pool
 *   drill     live scripted/read-aloud (cached TTS + live STT + PA burst),
 *                                   ~$0.006/min, draws the pool
 *   cached    fully deterministic pre-generated audio, $0, draws NOTHING
 *   text      no voice; written interaction continues, $0, draws NOTHING
 * `cached` and `text` are the degrade *targets* — they never consume the pool.
 */
export type VoiceRoute = "realtime" | "cascade" | "drill" | "cached" | "text";

/** Routes a caller may request (only pool-drawing live routes). */
export type RequestedRoute = "realtime" | "cascade" | "drill";

export interface PoolAllocation {
  /** Licensed seats contributing to this pool. */
  seats: number;
  /** Total voice minutes in the pool (seats × 1000, or an admin-granted override). */
  minutesAllocated: number;
  /** Protected realtime floor (seats × 400). */
  realtimeReserved: number;
}

export interface PoolUsage {
  /** All live-voice minutes booked against the pool (realtime + non-realtime). */
  minutesUsed: number;
  /** Realtime subset of `minutesUsed`. */
  realtimeUsed: number;
}

export type PoolState = PoolAllocation & PoolUsage;

export interface RouteDecision {
  requestedRoute: RequestedRoute;
  requestedMinutes: number;
  /** The tier actually granted for this request. */
  route: VoiceRoute;
  /** True iff served at the requested tier (no degrade). */
  allowed: boolean;
  degraded: boolean;
  /** The cheaper route when degraded; null when `allowed`. */
  degradeTo: VoiceRoute | null;
  /** Minutes booked to the pool by this grant (0 for cached/text degrades). */
  grantedMinutes: number;
  /** Total pool minutes remaining AFTER this grant. */
  minutesRemaining: number;
  /** Protected realtime floor remaining AFTER this grant. */
  realtimeReserveRemaining: number;
  /** True iff post-grant total utilization ≥ 80% (admin notify, 16 §7). */
  notifyAdmin: boolean;
  reason:
    | "ok"
    | "nonrealtime_pool_protected"
    | "pool_exhausted"
    | "pool_unprovisioned"
    | "noop";
}

/* --------------------------------------------------------------------------- */
/* Allocation                                                                  */
/* --------------------------------------------------------------------------- */

/** Floor a seat count to a non-negative integer. */
function normSeats(seats: number): number {
  if (!Number.isFinite(seats) || seats <= 0) return 0;
  return Math.floor(seats);
}

/** Sanitize an untrusted minute quantity to a finite, non-negative number. */
function normMinutes(min: number): number {
  if (!Number.isFinite(min) || min <= 0) return 0;
  return min;
}

/** Total pooled voice minutes for a seat count (seats × 1000). */
export function allocateVoiceMinutes(seats: number): number {
  return normSeats(seats) * VOICE_MINUTES_PER_SEAT;
}

/** Protected realtime reserve for a seat count (seats × 400). */
export function allocateRealtimeReserve(seats: number): number {
  return normSeats(seats) * REALTIME_MINUTES_PER_SEAT;
}

/** Build a fresh, unused pool allocation for a seat count. */
export function allocatePool(seats: number): PoolState {
  return {
    seats: normSeats(seats),
    minutesAllocated: allocateVoiceMinutes(seats),
    realtimeReserved: allocateRealtimeReserve(seats),
    minutesUsed: 0,
    realtimeUsed: 0,
  };
}

/**
 * General (non-realtime) allocation = total − protected realtime reserve.
 * Non-realtime traffic may draw only this slice; the difference is the
 * protected floor reserved for realtime. Never negative (a hand-set allocation
 * below the reserve clamps to 0 general).
 */
export function generalAllocation(alloc: PoolAllocation): number {
  return Math.max(0, alloc.minutesAllocated - Math.max(0, alloc.realtimeReserved));
}

/** Total pool utilization in [0,1]; an unprovisioned pool reads as fully used. */
export function poolUtilization(state: PoolState): number {
  if (!(state.minutesAllocated > 0)) return 1;
  return Math.min(1, Math.max(0, state.minutesUsed) / state.minutesAllocated);
}

/* --------------------------------------------------------------------------- */
/* Degrade decision                                                            */
/* --------------------------------------------------------------------------- */

/**
 * Decide how to route `requestedMinutes` of `requestedRoute` against the pool.
 * Pure: does not mutate `state`. Book `grantedMinutes` yourself (see applyGrant).
 *
 * Caps (the whole policy in three lines):
 *   poolRemaining = minutesAllocated − minutesUsed                (realtime cap)
 *   generalRemaining = generalAllocation − (minutesUsed − realtimeUsed)
 *   nonRealtimeCap = min(generalRemaining, poolRemaining)         (cascade/drill cap)
 *
 * All-or-degrade: a request is served at its requested tier only if it fits
 * fully within its cap; otherwise the ENTIRE request degrades (booking 0), so
 * the pool can never be pushed into overage and no partial billing occurs.
 */
export function decideVoiceRoute(
  state: PoolState,
  requestedMinutes: number,
  requestedRoute: RequestedRoute,
): RouteDecision {
  const m = normMinutes(requestedMinutes);

  const minutesAllocated = Math.max(0, state.minutesAllocated);
  const realtimeReserved = Math.max(0, state.realtimeReserved);
  const minutesUsed = Math.max(0, state.minutesUsed);
  // realtimeUsed can never exceed total used.
  const realtimeUsed = Math.min(Math.max(0, state.realtimeUsed), minutesUsed);
  const nonRealtimeUsed = minutesUsed - realtimeUsed;

  const genAlloc = Math.max(0, minutesAllocated - realtimeReserved);
  const poolRemaining = Math.max(0, minutesAllocated - minutesUsed);
  const generalRemaining = Math.max(0, genAlloc - nonRealtimeUsed);
  const nonRealtimeCap = Math.min(generalRemaining, poolRemaining);

  const unprovisioned = minutesAllocated <= 0;

  // Resolve the granted route + minutes booked.
  let route: VoiceRoute;
  let grantedMinutes: number;
  let reason: RouteDecision["reason"];

  if (requestedRoute === "realtime") {
    if (m <= poolRemaining) {
      route = "realtime";
      grantedMinutes = m;
      reason = m === 0 ? "noop" : "ok";
    } else if (m <= nonRealtimeCap) {
      // Realtime yields to cascade only if cascade capacity remains. Because
      // realtime may draw the whole pool, nonRealtimeCap ≤ poolRemaining always,
      // so this branch is effectively unreachable — realtime degrades straight
      // to text at true exhaustion (documented, and asserted by tests).
      route = "cascade";
      grantedMinutes = 0;
      reason = "pool_exhausted";
    } else {
      route = "text";
      grantedMinutes = 0;
      reason = unprovisioned ? "pool_unprovisioned" : "pool_exhausted";
    }
  } else {
    // cascade | drill — non-realtime, confined to the general allocation so the
    // realtime reserve stays protected ("drills degrade first").
    if (m <= nonRealtimeCap) {
      route = requestedRoute;
      grantedMinutes = m;
      reason = m === 0 ? "noop" : "ok";
    } else {
      // Degrade to the free deterministic/cached route (never text: scripted
      // content always has a pre-generated fallback; 16 §7).
      route = "cached";
      grantedMinutes = 0;
      reason = unprovisioned
        ? "pool_unprovisioned"
        : poolRemaining > 0
          ? "nonrealtime_pool_protected"
          : "pool_exhausted";
    }
  }

  // The router never upgrades, so a route that differs from the request is
  // always a degrade (and always books 0 minutes to the pool).
  const degraded = route !== requestedRoute;
  const isRealtimeGrant = route === "realtime";
  const minutesUsedAfter = minutesUsed + grantedMinutes;
  const realtimeUsedAfter = realtimeUsed + (isRealtimeGrant ? grantedMinutes : 0);

  const minutesRemaining = Math.max(0, minutesAllocated - minutesUsedAfter);
  const realtimeReserveRemaining = Math.max(0, realtimeReserved - realtimeUsedAfter);
  const notifyAdmin =
    minutesAllocated > 0 && minutesUsedAfter / minutesAllocated >= POOL_NOTIFY_THRESHOLD;

  return {
    requestedRoute,
    requestedMinutes: m,
    route,
    allowed: !degraded,
    degraded,
    degradeTo: degraded ? route : null,
    grantedMinutes,
    minutesRemaining,
    realtimeReserveRemaining,
    notifyAdmin,
    reason,
  };
}

/**
 * Apply a decision to a pool, returning a NEW state (pure). Mirrors what the
 * `consume_voice_minutes` RPC persists: books `grantedMinutes` to `minutesUsed`
 * and, for a realtime grant, additionally to `realtimeUsed`. Useful for
 * simulating a sequence of consumptions in tests.
 */
export function applyGrant(state: PoolState, decision: RouteDecision): PoolState {
  const isRealtime = decision.route === "realtime";
  return {
    ...state,
    minutesUsed: Math.max(0, state.minutesUsed) + decision.grantedMinutes,
    realtimeUsed:
      Math.max(0, state.realtimeUsed) + (isRealtime ? decision.grantedMinutes : 0),
  };
}

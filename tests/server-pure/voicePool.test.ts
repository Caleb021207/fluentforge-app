import { describe, expect, it } from "vitest";
import {
  GENERAL_MINUTES_PER_SEAT,
  POOL_NOTIFY_THRESHOLD,
  REALTIME_MINUTES_PER_SEAT,
  VOICE_MINUTES_PER_SEAT,
  allocatePool,
  allocateRealtimeReserve,
  allocateVoiceMinutes,
  applyGrant,
  decideVoiceRoute,
  generalAllocation,
  poolUtilization,
  type PoolState,
  type RequestedRoute,
} from "../../supabase/functions/_shared/voicePool";

/**
 * Golden vectors for the pooled voice-allowance router (overhaul WS 2.3;
 * policy: docs/palavox-overhaul-plan/16-cost-and-capacity-model.md §7).
 *
 * The two headline rules of 16 §7 are pinned explicitly:
 *   • "realtime protected, drills degrade first"  (describe block below)
 *   • "realtime is the last thing to yield"
 * plus the hard safety property: the router NEVER overages the pool.
 *
 * voicePool.ts is pure with zero imports, so it is safe under vitest despite
 * living in supabase/functions/ (same pattern as usageBounds.test.ts).
 */

/** Build a pool state for `seats` seats with explicit usage. */
function pool(seats: number, minutesUsed = 0, realtimeUsed = 0): PoolState {
  return { ...allocatePool(seats), minutesUsed, realtimeUsed };
}

describe("allocation math (16 §7 per-seat allowances)", () => {
  it("exposes the documented per-seat constants", () => {
    expect(VOICE_MINUTES_PER_SEAT).toBe(1000);
    expect(REALTIME_MINUTES_PER_SEAT).toBe(400);
    expect(GENERAL_MINUTES_PER_SEAT).toBe(600);
    expect(POOL_NOTIFY_THRESHOLD).toBe(0.8);
  });

  it("scales allocation linearly with seat count", () => {
    expect(allocateVoiceMinutes(1000)).toBe(1_000_000); // 16 §7: 1,000-seat district
    expect(allocateRealtimeReserve(1000)).toBe(400_000); // ...incl 400,000 realtime
    expect(allocateVoiceMinutes(0)).toBe(0);
  });

  it("floors fractional/invalid seat counts to a non-negative integer", () => {
    expect(allocateVoiceMinutes(2.9)).toBe(2000);
    expect(allocateVoiceMinutes(-5)).toBe(0);
    expect(allocateVoiceMinutes(Number.NaN)).toBe(0);
  });

  it("general allocation is total minus the protected reserve", () => {
    expect(generalAllocation(allocatePool(1))).toBe(600);
    expect(generalAllocation(allocatePool(10))).toBe(6000);
    // A hand-set allocation below the reserve clamps general to 0.
    expect(generalAllocation({ seats: 1, minutesAllocated: 300, realtimeReserved: 400 })).toBe(0);
  });

  it("allocatePool builds a fresh, unused pool", () => {
    expect(allocatePool(3)).toEqual({
      seats: 3,
      minutesAllocated: 3000,
      realtimeReserved: 1200,
      minutesUsed: 0,
      realtimeUsed: 0,
    });
  });
});

describe("fresh pool serves every route at its requested tier", () => {
  const p = pool(1);
  for (const route of ["realtime", "cascade", "drill"] as RequestedRoute[]) {
    it(`serves ${route} unchanged`, () => {
      const d = decideVoiceRoute(p, 30, route);
      expect(d.route).toBe(route);
      expect(d.allowed).toBe(true);
      expect(d.degraded).toBe(false);
      expect(d.degradeTo).toBeNull();
      expect(d.grantedMinutes).toBe(30);
      expect(d.minutesRemaining).toBe(970);
      expect(d.reason).toBe("ok");
    });
  }

  it("realtime consumes the protected reserve; non-realtime never touches it", () => {
    expect(decideVoiceRoute(p, 100, "realtime").realtimeReserveRemaining).toBe(300);
    expect(decideVoiceRoute(p, 100, "cascade").realtimeReserveRemaining).toBe(400);
    expect(decideVoiceRoute(p, 100, "drill").realtimeReserveRemaining).toBe(400);
  });
});

describe("RULE: realtime protected, drills degrade first (16 §7)", () => {
  // General allocation (600/seat) is spent; only the 400-min realtime reserve
  // remains in the pool.
  const nearlyDrained = pool(1, /*used*/ 600, /*realtimeUsed*/ 0);

  it("a drill degrades to the free cached route even though 400 pool minutes remain", () => {
    const d = decideVoiceRoute(nearlyDrained, 10, "drill");
    expect(d.route).toBe("cached");
    expect(d.degraded).toBe(true);
    expect(d.degradeTo).toBe("cached");
    expect(d.grantedMinutes).toBe(0); // free route draws nothing
    expect(d.minutesRemaining).toBe(400); // reserve untouched
    expect(d.reason).toBe("nonrealtime_pool_protected");
  });

  it("a cascade turn degrades the same way", () => {
    const d = decideVoiceRoute(nearlyDrained, 10, "cascade");
    expect(d.route).toBe("cached");
    expect(d.degraded).toBe(true);
    expect(d.reason).toBe("nonrealtime_pool_protected");
  });

  it("BUT realtime is still served from its protected reserve in the SAME state", () => {
    const d = decideVoiceRoute(nearlyDrained, 10, "realtime");
    expect(d.route).toBe("realtime");
    expect(d.allowed).toBe(true);
    expect(d.grantedMinutes).toBe(10);
    expect(d.minutesRemaining).toBe(390);
    expect(d.realtimeReserveRemaining).toBe(390);
  });
});

describe("RULE: realtime is the last thing to yield (16 §7)", () => {
  it("realtime keeps serving until the WHOLE pool (reserve included) is gone", () => {
    // Reserve fully consumed → pool has 0 minutes left.
    const exhausted = pool(1, 1000, 400);
    const d = decideVoiceRoute(exhausted, 10, "realtime");
    expect(d.route).toBe("text"); // realtime finally degrades — to text, not cached
    expect(d.degraded).toBe(true);
    expect(d.degradeTo).toBe("text");
    expect(d.grantedMinutes).toBe(0);
    expect(d.reason).toBe("pool_exhausted");
  });

  it("at full exhaustion non-realtime is on cached and realtime is on text", () => {
    const exhausted = pool(1, 1000, 400);
    expect(decideVoiceRoute(exhausted, 5, "drill").route).toBe("cached");
    expect(decideVoiceRoute(exhausted, 5, "cascade").route).toBe("cached");
    expect(decideVoiceRoute(exhausted, 5, "realtime").route).toBe("text");
  });
});

describe("non-realtime is clamped by BOTH its general share and the physical pool", () => {
  // Realtime has already eaten into the general portion (700 realtime used),
  // so only 300 pool minutes remain even though 600 general were 'allotted'.
  const rtHeavy = pool(1, 700, 700);

  it("serves a cascade that fits the smaller (pool-limited) cap", () => {
    const d = decideVoiceRoute(rtHeavy, 250, "cascade");
    expect(d.route).toBe("cascade");
    expect(d.allowed).toBe(true);
    expect(d.grantedMinutes).toBe(250);
    expect(d.minutesRemaining).toBe(50);
  });

  it("degrades a cascade that would exceed the remaining pool (no overage)", () => {
    const d = decideVoiceRoute(rtHeavy, 350, "cascade");
    expect(d.route).toBe("cached");
    expect(d.degraded).toBe(true);
    expect(d.minutesRemaining).toBe(300); // unchanged
  });
});

describe("SAFETY: the router never overages the pool", () => {
  const routes: RequestedRoute[] = ["realtime", "cascade", "drill"];
  it("from any REACHABLE state, one more consume keeps every invariant", () => {
    for (let used = 0; used <= 1000; used += 50) {
      for (let rt = 0; rt <= used; rt += 50) {
        // Only iterate states the router can actually produce: realtime is a
        // subset of used, and non-realtime never exceeds the general share.
        if (used - rt > GENERAL_MINUTES_PER_SEAT) continue;
        const base = pool(1, used, rt);
        for (const route of routes) {
          for (const req of [1, 25, 200, 999]) {
            const d = decideVoiceRoute(base, req, route);
            const after = applyGrant(base, d);
            // Never exceeds the total pool.
            expect(after.minutesUsed).toBeLessThanOrEqual(base.minutesAllocated);
            expect(after.realtimeUsed).toBeLessThanOrEqual(after.minutesUsed);
            // Non-realtime never eats the protected reserve.
            const nonRtAfter = after.minutesUsed - after.realtimeUsed;
            expect(nonRtAfter).toBeLessThanOrEqual(GENERAL_MINUTES_PER_SEAT);
            // Granted minutes are only ever booked on a live route.
            if (d.route === "cached" || d.route === "text") {
              expect(d.grantedMinutes).toBe(0);
            }
          }
        }
      }
    }
  });
});

describe("unprovisioned pool degrades gracefully (degrade-not-deny)", () => {
  const empty = pool(0);
  it("routes realtime to text and non-realtime to cached, never erroring", () => {
    expect(decideVoiceRoute(empty, 10, "realtime")).toMatchObject({
      route: "text",
      reason: "pool_unprovisioned",
      grantedMinutes: 0,
    });
    expect(decideVoiceRoute(empty, 10, "cascade")).toMatchObject({
      route: "cached",
      reason: "pool_unprovisioned",
    });
  });
});

describe("admin notification fires at 80% total utilization (16 §7)", () => {
  it("does not notify at 79%, notifies at 80%", () => {
    expect(decideVoiceRoute(pool(1, 780, 780), 10, "realtime").notifyAdmin).toBe(false);
    expect(decideVoiceRoute(pool(1, 790, 790), 10, "realtime").notifyAdmin).toBe(true);
  });

  it("poolUtilization reports [0,1] and treats an unprovisioned pool as fully used", () => {
    expect(poolUtilization(pool(1, 0, 0))).toBe(0);
    expect(poolUtilization(pool(1, 500, 0))).toBe(0.5);
    expect(poolUtilization(pool(0))).toBe(1);
  });
});

describe("applyGrant drains the pool exactly to policy (protected floor honored)", () => {
  it("yields 600 non-realtime + 400 realtime minutes for a 1-seat pool", () => {
    let state = pool(1);
    let drillServed = 0;
    for (let i = 0; i < 10; i++) {
      const d = decideVoiceRoute(state, 100, "drill");
      if (d.route === "drill") {
        drillServed += d.grantedMinutes;
        state = applyGrant(state, d);
      }
    }
    expect(drillServed).toBe(600); // exactly the general allocation

    let realtimeServed = 0;
    for (let i = 0; i < 10; i++) {
      const d = decideVoiceRoute(state, 100, "realtime");
      if (d.route === "realtime") {
        realtimeServed += d.grantedMinutes;
        state = applyGrant(state, d);
      }
    }
    expect(realtimeServed).toBe(400); // exactly the protected reserve
    expect(state.minutesUsed).toBe(1000);
    expect(decideVoiceRoute(state, 1, "realtime").route).toBe("text");
  });
});

describe("input hygiene", () => {
  it("treats non-positive / non-finite requested minutes as a 0-minute noop", () => {
    for (const bad of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const d = decideVoiceRoute(pool(1), bad, "realtime");
      expect(d.grantedMinutes).toBe(0);
      expect(d.allowed).toBe(true);
      expect(d.reason).toBe("noop");
    }
  });

  it("books fractional minutes without rounding", () => {
    const d = decideVoiceRoute(pool(1), 12.5, "realtime");
    expect(d.grantedMinutes).toBe(12.5);
    expect(d.minutesRemaining).toBe(987.5);
  });
});

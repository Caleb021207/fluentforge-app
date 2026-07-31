import { describe, expect, it } from "vitest";
import {
  MAX_MESSAGES_PER_SESSION,
  MAX_SESSION_ID_LENGTH,
  SESSION_MINUTE_CAPS,
  SESSION_TYPES,
  VOICE_SESSION_TYPES,
  clampMessageCount,
  clampSessionMinutes,
  isVoiceSessionType,
  normalizeSessionId,
  normalizeSessionType,
} from "../../supabase/functions/_shared/usageBounds";

/**
 * Bounds logic for the usage/quota writers (overhaul WS 1.1; wip-11a D8).
 * This module is pure TypeScript with zero imports, so it is safe to
 * exercise under vitest despite living in supabase/functions/ (same
 * pattern as learnerProgress.test.ts).
 */

describe("normalizeSessionType", () => {
  it("passes through every known session type", () => {
    for (const t of SESSION_TYPES) {
      expect(normalizeSessionType(t)).toBe(t);
    }
  });

  it("collapses unknown or non-string input to text_practice", () => {
    expect(normalizeSessionType("premium_voice_practice ")).toBe("text_practice");
    expect(normalizeSessionType("PREMIUM_VOICE_PRACTICE")).toBe("text_practice");
    expect(normalizeSessionType(undefined)).toBe("text_practice");
    expect(normalizeSessionType(null)).toBe("text_practice");
    expect(normalizeSessionType(42)).toBe("text_practice");
    expect(normalizeSessionType({})).toBe("text_practice");
  });
});

describe("clampSessionMinutes — the D8 client-trust boundary", () => {
  it("caps premium realtime voice at 30 minutes (quota is 15/month, sessions auto-end)", () => {
    expect(SESSION_MINUTE_CAPS.premium_voice_practice).toBe(30);
    expect(clampSessionMinutes("premium_voice_practice", 1_000_000)).toBe(30);
  });

  it("enforces the per-type cap for every session type", () => {
    for (const t of SESSION_TYPES) {
      expect(clampSessionMinutes(t, Number.MAX_SAFE_INTEGER)).toBe(SESSION_MINUTE_CAPS[t]);
    }
  });

  it("passes plausible values through unchanged", () => {
    expect(clampSessionMinutes("premium_voice_practice", 7)).toBe(7);
    expect(clampSessionMinutes("text_practice", 45)).toBe(45);
  });

  it("floors fractional minutes so fractions cannot inflate billing", () => {
    expect(clampSessionMinutes("voice_practice", 4.9)).toBe(4);
  });

  it("collapses negative, NaN, Infinity, and non-numeric input to 0", () => {
    expect(clampSessionMinutes("lesson", -5)).toBe(0);
    expect(clampSessionMinutes("lesson", NaN)).toBe(0);
    expect(clampSessionMinutes("lesson", Infinity)).toBe(0);
    expect(clampSessionMinutes("lesson", "not-a-number")).toBe(0);
    expect(clampSessionMinutes("lesson", undefined)).toBe(0);
    expect(clampSessionMinutes("lesson", null)).toBe(0);
  });
});

describe("clampMessageCount", () => {
  it("bounds to [0, MAX_MESSAGES_PER_SESSION] and floors", () => {
    expect(clampMessageCount(5000)).toBe(MAX_MESSAGES_PER_SESSION);
    expect(clampMessageCount(12.7)).toBe(12);
    expect(clampMessageCount(-1)).toBe(0);
    expect(clampMessageCount("nope")).toBe(0);
  });
});

describe("isVoiceSessionType — voice-minute billing gate", () => {
  it("bills only voice types against the monthly voice quota", () => {
    expect(isVoiceSessionType("voice_practice")).toBe(true);
    expect(isVoiceSessionType("premium_voice_practice")).toBe(true);
    expect(isVoiceSessionType("text_practice")).toBe(false);
    expect(isVoiceSessionType("pronunciation")).toBe(false);
    expect(isVoiceSessionType("lesson")).toBe(false);
  });

  it("VOICE_SESSION_TYPES stays a strict subset of SESSION_TYPES", () => {
    for (const t of VOICE_SESSION_TYPES) {
      expect(SESSION_TYPES).toContain(t);
    }
    expect(VOICE_SESSION_TYPES.length).toBeLessThan(SESSION_TYPES.length);
  });
});

describe("normalizeSessionId", () => {
  it("accepts a normal UUID unchanged", () => {
    const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
    expect(normalizeSessionId(id)).toBe(id);
  });

  it("trims and bounds length", () => {
    expect(normalizeSessionId("  abc  ")).toBe("abc");
    expect(normalizeSessionId("x".repeat(500))).toHaveLength(MAX_SESSION_ID_LENGTH);
  });

  it("rejects empty and non-string input", () => {
    expect(normalizeSessionId("")).toBeNull();
    expect(normalizeSessionId("   ")).toBeNull();
    expect(normalizeSessionId(undefined)).toBeNull();
    expect(normalizeSessionId(null)).toBeNull();
    expect(normalizeSessionId(123)).toBeNull();
  });
});

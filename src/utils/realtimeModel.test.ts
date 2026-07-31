import { describe, expect, it } from "vitest";
import { REALTIME_MODEL, resolveRealtimeModel } from "./realtimeModel";

/**
 * D3 (wip-11a): mint and SDP exchange must agree on the realtime model,
 * with the minted session authoritative.
 */

describe("resolveRealtimeModel", () => {
  it("pins the fallback to the model the mint pins (premium-voice-realtime/index.ts)", () => {
    expect(REALTIME_MODEL).toBe("gpt-realtime-2025-08-28");
  });

  it("prefers the minted session's model when present", () => {
    expect(resolveRealtimeModel("gpt-realtime-2099-01-01")).toBe("gpt-realtime-2099-01-01");
  });

  it("falls back to the shared constant when the mint response omits the model", () => {
    expect(resolveRealtimeModel(undefined)).toBe(REALTIME_MODEL);
    expect(resolveRealtimeModel(null)).toBe(REALTIME_MODEL);
    expect(resolveRealtimeModel("")).toBe(REALTIME_MODEL);
    expect(resolveRealtimeModel(42)).toBe(REALTIME_MODEL);
  });
});

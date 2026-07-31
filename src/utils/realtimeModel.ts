/**
 * Single client-side source of truth for the OpenAI realtime model
 * (overhaul WS 1.1, 2026-07-30; wip-11a D3).
 *
 * The token mint (`supabase/functions/premium-voice-realtime/index.ts`) pins
 * "gpt-realtime-2025-08-28" when it creates the ephemeral session; the SDP
 * exchange previously pinned a DIFFERENT model
 * ("gpt-4o-realtime-preview-2024-12-17"), leaving behavior and cost ambiguous.
 *
 * Contract: the minted session's `model` field is authoritative at runtime —
 * `resolveRealtimeModel` prefers it and only falls back to this constant.
 * If the mint's pinned model changes, update this constant to match.
 *
 * Kept as a zero-import module so it can be unit-tested under vitest.
 */
export const REALTIME_MODEL = "gpt-realtime-2025-08-28";

/** Prefer the model reported by the minted session; fall back to the pinned constant. */
export function resolveRealtimeModel(mintedModel: unknown): string {
  return typeof mintedModel === "string" && mintedModel.length > 0
    ? mintedModel
    : REALTIME_MODEL;
}

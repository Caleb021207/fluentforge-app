/**
 * Pure validation/bounds logic for the usage & quota writers
 * (`track-usage`, `track-premium-voice-session`).
 *
 * Added 2026-07-30 (overhaul WS 1.1; wip-11a D8): these endpoints must not
 * blindly trust client-supplied identity or duration. Identity now always
 * comes from the verified JWT (`requireUser`); duration is clamped here to
 * per-session-type plausibility caps before it can touch billing counters.
 *
 * This module is intentionally pure TypeScript with ZERO imports and no
 * Deno globals so it can be characterized under vitest from
 * tests/server-pure/ (same pattern as learnerProgress.ts).
 *
 * Residual for the Phase 2 ledger design (documented, not implemented here):
 * true server-measured duration needs a server-issued session-open event
 * (e.g. the premium-voice mint's `session_start`) persisted at start and a
 * server-stamped close, so minutes are computed from server clocks instead
 * of accepting a client-reported (clamped) number.
 */

export const SESSION_TYPES = [
  "text_practice",
  "voice_practice",
  "premium_voice_practice",
  "pronunciation",
  "lesson",
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

/** Session types that consume the monthly voice-minute quota. */
export const VOICE_SESSION_TYPES: readonly SessionType[] = [
  "voice_practice",
  "premium_voice_practice",
];

/**
 * Per-session plausibility caps in minutes (previously a single flat 240).
 * Rationale: premium realtime is quota-limited to 15 min/month and auto-ends
 * at the limit, so >30 min in one session is not a legitimate report; school
 * voice/pronunciation sessions are bounded by class periods; text practice
 * gets the widest allowance.
 */
export const SESSION_MINUTE_CAPS: Record<SessionType, number> = {
  text_practice: 180,
  voice_practice: 60,
  premium_voice_practice: 30,
  pronunciation: 60,
  lesson: 120,
};

export const MAX_MESSAGES_PER_SESSION = 1000;
export const MAX_SESSION_ID_LENGTH = 120;

/** Coerce an untrusted session type to a known value (default: text_practice). */
export function normalizeSessionType(raw: unknown): SessionType {
  return (SESSION_TYPES as readonly string[]).includes(raw as string)
    ? (raw as SessionType)
    : "text_practice";
}

/**
 * Clamp an untrusted minutes value to [0, cap(sessionType)].
 * Non-numeric, NaN, Infinity and negatives all collapse to 0; fractional
 * values are floored so a client cannot inflate by fractions.
 */
export function clampSessionMinutes(sessionType: SessionType, rawMinutes: unknown): number {
  const n = Number(rawMinutes);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), SESSION_MINUTE_CAPS[sessionType]);
}

/** Clamp an untrusted message count to [0, MAX_MESSAGES_PER_SESSION]. */
export function clampMessageCount(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), MAX_MESSAGES_PER_SESSION);
}

/** Whether this session type bills against the monthly voice-minute quota. */
export function isVoiceSessionType(sessionType: SessionType): boolean {
  return VOICE_SESSION_TYPES.includes(sessionType);
}

/** Normalize an untrusted session id: non-empty trimmed string, bounded length; else null. */
export function normalizeSessionId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_SESSION_ID_LENGTH);
}

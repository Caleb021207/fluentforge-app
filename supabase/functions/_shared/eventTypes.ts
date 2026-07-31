/**
 * Learning-event taxonomy registry + envelope validation.
 *
 * WORKSTREAM 1.5 (plan wip-03a §2.2-§2.4, 17 P1). This file is the
 * grep-able schema registry wip-03a AC1.2 requires: the CLOSED list of
 * event types the telemetry stream may carry. Adding an event type is a
 * two-file PR: this module AND the CHECK constraint in
 * supabase/migrations/20260731010000_event_telemetry.sql (the contract
 * test tests/server-pure/eventTypes.test.ts fails if they drift).
 *
 * IMPORT-CLEAN: pure TypeScript, zero imports, no Deno globals — safe to
 * exercise under vitest despite living in supabase/functions/ (same rule
 * as _shared/learnerProgress.ts).
 *
 * PRIVACY (wip-03a §2.4, non-negotiable): no PII in any event. user_id is
 * the only identifier; metadata carries enumerated strings and numbers
 * ONLY — never names, emails, addresses, free text, file names, IPs, or
 * learner-generated language. validateEvent() enforces the shape rules
 * that can be enforced structurally; emitters are still responsible for
 * not smuggling PII inside innocuous-looking keys.
 */

/* ------------------------------------------------------------ taxonomy */

/** Learner-actor events (wip-03a §2.3, learner table). */
export const LEARNER_EVENT_TYPES = [
  "session.start",
  "session.end",
  "lesson.start",
  "lesson.complete",
  "lesson.abandon",
  "exercise.attempt",
  "exercise.hint",
  "review.card",
  "mission.start",
  "mission.step",
  "mission.complete",
  "conversation.turn",
  "conversation.end",
  "speech.pronunciation_scored",
  "assessment.placement_completed",
  "assessment.attempt",
  "evidence.transcript_uploaded",
  "evidence.analysis_completed",
  "evidence.analysis_failed",
  "assignment.viewed",
  "assignment.submitted",
  "nav.page",
] as const;

/** Teacher-actor events (wip-03a §2.3, teacher list). */
export const TEACHER_EVENT_TYPES = [
  "teacher.class_created",
  "teacher.assignment_created",
  "teacher.roster_changed",
  "teacher.report_viewed",
  "teacher.report_exported",
  "teacher.intervention_ack",
] as const;

/** System-actor events (wip-03a §2.3, system list). */
export const SYSTEM_EVENT_TYPES = [
  "system.provider_call",
  "system.quota_exhausted",
  "system.gate_run",
  "system.job_run",
  "system.rls_denied_report",
] as const;

/** The closed taxonomy. Mirrors the SQL CHECK constraint exactly. */
export const EVENT_TYPES = [
  ...LEARNER_EVENT_TYPES,
  ...TEACHER_EVENT_TYPES,
  ...SYSTEM_EVENT_TYPES,
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/** Interaction modalities (wip-03a §2.2 envelope). Mirrors the SQL CHECK. */
export const EVENT_MODALITIES = [
  "tap",
  "type",
  "speak",
  "listen",
  "read",
  "write",
] as const;

export type EventModality = (typeof EVENT_MODALITIES)[number];

export function isEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" &&
    (EVENT_TYPES as readonly string[]).includes(value)
  );
}

/* ------------------------------------------------------- envelope shape */

/**
 * The insert shape for public.learning_events
 * (20260731010000_event_telemetry.sql). Everything but event_type is
 * nullable at the DB level; validateEvent applies the stricter write-path
 * rules below.
 */
export interface LearningEventShape {
  event_type: string;
  user_id?: string | null;
  school_id?: string | null;
  lesson_id?: string | null;
  exercise_id?: string | null;
  mission_id?: string | null;
  modality?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, unknown> | null;
  occurred_at?: string | null;
}

export interface EventValidationResult {
  ok: boolean;
  /** Empty when ok. Machine-greppable "field: reason" strings otherwise. */
  errors: string[];
}

/* ------------------------------------------------------- privacy guards */

/**
 * Metadata keys that look like PII containers are rejected outright
 * (wip-03a §2.4 rule 1). Case-insensitive substring/word patterns:
 * email/name/address per the workstream brief, plus the obvious
 * neighbours (phone, ip, birth date, ssn, geo). "name" intentionally
 * catches filename/username/first_name — uploaded-file names and login
 * names are on the banned list too.
 */
const PII_KEY_PATTERNS: readonly RegExp[] = [
  /email/i,
  /e-mail/i,
  /name/i,
  /address/i,
  /\baddr\b/i,
  /phone/i,
  /\btel\b/i,
  /\bip\b/i,
  /ip_?addr/i,
  /birth/i,
  /\bdob\b/i,
  /\bssn\b/i,
  /social_?security/i,
  /passport/i,
  /\bgeo\b|latitude|longitude|\blat\b|\blng\b|\blon\b/i,
  /user_?agent/i,
];

const EMAIL_VALUE_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;

/** Enum-ish string ceiling: metadata strings are labels, not prose. */
const MAX_METADATA_STRING_LENGTH = 80;
const MAX_METADATA_KEYS = 20;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/* ------------------------------------------------------------ validator */

/**
 * Structural + privacy validation for one event before insert.
 *
 * Rules:
 *  - event_type must be in the closed taxonomy.
 *  - user_id / school_id / lesson_id / exercise_id / mission_id, when
 *    present, must be UUID strings.
 *  - modality, when present, must be one of EVENT_MODALITIES.
 *  - duration_ms, when present, must be a finite non-negative integer.
 *  - metadata, when present, must be a flat plain object of primitive
 *    values (string | number | boolean | null): no nesting, no arrays —
 *    the export-compatibility rule of wip-03a §2.1.
 *  - metadata keys matching PII patterns (email/name/address/…) are
 *    rejected; string values that look like email addresses or exceed
 *    the enum-label length ceiling are rejected.
 *
 * Returns all violations, not just the first, so emitter bugs surface in
 * one log line.
 */
export function validateEvent(shape: LearningEventShape): EventValidationResult {
  const errors: string[] = [];

  if (!isEventType(shape.event_type)) {
    errors.push(
      `event_type: "${String(shape.event_type)}" is not in the closed taxonomy`,
    );
  }

  const uuidFields = [
    "user_id",
    "school_id",
    "lesson_id",
    "exercise_id",
    "mission_id",
  ] as const;
  for (const field of uuidFields) {
    const value = shape[field];
    if (value !== undefined && value !== null) {
      if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
        errors.push(`${field}: must be a UUID string when present`);
      }
    }
  }

  if (shape.modality !== undefined && shape.modality !== null) {
    if (
      !(EVENT_MODALITIES as readonly string[]).includes(shape.modality)
    ) {
      errors.push(
        `modality: "${String(shape.modality)}" is not one of ${EVENT_MODALITIES.join("|")}`,
      );
    }
  }

  if (shape.duration_ms !== undefined && shape.duration_ms !== null) {
    const d = shape.duration_ms;
    if (
      typeof d !== "number" ||
      !Number.isFinite(d) ||
      !Number.isInteger(d) ||
      d < 0
    ) {
      errors.push("duration_ms: must be a finite non-negative integer");
    }
  }

  if (shape.metadata !== undefined && shape.metadata !== null) {
    if (!isPlainObject(shape.metadata)) {
      errors.push("metadata: must be a plain object");
    } else {
      const keys = Object.keys(shape.metadata);
      if (keys.length > MAX_METADATA_KEYS) {
        errors.push(
          `metadata: too many keys (${keys.length} > ${MAX_METADATA_KEYS})`,
        );
      }
      for (const key of keys) {
        const piiHit = PII_KEY_PATTERNS.find((p) => p.test(key));
        if (piiHit) {
          errors.push(
            `metadata.${key}: PII-looking key rejected (matched ${String(piiHit)})`,
          );
          continue;
        }
        const value = shape.metadata[key];
        if (value === null) continue;
        const t = typeof value;
        if (t !== "string" && t !== "number" && t !== "boolean") {
          errors.push(
            `metadata.${key}: values must be primitive (string|number|boolean|null), got ${t}`,
          );
          continue;
        }
        if (t === "string") {
          const s = value as string;
          if (EMAIL_VALUE_PATTERN.test(s)) {
            errors.push(`metadata.${key}: value looks like an email address`);
          } else if (s.length > MAX_METADATA_STRING_LENGTH) {
            errors.push(
              `metadata.${key}: string too long (${s.length} > ${MAX_METADATA_STRING_LENGTH}) — metadata carries enum labels, not prose`,
            );
          }
        }
        if (t === "number" && !Number.isFinite(value as number)) {
          errors.push(`metadata.${key}: number must be finite`);
        }
      }
    }
  }

  if (shape.occurred_at !== undefined && shape.occurred_at !== null) {
    if (
      typeof shape.occurred_at !== "string" ||
      Number.isNaN(Date.parse(shape.occurred_at))
    ) {
      errors.push("occurred_at: must be an ISO-8601 timestamp string when present");
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * The exact single-quoted list the migration's CHECK constraint must
 * carry, e.g. `'session.start','session.end',…`. The contract test
 * asserts the migration file contains every member.
 */
export function eventTypeSqlList(): string {
  return EVENT_TYPES.map((t) => `'${t}'`).join(",");
}

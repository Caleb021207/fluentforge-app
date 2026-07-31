import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EVENT_MODALITIES,
  EVENT_TYPES,
  LEARNER_EVENT_TYPES,
  SYSTEM_EVENT_TYPES,
  TEACHER_EVENT_TYPES,
  isEventType,
  validateEvent,
} from "../../supabase/functions/_shared/eventTypes";

/**
 * WORKSTREAM 1.5 — taxonomy registry + envelope validator (wip-03a §2.2-2.4).
 *
 * eventTypes.ts is import-clean (zero imports, no Deno globals) so it runs
 * under vitest despite living in supabase/functions/ — same rule as
 * learnerProgress.test.ts.
 *
 * Includes a FILE-CONTENT CONTRACT section: the migration's CHECK
 * constraint must carry the exact same closed list as the module (AC1.2 —
 * fails on drift in either direction).
 */

const VALID_UUID = "5f0c2a4e-9d31-4b7a-8f21-0aa1c3d4e5f6";

describe("taxonomy registry invariants", () => {
  it("has no duplicate event types", () => {
    expect(new Set(EVENT_TYPES).size).toBe(EVENT_TYPES.length);
  });

  it("is the union of the three actor groups", () => {
    expect(EVENT_TYPES.length).toBe(
      LEARNER_EVENT_TYPES.length +
        TEACHER_EVENT_TYPES.length +
        SYSTEM_EVENT_TYPES.length
    );
  });

  it("every type is dot-namespaced lowercase (export-compatible enum names)", () => {
    for (const t of EVENT_TYPES) {
      expect(t).toMatch(/^[a-z]+(\.[a-z_]+)+$/);
    }
  });

  it("carries the wip-03a core learner events", () => {
    for (const t of [
      "session.start",
      "lesson.complete",
      "exercise.attempt",
      "review.card",
      "conversation.turn",
      "conversation.end",
      "nav.page",
    ]) {
      expect(isEventType(t)).toBe(true);
    }
  });

  it("rejects non-members and non-strings", () => {
    expect(isEventType("lesson.deleted")).toBe(false);
    expect(isEventType("")).toBe(false);
    expect(isEventType(42)).toBe(false);
    expect(isEventType(null)).toBe(false);
  });
});

describe("validateEvent — accepts well-formed core events", () => {
  it("accepts a minimal event (type only)", () => {
    expect(validateEvent({ event_type: "session.start" })).toEqual({
      ok: true,
      errors: [],
    });
  });

  it("accepts a full exercise.attempt envelope", () => {
    const result = validateEvent({
      event_type: "exercise.attempt",
      user_id: VALID_UUID,
      school_id: VALID_UUID,
      lesson_id: VALID_UUID,
      exercise_id: VALID_UUID,
      modality: "type",
      duration_ms: 4200,
      metadata: {
        difficulty: 3,
        attempt_index: 1,
        is_correct: true,
        error_tag: "article_agreement",
      },
      occurred_at: "2026-07-31T12:00:00.000Z",
    });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("accepts a conversation.turn with counts-and-bands metadata", () => {
    const result = validateEvent({
      event_type: "conversation.turn",
      user_id: VALID_UUID,
      modality: "speak",
      duration_ms: 3100,
      metadata: { turn_index: 4, word_count: 12, provider_latency_ms: 640 },
    });
    expect(result.ok).toBe(true);
  });

  it("accepts null optional fields", () => {
    const result = validateEvent({
      event_type: "system.job_run",
      user_id: null,
      lesson_id: null,
      modality: null,
      duration_ms: null,
      metadata: null,
    });
    expect(result.ok).toBe(true);
  });
});

describe("validateEvent — rejects malformed envelopes", () => {
  it("rejects an unknown event type", () => {
    const result = validateEvent({ event_type: "made.up" });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain("closed taxonomy");
  });

  it("rejects non-UUID entity refs", () => {
    const result = validateEvent({
      event_type: "lesson.start",
      lesson_id: "lesson-42",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain("lesson_id");
  });

  it("rejects an unknown modality", () => {
    const result = validateEvent({
      event_type: "exercise.attempt",
      modality: "telepathy",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain("modality");
  });

  it("rejects negative, fractional, and non-numeric duration_ms", () => {
    for (const bad of [-1, 3.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        validateEvent({ event_type: "session.end", duration_ms: bad }).ok
      ).toBe(false);
    }
  });

  it("rejects nested / array metadata (flat export-compatible rule)", () => {
    expect(
      validateEvent({
        event_type: "nav.page",
        metadata: { detail: { deep: 1 } },
      }).ok
    ).toBe(false);
    expect(
      validateEvent({
        event_type: "nav.page",
        metadata: { tags: [1, 2] as unknown as number },
      }).ok
    ).toBe(false);
  });

  it("rejects unparseable occurred_at", () => {
    expect(
      validateEvent({ event_type: "session.start", occurred_at: "yesterday-ish" })
        .ok
    ).toBe(false);
  });

  it("collects ALL violations, not just the first", () => {
    const result = validateEvent({
      event_type: "nope",
      user_id: "not-a-uuid",
      duration_ms: -5,
    });
    expect(result.errors.length).toBe(3);
  });
});

describe("validateEvent — PII guards (wip-03a §2.4)", () => {
  it("rejects email-pattern keys", () => {
    const result = validateEvent({
      event_type: "session.start",
      metadata: { student_email: "x" },
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain("student_email");
  });

  it("rejects name-pattern keys (first_name, filename, username)", () => {
    for (const key of ["first_name", "filename", "username", "display_name"]) {
      const result = validateEvent({
        event_type: "session.start",
        metadata: { [key]: "x" },
      });
      expect(result.ok, `key ${key} should be rejected`).toBe(false);
    }
  });

  it("rejects address-pattern keys", () => {
    for (const key of ["home_address", "ip_address", "email_address"]) {
      expect(
        validateEvent({ event_type: "session.start", metadata: { [key]: "x" } })
          .ok,
        `key ${key} should be rejected`
      ).toBe(false);
    }
  });

  it("rejects other PII-adjacent keys (phone, dob, ssn, geo)", () => {
    for (const key of ["phone", "dob", "ssn", "latitude"]) {
      expect(
        validateEvent({ event_type: "session.start", metadata: { [key]: 1 } })
          .ok,
        `key ${key} should be rejected`
      ).toBe(false);
    }
  });

  it("rejects email-looking VALUES even under innocent keys", () => {
    const result = validateEvent({
      event_type: "session.start",
      metadata: { route: "kid@example.com" },
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain("looks like an email");
  });

  it("rejects prose-length string values (enum labels only)", () => {
    const result = validateEvent({
      event_type: "session.start",
      metadata: { note: "a".repeat(200) },
    });
    expect(result.ok).toBe(false);
  });

  it("accepts enum-ish metadata (platform, route pattern, bands)", () => {
    const result = validateEvent({
      event_type: "nav.page",
      metadata: { route: "/lessons/:id", platform: "desktop", score_band: 3 },
    });
    expect(result.errors).toEqual([]);
  });
});

describe("FILE-CONTENT CONTRACT — migration CHECK mirrors the module", () => {
  const migrationPath = fileURLToPath(
    new URL(
      "../../supabase/migrations/20260731010000_event_telemetry.sql",
      import.meta.url
    )
  );
  const sql = readFileSync(migrationPath, "utf8");

  it("is marked prepared-not-applied", () => {
    expect(sql).toContain("PREPARED, NOT APPLIED");
  });

  it("CHECK lists every taxonomy member (module → SQL)", () => {
    for (const t of EVENT_TYPES) {
      expect(sql, `migration missing '${t}'`).toContain(`'${t}'`);
    }
  });

  it("CHECK lists nothing beyond the taxonomy (SQL → module)", () => {
    const checkBlock = sql.match(
      /event_type\s+text NOT NULL CHECK \(event_type IN \(([\s\S]*?)\)\)/
    );
    expect(checkBlock).not.toBeNull();
    const sqlTypes = [...checkBlock![1].matchAll(/'([^']+)'/g)].map(
      (m) => m[1]
    );
    expect(new Set(sqlTypes).size).toBe(sqlTypes.length);
    expect([...sqlTypes].sort()).toEqual([...EVENT_TYPES].sort());
  });

  it("modality CHECK mirrors EVENT_MODALITIES", () => {
    expect(sql).toContain(
      `modality IN (${EVENT_MODALITIES.map((m) => `'${m}'`).join(",")})`
    );
  });

  it("grants clients SELECT only — no authenticated INSERT path", () => {
    expect(sql).toContain("GRANT SELECT ON public.learning_events TO authenticated");
    expect(sql).not.toMatch(/GRANT\s+(ALL|INSERT)[^;]*learning_events[^;]*TO authenticated/);
    expect(sql).not.toMatch(/FOR INSERT TO authenticated/);
  });

  it("carries the xp_events RLS pattern (own + teacher-of-student + admin)", () => {
    expect(sql).toContain("USING (user_id = auth.uid())");
    expect(sql).toContain(
      "public.is_teacher_of_student(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin')"
    );
  });

  it("has the required indexes and a security_invoker daily view", () => {
    expect(sql).toMatch(/CREATE INDEX \S+\s+ON public\.learning_events \(user_id, occurred_at DESC\)/);
    expect(sql).toMatch(/CREATE INDEX \S+\s+ON public\.learning_events \(event_type, occurred_at DESC\)/);
    expect(sql).toContain("CREATE VIEW public.learning_events_daily");
    expect(sql).toContain("security_invoker = true");
  });

  it("keeps the NO-PII comment on metadata", () => {
    expect(sql).toMatch(/COMMENT ON COLUMN public\.learning_events\.metadata IS\s+'NO PII/);
  });
});

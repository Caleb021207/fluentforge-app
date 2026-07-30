/**
 * Eval-set manifest types + hand-rolled validation (no dependencies).
 *
 * Mirrors ../manifest.schema.json — the JSON Schema is the published data
 * contract; this validator is what the harness actually enforces at run
 * time (workstream 0.6 rule: hand-rolled validation, no new deps). Keep the
 * two in sync: any rule added here must be added to the schema and vice
 * versa. The validator is additionally stricter in one documented way: it
 * rejects duplicate clip ids (not expressible cheaply in JSON Schema).
 *
 * Consent is a hard requirement (plan 11 §5.3): a manifest whose clips lack
 * a consent record with obtained === true fails validation, and child clips
 * additionally require guardianConsent === true (plan 11 §5.2 child rule:
 * consented 8–13-year-olds only under guardian consent — never faked).
 */

import type { AgeBand, EvalLanguage } from "./wer.ts";

export interface ConsentRecord {
  obtained: true;
  method: string;
  date: string; // YYYY-MM-DD
  guardianConsent?: boolean;
}

export interface EvalSpeaker {
  ageBand: AgeBand;
  l1: string; // BCP-47, e.g. "es", "es-MX", "gu", "ko", "en"
  gender?: string;
  consent: ConsentRecord;
}

export interface EvalReference {
  transcript: string;
  /** When present, this is the normalization input instead of `transcript`. */
  normalizedTranscript?: string;
}

export interface EvalCondition {
  device: string;
  environment: string;
  network?: string;
}

export interface EvalClip {
  id: string;
  path: string;
  language: EvalLanguage;
  speaker: EvalSpeaker;
  reference: EvalReference;
  condition: EvalCondition;
  tags?: string[];
}

export interface EvalManifest {
  schemaVersion: 1;
  name?: string;
  clips: EvalClip[];
}

export type ManifestValidation =
  | { ok: true; manifest: EvalManifest }
  | { ok: false; errors: string[] };

const AGE_BANDS: readonly string[] = ["child", "teen", "adult"];
const LANGUAGES: readonly string[] = ["en", "es"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function nonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/** Validate an arbitrary parsed JSON value against the manifest contract. */
export function validateManifest(input: unknown): ManifestValidation {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["manifest: must be a JSON object"] };
  }
  if (input.schemaVersion !== 1) {
    errors.push("manifest.schemaVersion: must be the number 1");
  }
  if (input.name !== undefined && typeof input.name !== "string") {
    errors.push("manifest.name: must be a string when present");
  }
  if (!Array.isArray(input.clips) || input.clips.length === 0) {
    errors.push("manifest.clips: must be a non-empty array");
    return { ok: false, errors };
  }

  const seenIds = new Set<string>();
  input.clips.forEach((clip: unknown, idx: number) => {
    const at = `clips[${idx}]`;
    if (!isRecord(clip)) {
      errors.push(`${at}: must be an object`);
      return;
    }
    if (!nonEmptyString(clip.id)) {
      errors.push(`${at}.id: required non-empty string`);
    } else if (seenIds.has(clip.id)) {
      errors.push(`${at}.id: duplicate id "${clip.id}"`);
    } else {
      seenIds.add(clip.id);
    }
    if (!nonEmptyString(clip.path)) {
      errors.push(`${at}.path: required non-empty string`);
    }
    if (typeof clip.language !== "string" || !LANGUAGES.includes(clip.language)) {
      errors.push(`${at}.language: must be "en" or "es"`);
    }

    // speaker + consent (the contract's hard core)
    if (!isRecord(clip.speaker)) {
      errors.push(`${at}.speaker: required object`);
    } else {
      const sp = clip.speaker;
      const isChild = sp.ageBand === "child";
      if (typeof sp.ageBand !== "string" || !AGE_BANDS.includes(sp.ageBand)) {
        errors.push(`${at}.speaker.ageBand: must be one of ${AGE_BANDS.join("|")}`);
      }
      if (!nonEmptyString(sp.l1)) {
        errors.push(`${at}.speaker.l1: required non-empty string (BCP-47)`);
      }
      if (sp.gender !== undefined && typeof sp.gender !== "string") {
        errors.push(`${at}.speaker.gender: must be a string when present`);
      }
      if (!isRecord(sp.consent)) {
        errors.push(
          `${at}.speaker.consent: required — clips without a consent record are not usable (plan 11 §5.3)`,
        );
      } else {
        const c = sp.consent;
        if (c.obtained !== true) {
          errors.push(`${at}.speaker.consent.obtained: must be literally true`);
        }
        if (!nonEmptyString(c.method)) {
          errors.push(`${at}.speaker.consent.method: required non-empty string`);
        }
        if (typeof c.date !== "string" || !DATE_RE.test(c.date)) {
          errors.push(`${at}.speaker.consent.date: required, format YYYY-MM-DD`);
        }
        if (c.guardianConsent !== undefined && typeof c.guardianConsent !== "boolean") {
          errors.push(`${at}.speaker.consent.guardianConsent: must be a boolean when present`);
        }
        if (isChild && c.guardianConsent !== true) {
          errors.push(
            `${at}.speaker.consent.guardianConsent: must be true for ageBand "child" (plan 11 §5.2/§5.3)`,
          );
        }
      }
    }

    if (!isRecord(clip.reference)) {
      errors.push(`${at}.reference: required object`);
    } else {
      if (!nonEmptyString(clip.reference.transcript)) {
        errors.push(`${at}.reference.transcript: required non-empty string`);
      }
      if (
        clip.reference.normalizedTranscript !== undefined &&
        typeof clip.reference.normalizedTranscript !== "string"
      ) {
        errors.push(`${at}.reference.normalizedTranscript: must be a string when present`);
      }
    }

    if (!isRecord(clip.condition)) {
      errors.push(`${at}.condition: required object`);
    } else {
      if (!nonEmptyString(clip.condition.device)) {
        errors.push(`${at}.condition.device: required non-empty string`);
      }
      if (!nonEmptyString(clip.condition.environment)) {
        errors.push(`${at}.condition.environment: required non-empty string`);
      }
      if (clip.condition.network !== undefined && typeof clip.condition.network !== "string") {
        errors.push(`${at}.condition.network: must be a string when present`);
      }
    }

    if (clip.tags !== undefined) {
      if (!Array.isArray(clip.tags) || clip.tags.some((t: unknown) => typeof t !== "string")) {
        errors.push(`${at}.tags: must be an array of strings when present`);
      }
    }
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, manifest: input as unknown as EvalManifest };
}

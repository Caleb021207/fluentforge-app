/**
 * Pure upload-validation + model-output-validation logic for the PROTECTED
 * assessment flow (analyze-transcript). Extracted per plan 12 §2 so the
 * behavior is characterizable under vitest (12 §1.0 T0; LEDGER E4 residual
 * risk: "extraction of its pure parsing into an import-clean module").
 *
 * IMPORT-CLEAN CONTRACT: this module must keep ZERO imports and ZERO Deno
 * globals so tests/server-pure/ may import it (vitest.config.ts note).
 *
 * Fixes carried here:
 * - F1.1 subset (12 §2.1): the accepted-type list includes application/pdf,
 *   matching the client dropzone (TranscriptUpload.tsx:57) — previously the
 *   server's images-only allow-list made every PDF fail with 400.
 * - F5 (12 §2.5): model output is schema-validated; a parse or validation
 *   failure returns `quarantine` and NEVER a stub analysis (the old code
 *   persisted `cefr_level: 'Unknown'` stubs as real analyses, poisoning
 *   useStudentProficiency, certificates, and district averages downstream).
 */

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_LEVELS: readonly CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Server-accepted upload types. Images mirror the pre-existing server list
 * (jpeg/jpg/png/webp/gif); PDF is the F1.1 addition. The client dropzone
 * offers jpeg/png/webp/pdf — a superset here is safe, a subset was the bug.
 */
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const PDF_MIME_TYPE = "application/pdf";

export type UploadValidation =
  | { ok: true; kind: "image" | "pdf"; mime: string }
  | { ok: false; kind: null; mime: string | null; error: string };

/**
 * Validate a client-supplied data URL by its OWN declared mime — the
 * separately client-declared `fileType` field is advisory only (12 §2.1
 * F1.1 direction). Size limits stay with the caller (one concern each).
 */
export function validateUploadDataUrl(dataUrl: unknown): UploadValidation {
  if (typeof dataUrl !== "string" || dataUrl.length === 0) {
    return { ok: false, kind: null, mime: null, error: "No file data received" };
  }
  if (!dataUrl.startsWith("data:")) {
    return { ok: false, kind: null, mime: null, error: "Expected a base64 data URL" };
  }
  const match = dataUrl.match(/^data:([^;,]*)((?:;[^;,]*)*),/);
  if (!match) {
    return { ok: false, kind: null, mime: null, error: "Malformed data URL" };
  }
  const mime = match[1].toLowerCase();
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
    return { ok: true, kind: "image", mime };
  }
  if (mime === PDF_MIME_TYPE) {
    return { ok: true, kind: "pdf", mime };
  }
  return {
    ok: false,
    kind: null,
    mime,
    error: `Unsupported file type "${mime || "unknown"}". Accepted: JPEG, PNG, WebP, or GIF image, or PDF.`,
  };
}

/**
 * The analysis shape persisted in `transcript_analyses.analysis_data` and
 * consumed by the UI (mirrors the flat fields of the `Analysis` type in
 * src/components/transcript-analysis/types.ts that StudentAnalysisView /
 * AnalysisResults / ProgressTimeline read — the row-level fields; the
 * optional deep-dive blocks there are model-optional extras).
 */
export interface ValidatedAnalysis {
  overall_score: number | null;
  cefr_level: CefrLevel | null;
  reading_listening_score: number | null;
  written_production_score: number | null;
  spoken_fluency_score: number | null;
  test_date: string | null;
  test_provider: string | null;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailed_feedback: string | null;
  progress_insights: string | null;
}

export type ParseModelAnalysisResult =
  | { ok: true; analysis: ValidatedAnalysis }
  | { ok: false; error: string; quarantine: true };

const MAX_ARRAY_ITEMS = 10;
const MAX_ITEM_LENGTH = 500;
const MAX_SHORT_STRING = 200;
const MAX_LONG_STRING = 5000;

/** Numbers clamp to [0,100] (P-invariant: 12 §1 C2.1); everything else → null. */
function clampScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, value));
  }
  return null;
}

function boundedString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length > 0 ? value.slice(0, max) : null;
}

/** Coerce to a bounded string[] (12 §2.5: arrays bounded, strings capped). */
function toBoundedStringArray(value: unknown, unwrapKey?: string): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_ARRAY_ITEMS).map((item) => {
    if (typeof item === "string") return item.slice(0, MAX_ITEM_LENGTH);
    // Preserves the pre-existing recommendation_text unwrap behavior.
    const unwrapped = unwrapKey && item && typeof item === "object"
      ? (item as Record<string, unknown>)[unwrapKey]
      : undefined;
    return String(unwrapped ?? item).slice(0, MAX_ITEM_LENGTH);
  });
}

function quarantine(error: string): ParseModelAnalysisResult {
  return { ok: false, error, quarantine: true };
}

/**
 * Parse + schema-validate raw model output. On ANY failure the result is a
 * quarantine — the caller must NOT persist an analysis row (F5: no more
 * 'Unknown' stub rows). Unknown keys are stripped; scores clamp to [0,100];
 * cefr_level must be A1–C2 (case-normalized) or null.
 */
export function parseModelAnalysis(raw: string): ParseModelAnalysisResult {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return quarantine("Model returned no content");
  }

  // Same extraction spirit as the previous inline code (first {...} block),
  // tolerating markdown code fences around the JSON.
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  } catch {
    return quarantine("Model output was not valid JSON");
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return quarantine("Model output was not a JSON object");
  }
  const obj = parsed as Record<string, unknown>;

  // cefr_level: A1–C2 (case-insensitive) or null. Anything else — including
  // the old stub's 'Unknown' — is a validation failure, never persisted.
  let cefrLevel: CefrLevel | null = null;
  const rawCefr = obj.cefr_level;
  if (rawCefr !== null && rawCefr !== undefined) {
    const normalized = typeof rawCefr === "string" ? rawCefr.trim().toUpperCase() : "";
    if (!(CEFR_LEVELS as readonly string[]).includes(normalized)) {
      return quarantine(`Invalid cefr_level ${JSON.stringify(rawCefr)} — expected one of A1, A2, B1, B2, C1, C2`);
    }
    cefrLevel = normalized as CefrLevel;
  }

  return {
    ok: true,
    analysis: {
      overall_score: clampScore(obj.overall_score),
      cefr_level: cefrLevel,
      reading_listening_score: clampScore(obj.reading_listening_score),
      written_production_score: clampScore(obj.written_production_score),
      spoken_fluency_score: clampScore(obj.spoken_fluency_score),
      test_date: boundedString(obj.test_date, MAX_SHORT_STRING),
      test_provider: boundedString(obj.test_provider, MAX_SHORT_STRING),
      strengths: toBoundedStringArray(obj.strengths),
      weaknesses: toBoundedStringArray(obj.weaknesses),
      recommendations: toBoundedStringArray(obj.recommendations, "recommendation_text"),
      detailed_feedback: boundedString(obj.detailed_feedback, MAX_LONG_STRING),
      progress_insights: boundedString(obj.progress_insights, MAX_LONG_STRING),
    },
  };
}

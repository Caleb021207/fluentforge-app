import { describe, expect, it } from "vitest";
import {
  CEFR_LEVELS,
  parseModelAnalysis,
  validateUploadDataUrl,
} from "../../supabase/functions/_shared/assessmentParsing";

/**
 * Workstream 0.8 — protected-assessment hotfix vectors (plan 12 §2 F1.1
 * upload-type acceptance, F5 quarantine-not-stub; invariants P1–P8).
 *
 * assessmentParsing.ts is deliberately import-clean (zero imports, zero
 * Deno globals) so it can run under vitest despite living in
 * supabase/functions/_shared — same pattern as learnerProgress.test.ts.
 */

const PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
const PDF_DATA_URL = "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO";

describe("validateUploadDataUrl — F1.1 accepted types", () => {
  it("accepts the image types the client offers", () => {
    for (const mime of ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]) {
      const result = validateUploadDataUrl(`data:${mime};base64,AAAA`);
      expect(result).toEqual({ ok: true, kind: "image", mime });
    }
  });

  it("accepts application/pdf (F1.1 regression — the client/server contract break)", () => {
    // Previously the server required data:image/ and 400'd every PDF the
    // client dropzone accepted (wip-12a §3.1). This vector pins the fix.
    const result = validateUploadDataUrl(PDF_DATA_URL);
    expect(result).toEqual({ ok: true, kind: "pdf", mime: "application/pdf" });
  });

  it("normalizes mime case", () => {
    const result = validateUploadDataUrl("data:IMAGE/PNG;base64,AAAA");
    expect(result).toEqual({ ok: true, kind: "image", mime: "image/png" });
  });

  it("rejects svg with a precise error naming the mime", () => {
    const result = validateUploadDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.mime).toBe("image/svg+xml");
      expect(result.error).toContain("image/svg+xml");
    }
  });

  it("rejects plain text data URLs", () => {
    const result = validateUploadDataUrl("data:text/plain,hello");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.mime).toBe("text/plain");
  });

  it("rejects non-data-URL strings, empty strings, and non-strings", () => {
    expect(validateUploadDataUrl("https://example.com/report.png").ok).toBe(false);
    expect(validateUploadDataUrl("").ok).toBe(false);
    expect(validateUploadDataUrl(undefined).ok).toBe(false);
    expect(validateUploadDataUrl(42).ok).toBe(false);
  });

  it("rejects a malformed data URL with no comma separator", () => {
    expect(validateUploadDataUrl("data:image/png;base64").ok).toBe(false);
  });
});

const VALID_MODEL_JSON = JSON.stringify({
  overall_score: 82,
  cefr_level: "B2",
  reading_listening_score: 78,
  written_production_score: 85,
  spoken_fluency_score: null,
  test_date: "2026-05-01",
  test_provider: "IELTS",
  strengths: ["Strong reading comprehension"],
  weaknesses: ["Hesitations in speech"],
  recommendations: ["Practice at /voice-chat"],
  detailed_feedback: "Solid upper-intermediate performance.",
  progress_insights: "Trending upward.",
});

describe("parseModelAnalysis — valid output", () => {
  it("passes valid model JSON through with all fields", () => {
    const result = parseModelAnalysis(VALID_MODEL_JSON);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.analysis).toEqual({
        overall_score: 82,
        cefr_level: "B2",
        reading_listening_score: 78,
        written_production_score: 85,
        spoken_fluency_score: null,
        test_date: "2026-05-01",
        test_provider: "IELTS",
        strengths: ["Strong reading comprehension"],
        weaknesses: ["Hesitations in speech"],
        recommendations: ["Practice at /voice-chat"],
        detailed_feedback: "Solid upper-intermediate performance.",
        progress_insights: "Trending upward.",
      });
    }
  });

  it("extracts JSON wrapped in prose or a markdown code fence", () => {
    const fenced = "```json\n" + VALID_MODEL_JSON + "\n```";
    const prosed = `Here is the analysis you requested: ${VALID_MODEL_JSON}`;
    expect(parseModelAnalysis(fenced).ok).toBe(true);
    expect(parseModelAnalysis(prosed).ok).toBe(true);
  });

  it("normalizes cefr_level case and accepts every CEFR level", () => {
    for (const level of CEFR_LEVELS) {
      const result = parseModelAnalysis(JSON.stringify({ cefr_level: level.toLowerCase() }));
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.analysis.cefr_level).toBe(level);
    }
  });

  it("allows null cefr_level (report without a stated level)", () => {
    const result = parseModelAnalysis(JSON.stringify({ overall_score: 70, cefr_level: null }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.analysis.cefr_level).toBeNull();
  });

  it("strips unknown keys from the persisted shape", () => {
    const result = parseModelAnalysis(JSON.stringify({ overall_score: 50, evil_extra: "x" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect("evil_extra" in result.analysis).toBe(false);
  });
});

describe("parseModelAnalysis — quarantine, never a stub (F5)", () => {
  it("malformed JSON quarantines and yields NO analysis object", () => {
    const result = parseModelAnalysis("Sorry, I could not read the image at all.");
    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining("JSON"),
      quarantine: true,
    });
    // The F5 regression: the old code fabricated cefr_level:'Unknown' here.
    expect((result as Record<string, unknown>).analysis).toBeUndefined();
  });

  it("empty / non-string model output quarantines", () => {
    expect(parseModelAnalysis("").ok).toBe(false);
    expect(parseModelAnalysis("   ").ok).toBe(false);
  });

  it("non-object JSON (array, number) quarantines", () => {
    expect(parseModelAnalysis("[1,2,3]").ok).toBe(false);
    expect(parseModelAnalysis("42").ok).toBe(false);
  });

  it("invalid cefr_level quarantines — including the old stub's 'Unknown'", () => {
    for (const bad of ["Unknown", "Advanced-ish", "B3", "native", 7]) {
      const result = parseModelAnalysis(JSON.stringify({ overall_score: 80, cefr_level: bad }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.quarantine).toBe(true);
        expect(result.error).toContain("cefr_level");
      }
    }
  });
});

describe("parseModelAnalysis — score clamping and bounds (P2/C2.1)", () => {
  it("clamps scores into [0,100]", () => {
    const result = parseModelAnalysis(JSON.stringify({
      overall_score: 150,
      cefr_level: "C1",
      reading_listening_score: -5,
      written_production_score: 99.5,
    }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.analysis.overall_score).toBe(100);
      expect(result.analysis.reading_listening_score).toBe(0);
      expect(result.analysis.written_production_score).toBe(99.5);
    }
  });

  it("non-numeric scores become null, not NaN or strings", () => {
    const result = parseModelAnalysis(JSON.stringify({
      overall_score: "85",
      spoken_fluency_score: "high",
      cefr_level: "A2",
    }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.analysis.overall_score).toBeNull();
      expect(result.analysis.spoken_fluency_score).toBeNull();
    }
  });

  it("bounds arrays to 10 items of 500 chars and unwraps recommendation_text", () => {
    const result = parseModelAnalysis(JSON.stringify({
      cefr_level: "B1",
      strengths: Array.from({ length: 15 }, (_, i) => `s${i}`),
      recommendations: [
        "x".repeat(600),
        { recommendation_text: "Use /lessons daily" },
      ],
      weaknesses: "not an array",
    }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.analysis.strengths).toHaveLength(10);
      expect(result.analysis.recommendations[0]).toHaveLength(500);
      expect(result.analysis.recommendations[1]).toBe("Use /lessons daily");
      expect(result.analysis.weaknesses).toEqual([]);
    }
  });
});

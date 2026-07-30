import { describe, expect, it } from "vitest";
import {
  alignSequences,
  characterErrorRate,
  equityRatio,
  isNativeSpeaker,
  normalizeText,
  poolClipScores,
  primaryLangSubtag,
  scoreClip,
  tokenize,
} from "../../tools/speech-benchmark/src/wer.ts";
import { validateManifest } from "../../tools/speech-benchmark/src/manifest.ts";
import type { EvalClip } from "../../tools/speech-benchmark/src/manifest.ts";
import {
  GATE_THRESHOLDS,
  evaluateGates,
} from "../../tools/speech-benchmark/src/gates.ts";
import type { ScoredClip } from "../../tools/speech-benchmark/src/gates.ts";
import type { AgeBand, ClipScore, EvalLanguage } from "../../tools/speech-benchmark/src/wer.ts";

/**
 * Golden vectors for the beginner-speech benchmark harness (workstream 0.6;
 * plan 11 §5.1 measurement 5, §6.4 gate 1). Pure TypeScript with zero
 * URL imports and zero Deno globals — safe under vitest per the
 * vitest.config.ts header note.
 *
 * These pin the *harness math and contract*, not any provider's quality:
 * no audio exists in this repo and none of these numbers is a benchmark
 * claim.
 */

describe("normalization policy (documented choices in wer.ts)", () => {
  it("lowercases and strips punctuation (EN)", () => {
    expect(normalizeText("Hello, World!", "en")).toBe("hello world");
  });

  it("strips Spanish inverted punctuation", () => {
    expect(normalizeText("¿Cómo estás?", "es")).toBe("cómo estás");
  });

  it("preserves diacritics (accent errors must be scoreable)", () => {
    expect(normalizeText("está aquí", "es")).toBe("está aquí");
  });

  it("NFC-normalizes so composed and decomposed accents compare equal", () => {
    const composed = "est\u00e1"; // precomposed a-acute
    const decomposed = "esta\u0301"; // a + combining acute
    expect(normalizeText(decomposed, "es")).toBe(normalizeText(composed, "es"));
    expect(scoreClip(composed, decomposed, "es").wer).toBe(0);
  });

  it("maps typographic apostrophes and keeps internal ones", () => {
    expect(normalizeText("Don’t stop", "en")).toBe("don't stop");
  });

  it("strips edge apostrophes per token", () => {
    expect(normalizeText("'quoted' word", "en")).toBe("quoted word");
  });

  it("treats hyphens as spaces", () => {
    expect(normalizeText("well-known", "en")).toBe("well known");
  });

  it("maps single digits to words per language, leaves multi-digit as-is", () => {
    expect(normalizeText("I have 2 cats", "en")).toBe("i have two cats");
    expect(normalizeText("tengo 2 gatos", "es")).toBe("tengo dos gatos");
    expect(normalizeText("I am 42", "en")).toBe("i am 42");
  });

  it("collapses whitespace", () => {
    expect(normalizeText("  a \n b\t c  ", "en")).toBe("a b c");
  });

  it("tokenize of empty string is []", () => {
    expect(tokenize("")).toEqual([]);
  });
});

describe("WER golden vectors", () => {
  it("identity → WER 0 (EN, through normalization)", () => {
    const s = scoreClip("The cat sat.", "the cat sat", "en");
    expect(s.wer).toBe(0);
    expect(s.cer).toBe(0);
    expect(s.hits).toBe(3);
    expect(s.errors).toBe(0);
  });

  it("identity → WER 0 (ES with accents)", () => {
    const s = scoreClip("¿Dónde está el baño?", "dónde está el baño", "es");
    expect(s.wer).toBe(0);
  });

  it("single substitution: 1/3", () => {
    const s = scoreClip("the cat sat", "the dog sat", "en");
    expect(s.substitutions).toBe(1);
    expect(s.deletions).toBe(0);
    expect(s.insertions).toBe(0);
    expect(s.wer).toBeCloseTo(1 / 3, 10);
  });

  it("single deletion: 1/3", () => {
    const s = scoreClip("the cat sat", "the sat", "en");
    expect(s.deletions).toBe(1);
    expect(s.wer).toBeCloseTo(1 / 3, 10);
  });

  it("single insertion: 1/3", () => {
    const s = scoreClip("the cat sat", "the big cat sat", "en");
    expect(s.insertions).toBe(1);
    expect(s.wer).toBeCloseTo(1 / 3, 10);
  });

  it("mixed substitution + deletion: 2/4", () => {
    const s = scoreClip("a b c d", "a x c", "en");
    expect(s.substitutions).toBe(1);
    expect(s.deletions).toBe(1);
    expect(s.insertions).toBe(0);
    expect(s.wer).toBeCloseTo(0.5, 10);
  });

  it("empty hypothesis: all deletions, WER 1", () => {
    const s = scoreClip("hola amigo", "", "es");
    expect(s.deletions).toBe(2);
    expect(s.wer).toBe(1);
  });

  it("WER can exceed 1.0 (hypothesis much longer than reference)", () => {
    const s = scoreClip("sí", "sí claro que sí señor", "es");
    expect(s.insertions).toBe(4);
    expect(s.wer).toBeCloseTo(4, 10);
  });

  it("missing accent scores as a substitution (policy: diacritics preserved)", () => {
    const s = scoreClip("está aquí", "esta aqui", "es");
    expect(s.substitutions).toBe(2);
    expect(s.wer).toBe(1);
  });

  it("empty reference + empty hypothesis → 0; empty reference + text → null", () => {
    expect(scoreClip("...", "", "en").wer).toBe(0); // "..." normalizes to empty
    expect(scoreClip("...", "hello", "en").wer).toBeNull();
  });

  it("alignSequences totals are consistent", () => {
    const c = alignSequences(["a", "b", "c"], ["a", "c", "d"]);
    expect(c.hits + c.substitutions + c.deletions).toBe(c.refLength);
    expect(c.hits + c.substitutions + c.insertions).toBe(c.hypLength);
  });
});

describe("CER", () => {
  it("one char substitution in three: 1/3", () => {
    expect(characterErrorRate("abc", "axc")).toBeCloseTo(1 / 3, 10);
  });

  it("identity → 0", () => {
    expect(characterErrorRate("hola", "hola")).toBe(0);
  });
});

describe("pooling and equity-ratio arithmetic", () => {
  const mkScore = (errors: number, refWords: number): ClipScore => ({
    refNorm: "",
    hypNorm: "",
    refWords,
    hypWords: refWords,
    hits: refWords - errors,
    substitutions: errors,
    deletions: 0,
    insertions: 0,
    errors,
    wer: refWords > 0 ? errors / refWords : errors === 0 ? 0 : null,
    cer: null,
  });

  it("pooled WER is corpus-level (Σ errors / Σ ref words), not mean of per-clip", () => {
    const pooled = poolClipScores([mkScore(1, 3), mkScore(0, 7)]);
    expect(pooled.wer).toBeCloseTo(0.1, 10); // mean of per-clip would be ≈0.1667
    expect(pooled.refWords).toBe(10);
    expect(pooled.errors).toBe(1);
    expect(pooled.clipCount).toBe(2);
  });

  it("pooled WER over zero ref words: 0 if no errors, null otherwise", () => {
    expect(poolClipScores([]).wer).toBe(0);
    const insertionOnly: ClipScore = { ...mkScore(0, 0), insertions: 2, errors: 2, hypWords: 2, wer: null };
    expect(poolClipScores([insertionOnly]).wer).toBeNull();
  });

  it("equity ratio: group 14% vs baseline 10% → exactly the 1.4 bound", () => {
    expect(equityRatio(0.14, 0.1)).toBeCloseTo(1.4, 10);
  });

  it("equity ratio guards: zero or unknown baseline → null", () => {
    expect(equityRatio(0.1, 0)).toBeNull();
    expect(equityRatio(0.1, null)).toBeNull();
    expect(equityRatio(null, 0.1)).toBeNull();
  });

  it("native-speaker detection uses the primary BCP-47 subtag", () => {
    expect(primaryLangSubtag("es-MX")).toBe("es");
    expect(isNativeSpeaker("es", "es-MX")).toBe(true);
    expect(isNativeSpeaker("en", "es")).toBe(false);
    expect(isNativeSpeaker("en", "EN-GB")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Manifest validation (the consent-bearing data contract, plan 11 §5.3)
// ---------------------------------------------------------------------------

function validClip(overrides: Partial<EvalClip> = {}): EvalClip {
  return {
    id: "clip-001",
    path: "audio/clip-001.wav",
    language: "en",
    speaker: {
      ageBand: "adult",
      l1: "es",
      consent: {
        obtained: true,
        method: "written consent form v1 (test fixture)",
        date: "2026-07-01",
      },
    },
    reference: { transcript: "i like coffee" },
    condition: { device: "chromebook-mic", environment: "classroom" },
    ...overrides,
  };
}

function validManifest(clips: EvalClip[] = [validClip()]) {
  return { schemaVersion: 1, name: "test fixture", clips };
}

describe("manifest validation (hand-rolled, mirrors manifest.schema.json)", () => {
  it("accepts a minimal valid manifest", () => {
    const v = validateManifest(validManifest());
    expect(v.ok).toBe(true);
  });

  it("rejects a clip with no consent record at all", () => {
    const m = validManifest();
    delete (m.clips[0].speaker as Record<string, unknown>).consent;
    const v = validateManifest(m);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errors.join(" ")).toMatch(/consent: required/);
    }
  });

  it("rejects consent.obtained !== true (false is not a warning)", () => {
    const m = validManifest();
    (m.clips[0].speaker.consent as Record<string, unknown>).obtained = false;
    const v = validateManifest(m);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.join(" ")).toMatch(/obtained: must be literally true/);
  });

  it("rejects missing consent.method and malformed consent.date", () => {
    const m = validManifest();
    (m.clips[0].speaker.consent as Record<string, unknown>).method = "";
    (m.clips[0].speaker.consent as Record<string, unknown>).date = "July 2026";
    const v = validateManifest(m);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errors.some((e) => e.includes("consent.method"))).toBe(true);
      expect(v.errors.some((e) => e.includes("consent.date"))).toBe(true);
    }
  });

  it("rejects child clips without guardianConsent === true", () => {
    const noGuardian = validClip();
    noGuardian.speaker = { ...noGuardian.speaker, ageBand: "child" };
    const v1 = validateManifest(validManifest([noGuardian]));
    expect(v1.ok).toBe(false);
    if (!v1.ok) expect(v1.errors.join(" ")).toMatch(/guardianConsent: must be true/);

    const guardianFalse = validClip();
    guardianFalse.speaker = {
      ...guardianFalse.speaker,
      ageBand: "child",
      consent: { ...guardianFalse.speaker.consent, guardianConsent: false },
    };
    const v2 = validateManifest(validManifest([guardianFalse]));
    expect(v2.ok).toBe(false);
  });

  it("accepts child clips with guardianConsent true", () => {
    const child = validClip();
    child.speaker = {
      ...child.speaker,
      ageBand: "child",
      consent: { ...child.speaker.consent, guardianConsent: true },
    };
    expect(validateManifest(validManifest([child])).ok).toBe(true);
  });

  it("rejects unknown language, empty transcript, duplicate ids, empty clips", () => {
    const badLang = validManifest([validClip({ language: "fr" as EvalLanguage })]);
    expect(validateManifest(badLang).ok).toBe(false);

    const emptyRef = validManifest([validClip({ reference: { transcript: "" } })]);
    expect(validateManifest(emptyRef).ok).toBe(false);

    const dupIds = validManifest([validClip(), validClip()]);
    expect(validateManifest(dupIds).ok).toBe(false);

    expect(validateManifest({ schemaVersion: 1, clips: [] }).ok).toBe(false);
    expect(validateManifest("nonsense").ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gate evaluation (plan 11 §6.4) — arithmetic + honesty rules
// ---------------------------------------------------------------------------

function scoredCell(opts: {
  language: EvalLanguage;
  ageBand: AgeBand;
  l1: string;
  clips: number;
  errorsPerClip: number;
  refWordsPerClip: number;
}): ScoredClip[] {
  const out: ScoredClip[] = [];
  for (let i = 0; i < opts.clips; i++) {
    const clip = validClip({
      id: `${opts.language}-${opts.ageBand}-${opts.l1}-${i}`,
      language: opts.language,
    });
    clip.speaker = { ...clip.speaker, ageBand: opts.ageBand, l1: opts.l1 };
    out.push({
      clip,
      score: {
        refNorm: "",
        hypNorm: "",
        refWords: opts.refWordsPerClip,
        hypWords: opts.refWordsPerClip,
        hits: opts.refWordsPerClip - opts.errorsPerClip,
        substitutions: opts.errorsPerClip,
        deletions: 0,
        insertions: 0,
        errors: opts.errorsPerClip,
        wer: opts.errorsPerClip / opts.refWordsPerClip,
        cer: null,
      },
    });
  }
  return out;
}

describe("gate evaluation (plan 11 §6.4)", () => {
  it("pins the gate thresholds from plan 11 §6.4 / §7", () => {
    expect(GATE_THRESHOLDS.EN_WER_MAX).toBe(0.12);
    expect(GATE_THRESHOLDS.ES_WER_MAX).toBe(0.14);
    expect(GATE_THRESHOLDS.EQUITY_MAX).toBe(1.4);
    expect(GATE_THRESHOLDS.PA_MIN_R).toBe(0.7);
    expect(GATE_THRESHOLDS.DEFAULT_MIN_CLIPS).toBe(30);
  });

  it("wer-en passes at 10% and fails at 15% with sufficient clips", () => {
    const pass = evaluateGates(
      scoredCell({ language: "en", ageBand: "adult", l1: "es", clips: 2, errorsPerClip: 1, refWordsPerClip: 10 }),
      { minClips: 2 },
    );
    expect(pass.find((g) => g.id === "wer-en")?.status).toBe("pass");

    const fail = evaluateGates(
      scoredCell({ language: "en", ageBand: "adult", l1: "es", clips: 2, errorsPerClip: 3, refWordsPerClip: 20 }),
      { minClips: 2 },
    );
    expect(fail.find((g) => g.id === "wer-en")?.status).toBe("fail");
  });

  it("wer-es uses the 14% threshold (13% passes, would fail the EN gate)", () => {
    const gates = evaluateGates(
      scoredCell({ language: "es", ageBand: "adult", l1: "en", clips: 2, errorsPerClip: 13, refWordsPerClip: 100 }),
      { minClips: 2 },
    );
    expect(gates.find((g) => g.id === "wer-es")?.status).toBe("pass");
  });

  it("undersized cells report insufficient-data, never pass/fail", () => {
    const gates = evaluateGates(
      scoredCell({ language: "en", ageBand: "adult", l1: "es", clips: 5, errorsPerClip: 0, refWordsPerClip: 10 }),
      { minClips: 30 },
    );
    expect(gates.find((g) => g.id === "wer-en")?.status).toBe("insufficient-data");
  });

  it("equity gate: 1.5× fails, 1.3× passes, missing baseline → insufficient-data", () => {
    const baseline = scoredCell({ language: "en", ageBand: "adult", l1: "en", clips: 2, errorsPerClip: 1, refWordsPerClip: 10 }); // 10%
    const badGroup = scoredCell({ language: "en", ageBand: "adult", l1: "ko", clips: 2, errorsPerClip: 3, refWordsPerClip: 20 }); // 15% → 1.5×
    const okGroup = scoredCell({ language: "en", ageBand: "adult", l1: "gu", clips: 2, errorsPerClip: 13, refWordsPerClip: 100 }); // 13% → 1.3×

    const fail = evaluateGates([...baseline, ...badGroup], { minClips: 2 });
    expect(fail.find((g) => g.id === "equity-en")?.status).toBe("fail");

    const pass = evaluateGates([...baseline, ...okGroup], { minClips: 2 });
    expect(pass.find((g) => g.id === "equity-en")?.status).toBe("pass");

    const noBaseline = evaluateGates([...badGroup], { minClips: 2 });
    expect(noBaseline.find((g) => g.id === "equity-en")?.status).toBe("insufficient-data");
  });

  it("pa-validity is always insufficient-data in this harness (measurement 6 pending)", () => {
    const gates = evaluateGates([], { minClips: 1 });
    expect(gates.find((g) => g.id === "pa-validity")?.status).toBe("insufficient-data");
  });

  it("self-test runs force every gate to insufficient-data (NOT A BENCHMARK)", () => {
    const perfect = [
      ...scoredCell({ language: "en", ageBand: "adult", l1: "es", clips: 2, errorsPerClip: 0, refWordsPerClip: 10 }),
      ...scoredCell({ language: "en", ageBand: "adult", l1: "en", clips: 2, errorsPerClip: 0, refWordsPerClip: 10 }),
    ];
    const gates = evaluateGates(perfect, { minClips: 2, selfTest: true });
    for (const g of gates) {
      expect(g.status).toBe("insufficient-data");
      expect(g.detail).toMatch(/NOT A BENCHMARK/);
    }
  });
});

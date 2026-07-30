import { describe, expect, it } from "vitest";
import {
  CRISIS_ESCALATION_LINE,
  buildSafetyPolicyBlock,
  crisisResourceMessage,
  resolveSafetyContext,
  shouldEscalate,
} from "../../supabase/functions/_shared/safetyContext";

/**
 * SafetyContext foundation — Workstream 0.5 (plan 15 §3; 19 #7
 * default-approved: fail-closed strict incl. unverified-age accounts).
 *
 * The module is IMPORT-CLEAN (zero imports, zero Deno globals) [observed],
 * so it runs under vitest despite living in supabase/functions/_shared —
 * same rule as learnerProgress.test.ts.
 */

const VERIFIED = "2026-07-30T00:00:00Z";

describe("resolveSafetyContext decision table (plan 15 §3.1 fail-closed)", () => {
  it("null profile → strict, treated as minor", () => {
    expect(resolveSafetyContext(null)).toEqual({
      mode: "strict",
      isMinor: true,
      reason: "no_profile",
    });
  });

  it("minor → strict regardless of safety_mode value", () => {
    for (const safety_mode of ["standard", "relaxed", "strict", null]) {
      const ctx = resolveSafetyContext({
        is_minor: true,
        safety_mode,
        age_verified_at: VERIFIED,
      });
      expect(ctx).toEqual({ mode: "strict", isMinor: true, reason: "minor" });
    }
  });

  it("unverified age → strict even when profile claims adult + standard (19 #7)", () => {
    for (const age_verified_at of [null, undefined, ""]) {
      const ctx = resolveSafetyContext({
        is_minor: false,
        safety_mode: "standard",
        age_verified_at,
      });
      expect(ctx).toEqual({ mode: "strict", isMinor: true, reason: "age_unverified" });
    }
  });

  it("verified but minor-status unknown → strict, treated as minor", () => {
    expect(
      resolveSafetyContext({ is_minor: null, safety_mode: "standard", age_verified_at: VERIFIED }),
    ).toEqual({ mode: "strict", isMinor: true, reason: "minor_status_unknown" });
    expect(
      resolveSafetyContext({ safety_mode: "standard", age_verified_at: VERIFIED }),
    ).toEqual({ mode: "strict", isMinor: true, reason: "minor_status_unknown" });
  });

  it("verified adult with explicit standard (or legacy relaxed) → standard", () => {
    for (const safety_mode of ["standard", "relaxed"]) {
      expect(
        resolveSafetyContext({ is_minor: false, safety_mode, age_verified_at: VERIFIED }),
      ).toEqual({ mode: "standard", isMinor: false, reason: "verified_adult_standard" });
    }
  });

  it("verified adult who chose strict stays strict (not a minor)", () => {
    expect(
      resolveSafetyContext({ is_minor: false, safety_mode: "strict", age_verified_at: VERIFIED }),
    ).toEqual({ mode: "strict", isMinor: false, reason: "adult_strict_preference" });
  });

  it("verified adult with null/unknown safety_mode → strict (fail-closed)", () => {
    for (const safety_mode of [null, undefined, "", "lenient", "off"]) {
      const ctx = resolveSafetyContext({ is_minor: false, safety_mode, age_verified_at: VERIFIED });
      expect(ctx.mode).toBe("strict");
      expect(ctx.isMinor).toBe(false);
      expect(ctx.reason).toBe("safety_mode_unresolved");
    }
  });
});

describe("buildSafetyPolicyBlock (plan 15 §3.2)", () => {
  const strict = buildSafetyPolicyBlock(resolveSafetyContext(null));
  const standard = buildSafetyPolicyBlock(
    resolveSafetyContext({ is_minor: false, safety_mode: "standard", age_verified_at: VERIFIED }),
  );

  it("strict block contains the exact crisis escalation line", () => {
    expect(strict).toContain(CRISIS_ESCALATION_LINE);
    expect(strict).toContain("988");
    expect(strict).toContain("741741");
  });

  it("strict block carries the minor-specific constraints", () => {
    expect(strict).toContain("treated as a minor");
    expect(strict).toContain("PERSONAL DATA:");
    expect(strict).toContain("EXTERNAL CONTACT:");
    expect(strict).toContain("romantic");
    // report-don't-repeat + role containment apply in both modes
    expect(strict).toContain("ABUSIVE INPUT:");
    expect(strict).toContain("ROLE:");
  });

  it("standard block is the lighter variant: no minor-specific constraints", () => {
    expect(standard).not.toContain("treated as a minor");
    expect(standard).not.toContain("PERSONAL DATA:");
    expect(standard).not.toContain("EXTERNAL CONTACT:");
    expect(standard).not.toContain("romantic");
    // but crisis handling and role containment still present
    expect(standard).toContain(CRISIS_ESCALATION_LINE);
    expect(standard).toContain("ROLE:");
    expect(standard).toContain("ABUSIVE INPUT:");
  });
});

describe("crisisResourceMessage (plan 15 §3.4a — surfaced, never silent)", () => {
  it("every category ends with the escalation line", () => {
    for (const category of ["self_harm", "abuse", "violence"] as const) {
      expect(crisisResourceMessage(category)).toContain(CRISIS_ESCALATION_LINE);
    }
    expect(crisisResourceMessage()).toContain(CRISIS_ESCALATION_LINE);
  });

  it("abuse variant reassures it is not the learner's fault", () => {
    expect(crisisResourceMessage("abuse")).toContain("not your fault");
  });
});

describe("shouldEscalate — positive vectors", () => {
  const cases: Array<[string, "self_harm" | "abuse" | "violence"]> = [
    ["I want to kill myself", "self_harm"],
    ["sometimes i think about killing myself", "self_harm"],
    ["i wanna die", "self_harm"],
    ["I have no reason to live anymore", "self_harm"],
    ["I am thinking about hurting myself", "self_harm"],
    ["I can't stop cutting myself", "self_harm"],
    ["Me quiero morir", "self_harm"],           // Spanish
    ["Quiero suicidarme", "self_harm"],         // Spanish
    ["quero morrer", "self_harm"],              // Portuguese
    ["je veux mourir", "self_harm"],            // French
    ["My stepdad hits me when he is angry", "abuse"],
    ["she slapped me and I am scared to go home", "abuse"],
    ["I am not safe at home", "abuse"],
    ["Mi papá me pega", "abuse"],               // Spanish (accent normalized)
    ["mi tío me maltrata", "abuse"],            // Spanish
    ["ele me bate", "abuse"],                   // Portuguese
    ["I will kill them tomorrow", "violence"],
    ["I'm going to bring a gun to school", "violence"],
    ["he wants to shoot up the school", "violence"],
    ["voy a matar a todos", "violence"],        // Spanish
  ];

  for (const [text, category] of cases) {
    it(`escalates ${JSON.stringify(text)} as ${category}`, () => {
      expect(shouldEscalate(text)).toEqual({ escalate: true, category });
    });
  }

  it("prioritizes self_harm when multiple categories match", () => {
    expect(shouldEscalate("my dad hits me and i want to kill myself").category).toBe("self_harm");
  });
});

describe("shouldEscalate — benign ESL sentences must NOT escalate", () => {
  const benign = [
    "I want to learn to kill time",          // idiom — the vector from the spec
    "My homework is killing me",
    "I'm dying to visit Spain",
    "My feet are killing me after the walk",
    "I fell and hurt myself yesterday",      // past accident, no intent framing
    "My phone is going to die",
    "My sister beats me at chess every time",
    "Beats me! I don't know the answer",
    "My stomach hurts me a lot today",       // common ESL construction
    "The story touched me deeply",
    "Matar el tiempo es divertido",          // Spanish "kill time"
    "Me toca a mí practicar",                // Spanish "it's my turn"
    "In the game I attack the monster and win",
    "We say goodbye and go home",
    "How do I say 'I am tired' in English?",
  ];

  for (const text of benign) {
    it(`does not escalate ${JSON.stringify(text)}`, () => {
      expect(shouldEscalate(text)).toEqual({ escalate: false });
    });
  }

  it("handles empty and non-string input safely", () => {
    expect(shouldEscalate("")).toEqual({ escalate: false });
    expect(shouldEscalate("   ")).toEqual({ escalate: false });
    // deliberately abusing the type to mirror untrusted runtime input
    expect(shouldEscalate(undefined as unknown as string)).toEqual({ escalate: false });
  });
});

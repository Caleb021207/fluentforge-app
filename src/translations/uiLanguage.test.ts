import { describe, expect, it } from "vitest";
import {
  matchBrowserLanguage,
  normalizeUiLanguage,
  resolveInitialLanguage,
} from "./uiLanguage";
import { SUPPORTED_LANGUAGES } from "./loader";

const supported = SUPPORTED_LANGUAGES;

describe("normalizeUiLanguage", () => {
  it("accepts pack codes as-is", () => {
    expect(normalizeUiLanguage("farsi", supported)).toBe("farsi");
    expect(normalizeUiLanguage("english", supported)).toBe("english");
  });

  it("trims and lowercases", () => {
    expect(normalizeUiLanguage("  Spanish ", supported)).toBe("spanish");
  });

  it("maps BCP-47 tags to pack codes", () => {
    expect(normalizeUiLanguage("es-MX", supported)).toBe("spanish");
    expect(normalizeUiLanguage("fa", supported)).toBe("farsi");
  });

  it("rejects unknown values", () => {
    expect(normalizeUiLanguage("klingon", supported)).toBeNull();
    expect(normalizeUiLanguage("", supported)).toBeNull();
    expect(normalizeUiLanguage(null, supported)).toBeNull();
    expect(normalizeUiLanguage(undefined, supported)).toBeNull();
  });
});

describe("matchBrowserLanguage", () => {
  it("returns the first supported match", () => {
    expect(matchBrowserLanguage(["xx", "vi-VN", "en-US"], supported)).toBe(
      "vietnamese",
    );
  });

  it("maps zh regional variants", () => {
    expect(matchBrowserLanguage(["zh-CN"], supported)).toBe("mandarin");
    expect(matchBrowserLanguage(["zh-HK"], supported)).toBe("cantonese");
    expect(matchBrowserLanguage(["zh-Hant-HK"], supported)).toBe("cantonese");
    expect(matchBrowserLanguage(["yue"], supported)).toBe("cantonese");
  });

  it("maps the five newly selectable languages", () => {
    expect(matchBrowserLanguage(["my"], supported)).toBe("burmese");
    expect(matchBrowserLanguage(["ksw"], supported)).toBe("karen");
    expect(matchBrowserLanguage(["ti-ER"], supported)).toBe("tigrinya");
    expect(matchBrowserLanguage(["mr-IN"], supported)).toBe("marathi");
    expect(matchBrowserLanguage(["si-LK"], supported)).toBe("sinhala");
  });

  it("returns null when nothing matches", () => {
    expect(matchBrowserLanguage(["xx", "zz-ZZ"], supported)).toBeNull();
    expect(matchBrowserLanguage(undefined, supported)).toBeNull();
    expect(matchBrowserLanguage([], supported)).toBeNull();
  });
});

describe("resolveInitialLanguage", () => {
  it("prefers an explicit device choice over the profile", () => {
    expect(
      resolveInitialLanguage({
        profileLanguage: "arabic",
        storedLanguage: "farsi",
        storedSource: "user",
        supported,
      }),
    ).toEqual({ language: "farsi", source: "user" });
  });

  it("adopts the server profile when the device has no explicit choice", () => {
    expect(
      resolveInitialLanguage({
        profileLanguage: "arabic",
        storedLanguage: "farsi",
        storedSource: "profile",
        supported,
      }),
    ).toEqual({ language: "arabic", source: "profile" });
  });

  it("adopts the profile when nothing is stored (bulk-created students)", () => {
    expect(
      resolveInitialLanguage({
        profileLanguage: "karen",
        storedLanguage: null,
        storedSource: null,
        supported,
      }),
    ).toEqual({ language: "karen", source: "profile" });
  });

  it("keeps the stored preference when signed out", () => {
    expect(
      resolveInitialLanguage({
        profileLanguage: null,
        storedLanguage: "urdu",
        storedSource: "profile",
        supported,
      }),
    ).toEqual({ language: "urdu", source: "stored" });
  });

  it("ignores an invalid stored value even when marked explicit", () => {
    expect(
      resolveInitialLanguage({
        profileLanguage: "hindi",
        storedLanguage: "not-a-language",
        storedSource: "user",
        supported,
      }),
    ).toEqual({ language: "hindi", source: "profile" });
  });

  it("falls back to browser languages, then default", () => {
    expect(
      resolveInitialLanguage({
        browserLanguages: ["pt-BR", "en-US"],
        supported,
      }),
    ).toEqual({ language: "portuguese", source: "browser" });

    expect(
      resolveInitialLanguage({
        browserLanguages: ["xx"],
        supported,
      }),
    ).toEqual({ language: "english", source: "default" });

    expect(resolveInitialLanguage({ supported })).toEqual({
      language: "english",
      source: "default",
    });
  });

  it("normalizes a BCP-47 profile value (defensive against loose writes)", () => {
    expect(
      resolveInitialLanguage({
        profileLanguage: "es",
        supported,
      }),
    ).toEqual({ language: "spanish", source: "profile" });
  });
});

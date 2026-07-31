/**
 * Pure UI-language lifecycle logic.
 *
 * This module decides which UI language (learner L1) the app should use, from
 * three inputs, in priority order:
 *
 *   1. an explicit choice the learner made on this device ("user" source),
 *   2. the server-side profile (`profiles.native_language`) — the
 *      authoritative record for signed-in learners,
 *   3. any previously stored (non-explicit) preference on this device,
 *   4. the browser's preferred languages,
 *   5. the app default (English).
 *
 * It is deliberately free of browser/React/Supabase imports so it can be unit
 * tested (see uiLanguage.test.ts). Storage and network side effects live in
 * LocalizationContext.
 */

import { DEFAULT_LANGUAGE } from "./constants";

/** localStorage key holding the learner's UI language (pack code). Kept as
 * the historical key name for backward compatibility with existing devices
 * and with `useChallengeChat`, which reads it directly. */
export const UI_LANGUAGE_STORAGE_KEY = "nativeLanguage";

/** Legacy expiry sidecar written by secureStorage.setItem. The language
 * preference must persist indefinitely, so this key is actively removed. */
export const UI_LANGUAGE_EXPIRY_STORAGE_KEY = "nativeLanguage_expires";

/** localStorage key recording how the stored language was chosen:
 * "user" = the learner explicitly picked it on this device;
 * "profile" = adopted from profiles.native_language. */
export const UI_LANGUAGE_SOURCE_STORAGE_KEY = "nativeLanguageSource";

export type UiLanguageSource =
  | "user"
  | "profile"
  | "stored"
  | "browser"
  | "default";

export interface ResolveUiLanguageInput {
  /** profiles.native_language for the signed-in user (null when signed out
   * or not yet loaded). */
  profileLanguage?: string | null;
  /** Language previously persisted on this device. */
  storedLanguage?: string | null;
  /** Persisted source marker for storedLanguage ("user" | "profile" | ...). */
  storedSource?: string | null;
  /** navigator.languages (BCP-47 tags), most preferred first. */
  browserLanguages?: readonly string[];
  /** Pack codes the app can load (loader.ts SUPPORTED_LANGUAGES). */
  supported: readonly string[];
}

export interface ResolvedUiLanguage {
  language: string;
  source: UiLanguageSource;
}

/** BCP-47 primary subtag → pack code. Regional/script subtags are handled in
 * matchBrowserLanguage (e.g. zh-HK → cantonese). */
const BCP47_TO_PACK: Record<string, string> = {
  en: "english",
  es: "spanish",
  pt: "portuguese",
  fr: "french",
  de: "german",
  it: "italian",
  ru: "russian",
  uk: "ukrainian",
  pl: "polish",
  ro: "romanian",
  tr: "turkish",
  zh: "mandarin",
  yue: "cantonese",
  ja: "japanese",
  ko: "korean",
  th: "thai",
  vi: "vietnamese",
  id: "indonesian",
  hi: "hindi",
  mr: "marathi",
  gu: "gujarati",
  pa: "punjabi",
  bn: "bengali",
  ne: "nepali",
  si: "sinhala",
  ar: "arabic",
  fa: "farsi",
  prs: "farsi", // Dari
  ur: "urdu",
  ps: "pashto",
  am: "amharic",
  ti: "tigrinya",
  so: "somali",
  sw: "swahili",
  yo: "yoruba",
  ig: "igbo",
  my: "burmese",
  ksw: "karen", // S'gaw Karen
  kar: "karen", // Karen language family collective code
  tl: "tagalog",
  fil: "tagalog",
  ml: "malayalam",
  ht: "haitian",
};

/**
 * Normalize a stored/profile value to a supported pack code, or null.
 * Accepts pack codes ("farsi") and BCP-47-ish tags ("fa", "fa-IR").
 */
export function normalizeUiLanguage(
  value: string | null | undefined,
  supported: readonly string[],
): string | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return null;
  if (supported.includes(cleaned)) return cleaned;
  const mapped = mapBcp47Tag(cleaned);
  if (mapped && supported.includes(mapped)) return mapped;
  return null;
}

/** Map one BCP-47 tag to a pack code (no support check). */
function mapBcp47Tag(tag: string): string | null {
  const lower = tag.trim().toLowerCase();
  if (!lower) return null;
  const subtags = lower.split("-");
  const primary = subtags[0];
  // Chinese: Hong Kong / Macau / Traditional-in-HK conventionally Cantonese.
  if (primary === "zh" && (subtags.includes("hk") || subtags.includes("mo"))) {
    return "cantonese";
  }
  return BCP47_TO_PACK[primary] ?? null;
}

/** First browser-preferred language with a loadable pack, or null. */
export function matchBrowserLanguage(
  browserLanguages: readonly string[] | undefined,
  supported: readonly string[],
): string | null {
  if (!browserLanguages) return null;
  for (const tag of browserLanguages) {
    const mapped = mapBcp47Tag(tag);
    if (mapped && supported.includes(mapped)) return mapped;
  }
  return null;
}

/**
 * Decide the UI language. Priority:
 * explicit device choice > server profile > stored preference > browser > default.
 *
 * The server profile is authoritative for signed-in users *unless* the
 * learner explicitly overrode the language on this device (storedSource
 * === "user"), in which case the device choice wins — and callers are
 * expected to have synced that choice back to the profile when it was made.
 */
export function resolveInitialLanguage(
  input: ResolveUiLanguageInput,
): ResolvedUiLanguage {
  const { supported } = input;
  const stored = normalizeUiLanguage(input.storedLanguage, supported);
  const profile = normalizeUiLanguage(input.profileLanguage, supported);

  if (stored && input.storedSource === "user") {
    return { language: stored, source: "user" };
  }
  if (profile) {
    return { language: profile, source: "profile" };
  }
  if (stored) {
    return { language: stored, source: "stored" };
  }
  const browser = matchBrowserLanguage(input.browserLanguages, supported);
  if (browser) {
    return { language: browser, source: "browser" };
  }
  return { language: DEFAULT_LANGUAGE, source: "default" };
}

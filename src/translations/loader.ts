import { TranslationRecord } from "./types";
import { DEFAULT_LANGUAGE } from "./constants";

// English is the default/fallback language and is always needed, so it is the
// only translation bundle imported eagerly. Every other language is loaded on
// demand via dynamic import(), which lets Vite split each one into its own
// chunk instead of shipping ~3.3 MB of translations in the initial bundle.
import english from "./english";

export const eagerTranslations: Record<string, TranslationRecord> = {
  english,
};

// Dynamic importers for every non-default language. Each `() => import(...)`
// becomes a separately code-split chunk fetched only when that language is
// selected.
const languageLoaders: Record<string, () => Promise<{ default: TranslationRecord }>> = {
  spanish: () => import("./spanish"),
  portuguese: () => import("./portuguese"),
  french: () => import("./french"),
  japanese: () => import("./japanese"),
  korean: () => import("./korean"),
  mandarin: () => import("./mandarin"),
  cantonese: () => import("./cantonese"),
  russian: () => import("./russian"),
  arabic: () => import("./arabic"),
  hindi: () => import("./hindi"),
  vietnamese: () => import("./vietnamese"),
  ukrainian: () => import("./ukrainian"),
  indonesian: () => import("./indonesian"),
  farsi: () => import("./farsi"),
  urdu: () => import("./urdu"),
  pashto: () => import("./pashto"),
  swahili: () => import("./swahili"),
  bengali: () => import("./bengali"),
  somali: () => import("./somali"),
  yoruba: () => import("./yoruba"),
  amharic: () => import("./amharic"),
  malayalam: () => import("./malayalam"),
  polish: () => import("./polish"),
  turkish: () => import("./turkish"),
  romanian: () => import("./romanian"),
  igbo: () => import("./igbo"),
  haitian: () => import("./haitian"),
  tagalog: () => import("./tagalog"),
  german: () => import("./german"),
  italian: () => import("./italian"),
  thai: () => import("./thai"),
  burmese: () => import("./burmese"),
  karen: () => import("./karen"),
  nepali: () => import("./nepali"),
  tigrinya: () => import("./tigrinya"),
  punjabi: () => import("./punjabi"),
  marathi: () => import("./marathi"),
  gujarati: () => import("./gujarati"),
  sinhala: () => import("./sinhala"),
};

/** Language codes this app can load (default language plus all lazy ones). */
export const SUPPORTED_LANGUAGES = [DEFAULT_LANGUAGE, ...Object.keys(languageLoaders)];

const cache = new Map<string, TranslationRecord>(Object.entries(eagerTranslations));

/**
 * Load a language's translations, returning null if the code is unknown.
 * Results are cached so a language is only fetched once per session.
 */
export async function loadLanguage(code: string): Promise<TranslationRecord | null> {
  if (cache.has(code)) return cache.get(code)!;

  const loader = languageLoaders[code];
  if (!loader) return null;

  try {
    const mod = await loader();
    cache.set(code, mod.default);
    return mod.default;
  } catch (error) {
    console.error(`Failed to load translations for "${code}"`, error);
    return null;
  }
}

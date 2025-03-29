
import { LanguageTranslations } from "./types";
import englishTranslations from "./english";
import spanishTranslations from "./spanish";
import portugueseTranslations from "./portuguese";

// Combine all translations into a single object
const translations: LanguageTranslations = {
  english: englishTranslations,
  spanish: spanishTranslations,
  portuguese: portugueseTranslations
};

export default translations;

// Define available languages for user interface (native languages)
export const AVAILABLE_LANGUAGES = {
  english: "English",
  spanish: "Spanish",
  portuguese: "Portuguese",
};

// Default UI language
export const DEFAULT_LANGUAGE = "english";

// Target language is always English (ESL focus)
export const TARGET_LANGUAGE = "english";

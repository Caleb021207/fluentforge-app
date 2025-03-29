
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

// Define available languages - only supporting native languages since this is ESL-focused
export const AVAILABLE_LANGUAGES = {
  spanish: "Spanish",
  portuguese: "Portuguese",
};

// English is the only target language as this is an ESL app
export const TARGET_LANGUAGE = "english";

// Default language for UI
export const DEFAULT_LANGUAGE = "english";

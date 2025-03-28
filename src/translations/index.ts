
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

// Define available languages
export const AVAILABLE_LANGUAGES = {
  english: "English",
  spanish: "Spanish",
  portuguese: "Portuguese",
};

// Default language
export const DEFAULT_LANGUAGE = "english";

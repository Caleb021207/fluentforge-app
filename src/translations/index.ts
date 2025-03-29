
import { LanguageTranslations } from "./types";
import { english } from "./english";
import { spanish } from "./spanish";
import { portuguese } from "./portuguese";

// Combine all translations into a single object
const translations: LanguageTranslations = {
  english: english,
  spanish: spanish,
  portuguese: portuguese
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

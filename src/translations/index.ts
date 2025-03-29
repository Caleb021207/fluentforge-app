
import { english } from "./english";
import { spanish } from "./spanish";
import { portuguese } from "./portuguese";
import { LanguageTranslations } from "./types";

// Combine all translations into a single object
const translations: LanguageTranslations = {
  english: english,
  spanish: spanish,
  portuguese: portuguese
};

export default translations;

// Define available languages with their native names
export const AVAILABLE_LANGUAGES = {
  english: "English",
  spanish: "Español",
  portuguese: "Português",
};

// Default language
export const DEFAULT_LANGUAGE = "english";

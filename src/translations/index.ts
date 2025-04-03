
import { LanguageTranslations } from "./types";
import englishTranslations from "./english/index";
import spanishTranslations from "./spanish/index";
import portugueseTranslations from "./portuguese/index";
import koreanTranslations from "./korean/index";
import arabicTranslations from "./arabic/index";
import mandarinTranslations from "./mandarin/index";

// Combine all translations into a single object
const translations: LanguageTranslations = {
  english: englishTranslations,
  spanish: spanishTranslations,
  portuguese: portugueseTranslations,
  korean: koreanTranslations,
  arabic: arabicTranslations,
  mandarin: mandarinTranslations
};

export default translations;

// Define available languages with their native names
export const AVAILABLE_LANGUAGES = {
  english: "English",
  spanish: "Español",
  portuguese: "Português",
  korean: "한국어",
  arabic: "العربية",
  mandarin: "中文",
};

// Default language
export const DEFAULT_LANGUAGE = "english";

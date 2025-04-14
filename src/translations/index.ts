
import { TranslationRecord } from "./types";
import englishTranslations from "./english";
import spanishTranslations from "./spanish";
import frenchTranslations from "./french";
import russianTranslations from "./russian";
import japaneseTranslations from "./japanese";
import koreanTranslations from "./korean";
import arabicTranslations from "./arabic";
import hindiTranslations from "./hindi";
import ukrainianTranslations from "./ukrainian";
import vietnameseTranslations from "./vietnamese";
import indonesianTranslations from "./indonesian";
import portugueseTranslations from "./portuguese";
// Import for mandarin if needed - noticed reference in the code but no file in the list
// import mandarinTranslations from "./mandarin";

// Update the available languages to only include those that actually exist
export const AVAILABLE_LANGUAGES = [
  "english",
  "spanish",
  "french",
  "portuguese",
  "russian",
  "japanese",
  "korean",
  "arabic",
  "hindi",
  "ukrainian",
  "vietnamese",
  "indonesian"
] as const;

export const DEFAULT_LANGUAGE = "english";

// Fix type issue by properly matching the expected Record<string, TranslationRecord> type
const translations: Record<string, TranslationRecord> = {
  english: englishTranslations,
  spanish: spanishTranslations,
  french: frenchTranslations,
  portuguese: portugueseTranslations,
  russian: russianTranslations,
  japanese: japaneseTranslations,
  korean: koreanTranslations,
  arabic: arabicTranslations,
  hindi: hindiTranslations,
  ukrainian: ukrainianTranslations,
  vietnamese: vietnameseTranslations,
  indonesian: indonesianTranslations
};

export default translations;

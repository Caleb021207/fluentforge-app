
import { TranslationRecord } from "./types";

// Import only well-supported language translations
import englishTranslations from "./english";
import spanishTranslations from "./spanish";
import portugueseTranslations from "./portuguese";
import frenchTranslations from "./french";
import germanTranslations from "./german";
import italianTranslations from "./italian";
import russianTranslations from "./russian";
import arabicTranslations from "./arabic";
import japaneseTranslations from "./japanese";
import koreanTranslations from "./korean";
import mandarinTranslations from "./mandarin";
import hindiTranslations from "./hindi";
import vietnameseTranslations from "./vietnamese";
import ukrainianTranslations from "./ukrainian";
import indonesianTranslations from "./indonesian";
import farsiTranslations from "./farsi";
import bengaliTranslations from "./bengali";
import tagalogTranslations from "./tagalog";
import turkishTranslations from "./turkish";
import polishTranslations from "./polish";
import thaiTranslations from "./thai";

// Main translations object containing only the 21 well-supported languages
const translations: Record<string, TranslationRecord> = {
  english: englishTranslations,
  spanish: spanishTranslations,
  portuguese: portugueseTranslations,
  french: frenchTranslations,
  german: germanTranslations,
  italian: italianTranslations,
  russian: russianTranslations,
  arabic: arabicTranslations,
  japanese: japaneseTranslations,
  korean: koreanTranslations,
  mandarin: mandarinTranslations,
  hindi: hindiTranslations,
  vietnamese: vietnameseTranslations,
  ukrainian: ukrainianTranslations,
  indonesian: indonesianTranslations,
  farsi: farsiTranslations,
  bengali: bengaliTranslations,
  tagalog: tagalogTranslations,
  turkish: turkishTranslations,
  polish: polishTranslations,
  thai: thaiTranslations
};

export default translations;


import { LanguageTranslations } from "./types";
import englishTranslations from "./english/index";
import spanishTranslations from "./spanish/index";
import portugueseTranslations from "./portuguese/index";
import koreanTranslations from "./korean/index";
import arabicTranslations from "./arabic/index";
import mandarinTranslations from "./mandarin/index";
import vietnameseTranslations from "./vietnamese/index";
import frenchTranslations from "./french/index";
import japaneseTranslations from "./japanese/index";
import russianTranslations from "./russian/index";
import ukrainianTranslations from "./ukrainian/index";
import hindiTranslations from "./hindi/index";
import indonesianTranslations from "./indonesian/index";
import farsiTranslations from "./farsi/index";
import urduTranslations from "./urdu/index";
import pashtoTranslations from "./pashto/index";
import swahiliTranslations from "./swahili/index";
// Import new language translations
import bengaliTranslations from "./bengali/index";
import somaliTranslations from "./somali/index";
import yorubaTranslations from "./yoruba/index";
import amharicTranslations from "./amharic/index";
import haitianTranslations from "./haitian/index";
import malayalamTranslations from "./malayalam/index";
import igboTranslations from "./igbo/index";
import polishTranslations from "./polish/index";
import turkishTranslations from "./turkish/index";
import romanianTranslations from "./romanian/index";

// Combine all translations into a single object
const translations: LanguageTranslations = {
  english: englishTranslations,
  spanish: spanishTranslations,
  portuguese: portugueseTranslations,
  korean: koreanTranslations,
  arabic: arabicTranslations,
  mandarin: mandarinTranslations,
  vietnamese: vietnameseTranslations,
  french: frenchTranslations,
  japanese: japaneseTranslations,
  russian: russianTranslations,
  ukrainian: ukrainianTranslations,
  hindi: hindiTranslations,
  indonesian: indonesianTranslations,
  farsi: farsiTranslations,
  urdu: urduTranslations,
  pashto: pashtoTranslations,
  swahili: swahiliTranslations,
  // Add new languages to the translations object
  bengali: bengaliTranslations,
  somali: somaliTranslations,
  yoruba: yorubaTranslations,
  amharic: amharicTranslations,
  haitian: haitianTranslations,
  malayalam: malayalamTranslations,
  igbo: igboTranslations,
  polish: polishTranslations,
  turkish: turkishTranslations,
  romanian: romanianTranslations
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
  vietnamese: "Tiếng Việt",
  french: "Français",
  japanese: "日本語",
  russian: "Русский",
  ukrainian: "Українська",
  hindi: "हिन्दी",
  indonesian: "Bahasa Indonesia",
  farsi: "فارسی",
  urdu: "اردو",
  pashto: "پښتو",
  swahili: "Kiswahili",
  // Add new languages with their native names
  bengali: "বাংলা",
  somali: "Soomaali",
  yoruba: "Yorùbá",
  amharic: "አማርኛ",
  haitian: "Kreyòl Ayisyen",
  malayalam: "മലയാളം",
  igbo: "Igbo",
  polish: "Polski",
  turkish: "Türkçe",
  romanian: "Română"
};

// Default language
export const DEFAULT_LANGUAGE = "english";

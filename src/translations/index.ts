
import { TranslationRecord } from "./types";

// Import all language translations
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
import pashtoTranslations from "./pashto";
import swahiliTranslations from "./swahili";
import turkishTranslations from "./turkish";
import dutchTranslations from "./dutch";
import polishTranslations from "./polish";
import czechTranslations from "./czech";
import greekTranslations from "./greek";
import hebrewTranslations from "./hebrew";
import thaiTranslations from "./thai";
import burmeseTranslations from "./burmese";
import amharicTranslations from "./amharic";
import somaliTranslations from "./somali";
import urduTranslations from "./urdu";
import nepaliTranslations from "./nepali";
import mongolianTranslations from "./mongolian";
import karenTranslations from "./karen";
import cantoneseTranslations from "./cantonese";
import tigrinyaTranslations from "./tigrinya";
import oromoTranslations from "./oromo";
import chineseTranslations from "./chinese";

// Main translations object containing all 37 languages with consistent core translations
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
  chinese: chineseTranslations,
  hindi: hindiTranslations,
  vietnamese: vietnameseTranslations,
  ukrainian: ukrainianTranslations,
  indonesian: indonesianTranslations,
  farsi: farsiTranslations,
  bengali: bengaliTranslations,
  tagalog: tagalogTranslations,
  pashto: pashtoTranslations,
  swahili: swahiliTranslations,
  turkish: turkishTranslations,
  dutch: dutchTranslations,
  polish: polishTranslations,
  czech: czechTranslations,
  greek: greekTranslations,
  hebrew: hebrewTranslations,
  thai: thaiTranslations,
  burmese: burmeseTranslations,
  amharic: amharicTranslations,
  somali: somaliTranslations,
  urdu: urduTranslations,
  nepali: nepaliTranslations,
  mongolian: mongolianTranslations,
  karen: karenTranslations,
  cantonese: cantoneseTranslations,
  tigrinya: tigrinyaTranslations,
  oromo: oromoTranslations
};

export default translations;

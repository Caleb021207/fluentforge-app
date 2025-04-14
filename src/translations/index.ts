import { TranslationRecord } from "./types";
import englishTranslations from "./english";
import spanishTranslations from "./spanish";
import frenchTranslations from "./french";
import germanTranslations from "./german";
import italianTranslations from "./italian";
import portugueseTranslations from "./portuguese";
import russianTranslations from "./russian";
import japaneseTranslations from "./japanese";
import koreanTranslations from "./korean";
import chineseTranslations from "./chinese";
import arabicTranslations from "./arabic";
import hindiTranslations from "./hindi";
import turkishTranslations from "./turkish";
import dutchTranslations from "./dutch";
import polishTranslations from "./polish";
import swedishTranslations from "./swedish";
import norwegianTranslations from "./norwegian";
import danishTranslations from "./danish";
import finnishTranslations from "./finnish";
import czechTranslations from "./czech";
import greekTranslations from "./greek";
import bulgarianTranslations from "./bulgarian";
import croatianTranslations from "./croatian";
import hungarianTranslations from "./hungarian";
import romanianTranslations from "./romanian";
import slovakTranslations from "./slovak";
import slovenianTranslations from "./slovenian";
import ukrainianTranslations from "./ukrainian";
import vietnameseTranslations from "./vietnamese";
import thaiTranslations from "./thai";
import indonesianTranslations from "./indonesian";
import malayTranslations from "./malay";
import filipinoTranslations from "./filipino";
import welshTranslations from "./welsh";
import irishTranslations from "./irish";

export const AVAILABLE_LANGUAGES = [
  "english",
  "spanish",
  "french",
  "german",
  "italian",
  "portuguese",
  "russian",
  "japanese",
  "korean",
  "chinese",
  "arabic",
  "hindi",
  "turkish",
  "dutch",
  "polish",
  "swedish",
  "norwegian",
  "danish",
  "finnish",
  "czech",
  "greek",
  "bulgarian",
  "croatian",
  "hungarian",
  "romanian",
  "slovak",
  "slovenian",
  "ukrainian",
  "vietnamese",
  "thai",
  "indonesian",
  "malay",
  "filipino",
  "welsh",
  "irish"
] as const;

export const DEFAULT_LANGUAGE = "english";

const translations = {
  english: englishTranslations,
  spanish: spanishTranslations,
  french: frenchTranslations,
  german: germanTranslations,
  italian: italianTranslations,
  portuguese: portugueseTranslations,
  russian: russianTranslations,
  japanese: japaneseTranslations,
  korean: koreanTranslations,
  chinese: chineseTranslations,
  arabic: arabicTranslations,
  hindi: hindiTranslations,
  turkish: turkishTranslations,
  dutch: dutchTranslations,
  polish: polishTranslations,
  swedish: swedishTranslations,
  norwegian: norwegianTranslations,
  danish: danishTranslations,
  finnish: finnishTranslations,
  czech: czechTranslations,
  greek: greekTranslations,
  bulgarian: bulgarianTranslations,
  croatian: croatianTranslations,
  hungarian: hungarianTranslations,
  romanian: romanianTranslations,
  slovak: slovakTranslations,
  slovenian: slovenianTranslations,
  ukrainian: ukrainianTranslations,
  vietnamese: vietnameseTranslations,
  thai: thaiTranslations,
  indonesian: indonesianTranslations,
  malay: malayTranslations,
  filipino: filipinoTranslations,
  welsh: welshTranslations,
  irish: irishTranslations
} as Record<string, TranslationRecord>;

export default translations;

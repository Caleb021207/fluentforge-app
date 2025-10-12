import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import languagesTranslations from "./languages";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Korean
const koreanTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...languagesTranslations,
  ...premiumVoiceTranslations,
};

export default koreanTranslations;

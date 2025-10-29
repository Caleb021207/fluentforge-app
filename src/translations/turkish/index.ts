import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import practiceTranslations from "./practice";

// Use only the minimal translations for Turkish
const turkishTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
  ...practiceTranslations,
};

export default turkishTranslations;

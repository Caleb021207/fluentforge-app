import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Ukrainian
const ukrainianTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
};

export default ukrainianTranslations;

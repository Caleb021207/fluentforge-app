import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Romanian
const romanianTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
};

export default romanianTranslations;

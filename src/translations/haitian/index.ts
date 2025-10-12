import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Haitian Creole
const haitianTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
};

export default haitianTranslations;

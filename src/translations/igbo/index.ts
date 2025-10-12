import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Igbo
const igboTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
};

export default igboTranslations;

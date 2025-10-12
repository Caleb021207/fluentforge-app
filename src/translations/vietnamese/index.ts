import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Vietnamese
const vietnameseTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
};

export default vietnameseTranslations;

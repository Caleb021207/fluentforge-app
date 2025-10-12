import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Hindi
const hindiTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
};

export default hindiTranslations;

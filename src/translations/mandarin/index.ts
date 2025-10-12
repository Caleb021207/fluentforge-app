import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Mandarin
const mandarinTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
};

export default mandarinTranslations;

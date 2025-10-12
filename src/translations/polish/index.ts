import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";

// Use only the minimal translations for Polish
const polishTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
};

export default polishTranslations;

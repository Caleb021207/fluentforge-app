import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import practiceTranslations from "./practice";
import navigationTranslations from "./navigation";

// Use only the minimal translations for Urdu
const urduTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
  ...practiceTranslations,
  ...navigationTranslations,
};

export default urduTranslations;

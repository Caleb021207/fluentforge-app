import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import languagesTranslations from "./languages";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";

// Use only the minimal translations for Thai
const thaiTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...languagesTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default thaiTranslations;

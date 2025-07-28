
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Punjabi
const punjabiTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
};

export default punjabiTranslations;

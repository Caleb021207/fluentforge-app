
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Punjabi
const punjabiTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default punjabiTranslations;

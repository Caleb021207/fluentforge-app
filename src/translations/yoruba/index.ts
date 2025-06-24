
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Yoruba
const yorubaTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default yorubaTranslations;

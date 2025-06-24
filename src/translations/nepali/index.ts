
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Nepali
const nepaliTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default nepaliTranslations;

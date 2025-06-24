
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Gujarati
const gujaratiTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default gujaratiTranslations;

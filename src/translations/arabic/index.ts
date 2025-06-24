
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Arabic
const arabicTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default arabicTranslations;

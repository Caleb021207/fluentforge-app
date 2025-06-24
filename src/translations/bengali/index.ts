
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Bengali
const bengaliTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default bengaliTranslations;

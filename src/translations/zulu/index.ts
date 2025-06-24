
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Zulu
const zuluTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default zuluTranslations;

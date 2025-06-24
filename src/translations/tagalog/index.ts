
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Tagalog
const tagalogTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default tagalogTranslations;

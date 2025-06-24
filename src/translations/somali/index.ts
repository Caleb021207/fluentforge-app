
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Somali
const somaliTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default somaliTranslations;

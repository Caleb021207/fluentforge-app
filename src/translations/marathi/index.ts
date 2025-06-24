
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Marathi
const marathiTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default marathiTranslations;


import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Japanese
const japaneseTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default japaneseTranslations;


import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Amharic
const amharicTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default amharicTranslations;

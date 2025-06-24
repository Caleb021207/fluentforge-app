
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Thai
const thaiTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default thaiTranslations;


import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Mandarin
const mandarinTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default mandarinTranslations;

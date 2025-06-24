
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for German
const germanTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default germanTranslations;

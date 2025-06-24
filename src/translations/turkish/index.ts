
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Turkish
const turkishTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default turkishTranslations;

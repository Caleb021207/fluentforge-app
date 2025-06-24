
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Cantonese
const cantoneseTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default cantoneseTranslations;

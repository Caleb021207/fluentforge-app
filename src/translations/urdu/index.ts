
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Urdu
const urduTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default urduTranslations;

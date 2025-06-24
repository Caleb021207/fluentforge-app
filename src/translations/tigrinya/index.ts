
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Tigrinya
const tigrinyaTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default tigrinyaTranslations;

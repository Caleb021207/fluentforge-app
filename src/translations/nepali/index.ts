
import { TranslationRecord } from "../types";
import nepaliCoreTranslations from "./core";

// Use only the clean core translations for Nepali
const nepaliTranslations: TranslationRecord = {
  ...nepaliCoreTranslations
};

export default nepaliTranslations;

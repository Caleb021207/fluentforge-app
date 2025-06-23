
import { TranslationRecord } from "../types";
import nepaliCoreTranslations from "./core";
import nepaliPracticeTranslations from "./practice";

// Complete Nepali translations with practice integration
const nepaliTranslations: TranslationRecord = {
  ...nepaliCoreTranslations,
  ...nepaliPracticeTranslations
};

export default nepaliTranslations;

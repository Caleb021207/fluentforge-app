
import { TranslationRecord } from "../types";
import tagalogCoreTranslations from "./core";
import tagalogPracticeTranslations from "./practice";

// Complete Tagalog translations with practice integration
const tagalogTranslations: TranslationRecord = {
  ...tagalogCoreTranslations,
  ...tagalogPracticeTranslations
};

export default tagalogTranslations;

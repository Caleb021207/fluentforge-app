
import { TranslationRecord } from "../types";
import tagalogCoreTranslations from "./core";

// Use only the clean core translations for Tagalog
const tagalogTranslations: TranslationRecord = {
  ...tagalogCoreTranslations
};

export default tagalogTranslations;

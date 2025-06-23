
import { TranslationRecord } from "../types";
import hebrewCoreTranslations from "./core";

// Use only the clean core translations for Hebrew
const hebrewTranslations: TranslationRecord = {
  ...hebrewCoreTranslations
};

export default hebrewTranslations;


import { TranslationRecord } from "../types";
import hebrewCoreTranslations from "./core";
import hebrewPracticeTranslations from "./practice";

// Complete Hebrew translations with practice integration
const hebrewTranslations: TranslationRecord = {
  ...hebrewCoreTranslations,
  ...hebrewPracticeTranslations
};

export default hebrewTranslations;

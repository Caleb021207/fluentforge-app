
import { TranslationRecord } from "../types";
import marathiCoreTranslations from "./core";
import marathiPracticeTranslations from "./practice";

// Complete Marathi translations with practice integration
const marathiTranslations: TranslationRecord = {
  ...marathiCoreTranslations,
  ...marathiPracticeTranslations
};

export default marathiTranslations;

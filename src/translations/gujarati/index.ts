
import { TranslationRecord } from "../types";
import gujaratiCoreTranslations from "./core";
import gujaratiPracticeTranslations from "./practice";

// Complete Gujarati translations with practice integration
const gujaratiTranslations: TranslationRecord = {
  ...gujaratiCoreTranslations,
  ...gujaratiPracticeTranslations
};

export default gujaratiTranslations;

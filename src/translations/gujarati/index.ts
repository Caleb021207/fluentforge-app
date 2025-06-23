
import { TranslationRecord } from "../types";
import gujaratiGeneralTranslations from "./general-core";
import gujaratiPracticeTranslations from "./practice";

// Complete Gujarati translations with practice integration
const gujaratiTranslations: TranslationRecord = {
  ...gujaratiGeneralTranslations,
  ...gujaratiPracticeTranslations
};

export default gujaratiTranslations;

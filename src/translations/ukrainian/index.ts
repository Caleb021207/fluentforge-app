
import { TranslationRecord } from "../types";
import ukrainianCoreTranslations from "./core";
import ukrainianPracticeTranslations from "./practice";

// Complete Ukrainian translations with practice integration
const ukrainianTranslations: TranslationRecord = {
  ...ukrainianCoreTranslations,
  ...ukrainianPracticeTranslations
};

export default ukrainianTranslations;


import { TranslationRecord } from "../types";
import haitianCoreTranslations from "./core";
import haitianPracticeTranslations from "./practice";

// Complete Haitian translations with practice integration
const haitianTranslations: TranslationRecord = {
  ...haitianCoreTranslations,
  ...haitianPracticeTranslations
};

export default haitianTranslations;

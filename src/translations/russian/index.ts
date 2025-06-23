
import { TranslationRecord } from "../types";
import russianCoreTranslations from "./core";
import russianPracticeTranslations from "./practice";

// Complete Russian translations with practice integration
const russianTranslations: TranslationRecord = {
  ...russianCoreTranslations,
  ...russianPracticeTranslations
};

export default russianTranslations;

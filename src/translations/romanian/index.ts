
import { TranslationRecord } from "../types";
import romanianCoreTranslations from "./core";
import romanianPracticeTranslations from "./practice";

// Complete Romanian translations with practice integration
const romanianTranslations: TranslationRecord = {
  ...romanianCoreTranslations,
  ...romanianPracticeTranslations
};

export default romanianTranslations;

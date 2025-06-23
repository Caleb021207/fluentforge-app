
import { TranslationRecord } from "../types";
import dutchCoreTranslations from "./core";
import dutchPracticeTranslations from "./practice";

// Complete Dutch translations with practice integration
const dutchTranslations: TranslationRecord = {
  ...dutchCoreTranslations,
  ...dutchPracticeTranslations
};

export default dutchTranslations;

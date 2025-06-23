
import { TranslationRecord } from "../types";
import farsiCoreTranslations from "./core";
import farsiPracticeTranslations from "./practice";

// Complete Farsi translations with practice integration
const farsiTranslations: TranslationRecord = {
  ...farsiCoreTranslations,
  ...farsiPracticeTranslations
};

export default farsiTranslations;

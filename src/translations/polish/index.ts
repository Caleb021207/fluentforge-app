
import { TranslationRecord } from "../types";
import polishCoreTranslations from "./core";
import polishPracticeTranslations from "./practice";

// Complete Polish translations with practice integration
const polishTranslations: TranslationRecord = {
  ...polishCoreTranslations,
  ...polishPracticeTranslations
};

export default polishTranslations;

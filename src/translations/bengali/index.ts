
import { TranslationRecord } from "../types";
import bengaliCoreTranslations from "./core";
import bengaliPracticeTranslations from "./practice";

// Complete Bengali translations with practice integration
const bengaliTranslations: TranslationRecord = {
  ...bengaliCoreTranslations,
  ...bengaliPracticeTranslations
};

export default bengaliTranslations;


import { TranslationRecord } from "../types";
import punjabiCoreTranslations from "./core";
import punjabiPracticeTranslations from "./practice";

// Complete Punjabi translations with practice integration
const punjabiFTranslations: TranslationRecord = {
  ...punjabiCoreTranslations,
  ...punjabiPracticeTranslations
};

export default punjabiFTranslations;

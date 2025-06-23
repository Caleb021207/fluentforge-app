
import { TranslationRecord } from "../types";
import turkishCoreTranslations from "./core";
import turkishPracticeTranslations from "./practice";

// Complete Turkish translations with practice integration
const turkishTranslations: TranslationRecord = {
  ...turkishCoreTranslations,
  ...turkishPracticeTranslations
};

export default turkishTranslations;

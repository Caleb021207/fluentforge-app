
import { TranslationRecord } from "../types";
import germanCoreTranslations from "./core";
import germanPracticeTranslations from "./practice";

// Complete German translations with practice integration
const germanTranslations: TranslationRecord = {
  ...germanCoreTranslations,
  ...germanPracticeTranslations
};

export default germanTranslations;

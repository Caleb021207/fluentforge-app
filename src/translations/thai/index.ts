
import { TranslationRecord } from "../types";
import thaiCoreTranslations from "./core";
import thaiPracticeTranslations from "./practice";

// Complete Thai translations with practice integration
const thaiTranslations: TranslationRecord = {
  ...thaiCoreTranslations,
  ...thaiPracticeTranslations
};

export default thaiTranslations;

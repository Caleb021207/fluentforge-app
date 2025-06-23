
import { TranslationRecord } from "../types";
import ukrainianCoreTranslations from "./core";

// Use only the clean core translations for Ukrainian
const ukrainianTranslations: TranslationRecord = {
  ...ukrainianCoreTranslations
};

export default ukrainianTranslations;

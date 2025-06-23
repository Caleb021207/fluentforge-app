
import { TranslationRecord } from "../types";
import germanCoreTranslations from "./core";

// Use only the clean core translations for German
const germanTranslations: TranslationRecord = {
  ...germanCoreTranslations
};

export default germanTranslations;

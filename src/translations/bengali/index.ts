
import { TranslationRecord } from "../types";
import bengaliCoreTranslations from "./core";

// Use only the clean core translations for Bengali
const bengaliTranslations: TranslationRecord = {
  ...bengaliCoreTranslations
};

export default bengaliTranslations;

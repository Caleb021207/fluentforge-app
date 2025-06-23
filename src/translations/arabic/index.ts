
import { TranslationRecord } from "../types";
import arabicCoreTranslations from "./core";

// Use only the clean core translations for Arabic
const arabicTranslations: TranslationRecord = {
  ...arabicCoreTranslations
};

export default arabicTranslations;

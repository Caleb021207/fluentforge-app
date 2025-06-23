
import { TranslationRecord } from "../types";
import thaiCoreTranslations from "./core";

// Use only the clean core translations for Thai
const thaiTranslations: TranslationRecord = {
  ...thaiCoreTranslations
};

export default thaiTranslations;

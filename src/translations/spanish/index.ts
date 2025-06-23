
import { TranslationRecord } from "../types";
import spanishCoreTranslations from "./core";

// Use only the clean core translations for Spanish
const spanishTranslations: TranslationRecord = {
  ...spanishCoreTranslations
};

export default spanishTranslations;


import { TranslationRecord } from "../types";
import turkishCoreTranslations from "./core";

// Use only the clean core translations for Turkish
const turkishTranslations: TranslationRecord = {
  ...turkishCoreTranslations
};

export default turkishTranslations;

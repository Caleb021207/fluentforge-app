
import { TranslationRecord } from "../types";
import farsiCoreTranslations from "./core";

// Use only the clean core translations for Farsi
const farsiTranslations: TranslationRecord = {
  ...farsiCoreTranslations
};

export default farsiTranslations;

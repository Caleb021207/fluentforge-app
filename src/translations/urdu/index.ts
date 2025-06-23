
import { TranslationRecord } from "../types";
import urduCoreTranslations from "./core";

// Use only the clean core translations for Urdu
const urduTranslations: TranslationRecord = {
  ...urduCoreTranslations
};

export default urduTranslations;

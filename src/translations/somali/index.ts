
import { TranslationRecord } from "../types";
import somaliCoreTranslations from "./core";

// Use only the clean core translations for Somali
const somaliTranslations: TranslationRecord = {
  ...somaliCoreTranslations
};

export default somaliTranslations;

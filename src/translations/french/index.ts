
import { TranslationRecord } from "../types";
import frenchCoreTranslations from "./core";

// Use only the clean core translations for French
const frenchTranslations: TranslationRecord = {
  ...frenchCoreTranslations
};

export default frenchTranslations;


import { TranslationRecord } from "../types";
import portugueseCoreTranslations from "./core";

// Use only the clean core translations for Portuguese
const portugueseTranslations: TranslationRecord = {
  ...portugueseCoreTranslations
};

export default portugueseTranslations;

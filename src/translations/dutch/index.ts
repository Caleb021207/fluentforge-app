
import { TranslationRecord } from "../types";
import dutchCoreTranslations from "./core";

// Use only the clean core translations for Dutch
const dutchTranslations: TranslationRecord = {
  ...dutchCoreTranslations
};

export default dutchTranslations;

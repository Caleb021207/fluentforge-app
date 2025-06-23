
import { TranslationRecord } from "../types";
import amharicCoreTranslations from "./core";

// Use only the clean core translations for Amharic
const amharicTranslations: TranslationRecord = {
  ...amharicCoreTranslations
};

export default amharicTranslations;

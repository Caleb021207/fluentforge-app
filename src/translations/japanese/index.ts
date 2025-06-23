
import { TranslationRecord } from "../types";
import japaneseCoreTranslations from "./core";

// Use only the clean core translations for Japanese
const japaneseTranslations: TranslationRecord = {
  ...japaneseCoreTranslations
};

export default japaneseTranslations;


import { TranslationRecord } from "../types";
import polishCoreTranslations from "./core";

// Use only the clean core translations for Polish
const polishTranslations: TranslationRecord = {
  ...polishCoreTranslations
};

export default polishTranslations;

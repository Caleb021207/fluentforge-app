
import { TranslationRecord } from "../types";
import russianCoreTranslations from "./core";

// Use only the clean core translations for Russian
const russianTranslations: TranslationRecord = {
  ...russianCoreTranslations
};

export default russianTranslations;


import { TranslationRecord } from "../types";
import mongolianCoreTranslations from "./core";

// Use only the clean core translations for Mongolian
const mongolianTranslations: TranslationRecord = {
  ...mongolianCoreTranslations
};

export default mongolianTranslations;

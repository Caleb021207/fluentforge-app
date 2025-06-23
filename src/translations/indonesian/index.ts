
import { TranslationRecord } from "../types";
import indonesianCoreTranslations from "./core";

// Use only the clean core translations for Indonesian
const indonesianTranslations: TranslationRecord = {
  ...indonesianCoreTranslations
};

export default indonesianTranslations;


import { TranslationRecord } from "../types";
import czechCoreTranslations from "./core";

// Use only the clean core translations for Czech
const czechTranslations: TranslationRecord = {
  ...czechCoreTranslations
};

export default czechTranslations;

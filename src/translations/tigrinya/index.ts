
import { TranslationRecord } from "../types";
import tigrinyaCoreTranslations from "./core";

// Use only the clean core translations for Tigrinya
const tigrinyaTranslations: TranslationRecord = {
  ...tigrinyaCoreTranslations
};

export default tigrinyaTranslations;

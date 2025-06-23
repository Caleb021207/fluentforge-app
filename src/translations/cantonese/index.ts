
import { TranslationRecord } from "../types";
import cantoneseCoreTranslations from "./core";

// Use only the clean core translations for Cantonese
const cantoneseTranslations: TranslationRecord = {
  ...cantoneseCoreTranslations
};

export default cantoneseTranslations;

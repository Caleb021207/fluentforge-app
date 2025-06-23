
import { TranslationRecord } from "../types";
import burmeseCoreTranslations from "./core";

// Use only the clean core translations for Burmese
const burmeseTranslations: TranslationRecord = {
  ...burmeseCoreTranslations
};

export default burmeseTranslations;

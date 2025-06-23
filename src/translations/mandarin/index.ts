
import { TranslationRecord } from "../types";
import mandarinCoreTranslations from "./core";

// Use only the clean core translations for Mandarin
const mandarinTranslations: TranslationRecord = {
  ...mandarinCoreTranslations
};

export default mandarinTranslations;

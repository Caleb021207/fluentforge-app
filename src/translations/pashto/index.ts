
import { TranslationRecord } from "../types";
import pashtoCoreTranslations from "./core";

// Use only the clean core translations for Pashto
const pashtoTranslations: TranslationRecord = {
  ...pashtoCoreTranslations
};

export default pashtoTranslations;

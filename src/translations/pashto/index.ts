
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Pashto
const pashtoTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default pashtoTranslations;

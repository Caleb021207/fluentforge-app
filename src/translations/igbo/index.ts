
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Igbo
const igboTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default igboTranslations;

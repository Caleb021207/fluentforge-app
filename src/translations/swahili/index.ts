
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Swahili
const swahiliTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default swahiliTranslations;

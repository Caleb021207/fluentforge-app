
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Vietnamese
const vietnameseTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default vietnameseTranslations;

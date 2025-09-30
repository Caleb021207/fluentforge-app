
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Vietnamese
const vietnameseTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
};

export default vietnameseTranslations;

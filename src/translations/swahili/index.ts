
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Swahili
const swahiliTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
};

export default swahiliTranslations;

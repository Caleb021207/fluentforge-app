
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import languagesTranslations from "./languages";

// Use only the minimal translations for Swahili
const swahiliTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...languagesTranslations,
};

export default swahiliTranslations;

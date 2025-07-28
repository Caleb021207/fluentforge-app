
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Arabic
const arabicTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
};

export default arabicTranslations;

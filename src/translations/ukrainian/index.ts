
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Ukrainian
const ukrainianTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
};

export default ukrainianTranslations;

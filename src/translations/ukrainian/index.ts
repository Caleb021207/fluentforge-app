
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Ukrainian
const ukrainianTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default ukrainianTranslations;

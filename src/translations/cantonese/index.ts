
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Cantonese
const cantoneseTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
};

export default cantoneseTranslations;


import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Tamil
const tamilTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default tamilTranslations;

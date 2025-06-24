
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Romanian
const romanianTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default romanianTranslations;

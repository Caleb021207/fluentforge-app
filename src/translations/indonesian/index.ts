
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Indonesian
const indonesianTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default indonesianTranslations;

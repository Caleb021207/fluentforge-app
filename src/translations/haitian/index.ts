
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Haitian Creole
const haitianTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default haitianTranslations;

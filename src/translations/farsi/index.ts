
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Farsi
const farsiTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default farsiTranslations;

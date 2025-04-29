
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";

// Simplified approach - only include available translations for now
const romanianTranslations: TranslationRecord = {
  ...languageSelectionTranslations
};

export default romanianTranslations;


import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";

// Simplified approach - only include available translations for now
const amharicTranslations: TranslationRecord = {
  ...languageSelectionTranslations
};

export default amharicTranslations;

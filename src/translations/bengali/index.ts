
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";

// Combine available translation categories
const bengaliTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...practiceTranslations
};

export default bengaliTranslations;

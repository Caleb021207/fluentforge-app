
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import classroomTranslations from "./classroom";

// Combine available translation categories
const bengaliTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...classroomTranslations
};

export default bengaliTranslations;

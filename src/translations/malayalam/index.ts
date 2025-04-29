
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import classroomTranslations from "./classroom";

// Simplified approach - only include available translations for now
const malayalamTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...classroomTranslations
};

export default malayalamTranslations;

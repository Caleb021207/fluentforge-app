
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import classroomTranslations from "./classroom";

// Simplified approach - only include available translations for now
const polishTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...classroomTranslations
};

export default polishTranslations;

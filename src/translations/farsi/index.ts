
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import authTranslations from "./auth";
import languagesTranslations from "./languages";

// Combine all the translation categories
const farsiTranslations: TranslationRecord = {
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...authTranslations,
  ...languagesTranslations,
};

export default farsiTranslations;

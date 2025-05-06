
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";

// Combine all the translation categories
const thaiTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  // You would add more imports here as they are created
};

export default thaiTranslations;

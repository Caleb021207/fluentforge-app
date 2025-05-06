
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import voiceChatTranslations from "./voice-chat";
import practiceTranslations from "./practice";
import uiElementsTranslations from "./ui-elements";
import languageSelectionTranslations from "./language-selection";
import authTranslations from "./auth";

// Combine all the translation categories
const germanTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...voiceChatTranslations,
  ...practiceTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...authTranslations,
  // You would add more imports here as they are created
};

export default germanTranslations;

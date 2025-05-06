
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import uiElementsTranslations from "./ui-elements";

// Combine all the translation categories
const punjabiTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...uiElementsTranslations,
  // You would add more imports here as they are created
};

export default punjabiTranslations;

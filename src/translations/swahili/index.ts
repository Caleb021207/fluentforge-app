
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import languagesTranslations from "./languages";
import voiceChatTranslations from "./voice-chat";

// Combine all the translation categories
const swahiliTranslations: TranslationRecord = {
  ...generalTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...languagesTranslations,
  ...voiceChatTranslations,
};

export default swahiliTranslations;

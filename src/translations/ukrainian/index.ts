
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import navigationTranslations from "./navigation";
import practiceTranslations from "./practice";
import languageSelectionTranslations from "./language-selection";
import authTranslations from "./auth";
import languagesTranslations from "./languages";
import uiElementsTranslations from "./ui-elements";
import voiceChatTranslations from "./voice-chat";

// Combine all the translation categories
const ukrainianTranslations: TranslationRecord = {
  ...generalTranslations,
  ...navigationTranslations,
  ...practiceTranslations,
  ...languageSelectionTranslations,
  ...authTranslations,
  ...languagesTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
};

export default ukrainianTranslations;

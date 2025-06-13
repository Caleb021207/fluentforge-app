
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";
import authTranslations from "./auth";

// Combine all the translation categories
const sinhalaTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations,
  ...authTranslations,
};

export default sinhalaTranslations;

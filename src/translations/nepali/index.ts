
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import voiceChatTranslations from "./voice-chat";

// Combine all the translation categories
const nepaliTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
};

export default nepaliTranslations;

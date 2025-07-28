
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";
import authTranslations from "./auth";
import pronunciationTranslations from "./pronunciation";

// Combine all the translation categories
const karenTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations,
  ...authTranslations,
};

export default karenTranslations;

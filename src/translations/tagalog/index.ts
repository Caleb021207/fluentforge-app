
import { TranslationRecord } from "../types";
import authTranslations from "./auth";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languagesTranslations from "./languages";

const translations: TranslationRecord = {
  ...authTranslations,
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languagesTranslations,
};

export default translations;

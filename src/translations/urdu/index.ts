
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import authTranslations from "./auth";
import practiceTranslations from "./practice";
import certificatesTranslations from "./certificates";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import uiElementsTranslations from "./ui-elements";

const translations: TranslationRecord = {
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...authTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...uiElementsTranslations
};

export default translations;

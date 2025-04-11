
import { TranslationRecord } from "../types";
import authTranslations from "./auth";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import profileTranslations from "./profile";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";

const translations: TranslationRecord = {
  ...authTranslations,
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...profileTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
};

export default translations;

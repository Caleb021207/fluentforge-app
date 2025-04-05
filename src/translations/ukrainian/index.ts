
import { TranslationRecord } from "../types";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import generalTranslations from "./general";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import voiceChatTranslations from "./voice-chat";

// Combine all Ukrainian translations
const ukrainianTranslations: TranslationRecord = {
  ...authTranslations,
  ...certificatesTranslations,
  ...generalTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...premiumVoiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...voiceChatTranslations
};

export default ukrainianTranslations;

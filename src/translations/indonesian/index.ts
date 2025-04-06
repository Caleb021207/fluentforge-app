
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";
import authTranslations from "./auth";
import voiceChatTranslations from "./voice-chat";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import languageFrameworksTranslations from "./language-frameworks";

// Combine all the translation categories
const indonesianTranslations: TranslationRecord = {
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...authTranslations,
};

export default indonesianTranslations;

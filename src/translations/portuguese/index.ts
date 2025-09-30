
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import authTranslations from "./auth";
import languagesTranslations from "./languages";
import navigationTranslations from "./navigation";
import pronunciationTranslations from "./pronunciation";

// Combine all the translation categories
const portugueseTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...generalTranslations,
  ...authTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...navigationTranslations,
  ...pronunciationTranslations,
};

export default portugueseTranslations;

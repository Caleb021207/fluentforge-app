
import { TranslationRecord } from "../types";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import voiceChatTranslations from "./voice-chat";
import languagesTranslations from "./languages";
import navigationTranslations from "./navigation";
import landingAuthTranslations from "./landing-auth";
import classroomTranslations from "./classroom";
import settingsTranslations from "./settings";
import pronunciationTranslations from "./pronunciation";

// Combine all Indonesian translations
const indonesianTranslations: TranslationRecord = {
  ...authTranslations,
  ...certificatesTranslations,
  ...generalTranslations,
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...premiumVoiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...voiceChatTranslations,
  ...languagesTranslations,
  ...navigationTranslations,
  ...landingAuthTranslations,
  ...classroomTranslations,
  ...settingsTranslations,
  ...pronunciationTranslations
};

export default indonesianTranslations;

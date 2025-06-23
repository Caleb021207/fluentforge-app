
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import voiceChatTranslations from "./voice-chat";
import practiceTranslations from "./practice";
import uiElementsTranslations from "./ui-elements";
import languageSelectionTranslations from "./language-selection";
import authTranslations from "./auth";
import navigationTranslations from "./navigation";
import landingAuthTranslations from "./landing-auth";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";
import pronunciationTranslations from "./pronunciation";
import classroomTranslations from "./classroom";
import settingsTranslations from "./settings";

const translations: TranslationRecord = {
  ...generalCoreTranslations,
  ...voiceChatTranslations,
  ...practiceTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...authTranslations,
  ...navigationTranslations,
  ...landingAuthTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...pronunciationTranslations,
  ...classroomTranslations,
  ...settingsTranslations,
};

export default translations;

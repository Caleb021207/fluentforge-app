
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import authTranslations from "./auth";
import navigationTranslations from "./navigation";
import landingAuthTranslations from "./landing-auth";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import profileTranslations from "./profile";
import premiumVoiceTranslations from "./premium-voice";
import languagesTranslations from "./languages";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";

const translations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...authTranslations,
  ...navigationTranslations,
  ...landingAuthTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...profileTranslations,
  ...premiumVoiceTranslations,
  ...languagesTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations
};

export default translations;

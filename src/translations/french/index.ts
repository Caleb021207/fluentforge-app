
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
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
import uiElementsTranslations from "./ui-elements";
import landingAuthTranslations from "./landing-auth";

const frenchTranslations: TranslationRecord = {
  ...generalTranslations,
  ...generalCoreTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...authTranslations,
  ...languagesTranslations,
  ...navigationTranslations,
  ...uiElementsTranslations,
  ...landingAuthTranslations,
};

export default frenchTranslations;

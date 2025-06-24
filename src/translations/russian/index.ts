
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";
import landingAuthTranslations from "./landing-auth";
import authTranslations from "./auth";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import profileTranslations from "./profile";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";
import pronunciationTranslations from "./pronunciation";

const translations: TranslationRecord = {
  ...generalTranslations,
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations,
  ...landingAuthTranslations,
  ...authTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...profileTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...pronunciationTranslations,
};

export default translations;

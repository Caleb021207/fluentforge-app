
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import languagesTranslations from "./languages";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import authTranslations from "./auth";
import navigationTranslations from "./navigation";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import pronunciationTranslations from "./pronunciation";
import landingAuthTranslations from "./landing-auth";

// Combine all the translation categories
const pashtoTranslations: TranslationRecord = {
  ...generalTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...languagesTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...authTranslations,
  ...navigationTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...pronunciationTranslations,
  ...landingAuthTranslations,
};

export default pashtoTranslations;

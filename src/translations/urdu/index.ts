
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
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

// Combine all the translation categories
const urduTranslations: TranslationRecord = {
  ...generalTranslations,
  ...uiElementsTranslations,
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
};

export default urduTranslations;

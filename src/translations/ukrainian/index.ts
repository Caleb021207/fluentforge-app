
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import landingAuthTranslations from "./landing-auth";
import navigationTranslations from "./navigation";
import practiceTranslations from "./practice";
import languageSelectionTranslations from "./language-selection";
import authTranslations from "./auth";
import languagesTranslations from "./languages";
import voiceChatTranslations from "./voice-chat";
import profileTranslations from "./profile";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import pronunciationTranslations from "./pronunciation";

// Combine all the translation categories
const ukrainianTranslations: TranslationRecord = {
  ...generalTranslations,
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...landingAuthTranslations,
  ...navigationTranslations,
  ...practiceTranslations,
  ...languageSelectionTranslations,
  ...authTranslations,
  ...languagesTranslations,
  ...voiceChatTranslations,
  ...profileTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...pronunciationTranslations,
};

export default ukrainianTranslations;

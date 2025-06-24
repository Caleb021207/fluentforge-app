
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import navigationTranslations from "./navigation";
import authTranslations from "./auth";
import landingAuthTranslations from "./landing-auth";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";
import uiElementsTranslations from "./ui-elements";

const vietnameseTranslations: TranslationRecord = {
  ...generalTranslations,
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...navigationTranslations,
  ...authTranslations,
  ...landingAuthTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...uiElementsTranslations
};

export default vietnameseTranslations;

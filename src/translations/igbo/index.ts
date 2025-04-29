
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import languagesTranslations from "./languages";
import voiceChatTranslations from "./voice-chat";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import languageFrameworksTranslations from "./language-frameworks";
import premiumVoiceTranslations from "./premium-voice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import dataPrivacyTranslations from "./data-privacy";
import ferpaTranslations from "./ferpa";
import safetyTranslations from "./safety";

// Combine all the translation categories
const igboTranslations: TranslationRecord = {
  ...generalTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...languagesTranslations,
  ...voiceChatTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...languageFrameworksTranslations,
  ...premiumVoiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...dataPrivacyTranslations,
  ...ferpaTranslations,
  ...safetyTranslations
};

export default igboTranslations;

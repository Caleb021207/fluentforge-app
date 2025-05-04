
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import dataPrivacyTranslations from "./data-privacy";
import ferpaTranslations from "./ferpa";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import safetyTranslations from "./safety";
import voiceChatTranslations from "./voice-chat";

// Combine all Tagalog translations
const tagalogTranslations: TranslationRecord = {
  ...generalTranslations,
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...dataPrivacyTranslations,
  ...ferpaTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...practiceTranslations,
  ...premiumVoiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...safetyTranslations,
  ...voiceChatTranslations
};

export default tagalogTranslations;

import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import ferpaTranslations from "./ferpa";
import safetyTranslations from "./safety";
import dataPrivacyTranslations from "./data-privacy";
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

// Combine all the translation categories
const englishTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...ferpaTranslations,
  ...safetyTranslations,
  ...dataPrivacyTranslations,
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
};

// Add speech rate control translations if they don't exist
export default {
  ...englishTranslations,
  
  // Speech rate translations
  speechRate: "Speech Rate",
  verySlow: "Very Slow",
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
  veryFast: "Very Fast",
};

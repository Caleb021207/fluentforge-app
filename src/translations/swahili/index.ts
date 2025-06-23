
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";
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
import settingsTranslations from "./settings";
import dataPrivacyTranslations from "./data-privacy";
import ferpaTranslations from "./ferpa";
import safetyTranslations from "./safety";

// Combine all the translation categories
const swahiliTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...generalTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations,
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
  ...settingsTranslations,
  ...dataPrivacyTranslations,
  ...ferpaTranslations,
  ...safetyTranslations
};

export default swahiliTranslations;

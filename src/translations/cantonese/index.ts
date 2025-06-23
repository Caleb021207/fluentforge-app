
import { TranslationRecord } from "../types";
import authTranslations from "./auth";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import profileTranslations from "./profile";
import premiumVoiceTranslations from "./premium-voice";
import languagesTranslations from "./languages";
import classroomTranslations from "./classroom";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import languageFrameworksTranslations from "./language-frameworks";
import dataPrivacyTranslations from "./data-privacy";
import ferpaTranslations from "./ferpa";
import safetyTranslations from "./safety";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";

const translations: TranslationRecord = {
  ...authTranslations,
  ...generalTranslations,
  ...generalCoreTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...profileTranslations,
  ...premiumVoiceTranslations,
  ...languagesTranslations,
  ...classroomTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...languageFrameworksTranslations,
  ...dataPrivacyTranslations,
  ...ferpaTranslations,
  ...safetyTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations
};

export default translations;


import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import authTranslations from "./auth";

// Create empty objects for translations that don't exist yet
const certificatesTranslations: TranslationRecord = {};
const progressTranslations: TranslationRecord = {};
const profileTranslations: TranslationRecord = {};
const languageFrameworksTranslations: TranslationRecord = {};

// Combine all the translation categories
const turkishTranslations: TranslationRecord = {
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...authTranslations,
};

export default turkishTranslations;


import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import premiumVoiceTranslations from "./premium-voice";

// Create empty objects for translations that don't exist yet
const practiceTranslations: TranslationRecord = {};
const certificatesTranslations: TranslationRecord = {};
const progressTranslations: TranslationRecord = {};
const profileTranslations: TranslationRecord = {};
const voiceChatTranslations: TranslationRecord = {};
const languageFrameworksTranslations: TranslationRecord = {};
const authTranslations: TranslationRecord = {};

// Combine all the translation categories
const indonesianTranslations: TranslationRecord = {
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

export default indonesianTranslations;

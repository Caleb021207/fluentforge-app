
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import classroomTranslations from "./classroom";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import generalTranslations from "./general";

// Simplified approach - only include available translations for now
const amharicTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...classroomTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...generalTranslations
};

export default amharicTranslations;


import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import languageSelectionTranslations from "./language-selection";
import classroomTranslations from "./classroom";

const tagalogTranslations: TranslationRecord = {
  ...generalTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...languageSelectionTranslations,
  ...classroomTranslations
};

export default tagalogTranslations;

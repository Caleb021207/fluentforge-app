
import { TranslationRecord } from "../types";
import authTranslations from "./auth";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import profileTranslations from "./profile";
import premiumVoiceTranslations from "./premium-voice";
import languagesTranslations from "./languages";
import classroomTranslations from "./classroom";

const translations: TranslationRecord = {
  ...authTranslations,
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...profileTranslations,
  ...premiumVoiceTranslations,
  ...languagesTranslations,
  ...classroomTranslations,
};

export default translations;

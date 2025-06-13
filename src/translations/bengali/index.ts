
import { TranslationRecord } from "../types";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import classroomTranslations from "./classroom";
import navigationTranslations from "./navigation";
import authTranslations from "./auth";

const bengaliTranslations: TranslationRecord = {
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...classroomTranslations,
  ...navigationTranslations,
  ...authTranslations,
};

export default bengaliTranslations;

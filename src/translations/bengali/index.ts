
import { TranslationRecord } from "../types";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import classroomTranslations from "./classroom";

const bengaliTranslations: TranslationRecord = {
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...classroomTranslations
};

export default bengaliTranslations;

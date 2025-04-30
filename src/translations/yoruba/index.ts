
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import classroomTranslations from "./classroom";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";
import generalTranslations from "./general";
import voiceChatTranslations from "./voice-chat";

const yorubaTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...classroomTranslations,
  ...practiceTranslations,
  ...premiumVoiceTranslations,
  ...generalTranslations,
  ...voiceChatTranslations
};

export default yorubaTranslations;

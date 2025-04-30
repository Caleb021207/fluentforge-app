
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import classroomTranslations from "./classroom";
import practiceTranslations from "./practice";
import premiumVoiceTranslations from "./premium-voice";
import voiceChatTranslations from "./voice-chat";
import generalTranslations from "./general";

const malayalamTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...classroomTranslations,
  ...practiceTranslations,
  ...premiumVoiceTranslations,
  ...voiceChatTranslations,
  ...generalTranslations
};

export default malayalamTranslations;

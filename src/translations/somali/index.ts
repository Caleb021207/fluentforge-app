
import { TranslationRecord } from "../types";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import practiceTranslations from "./practice";
import classroomTranslations from "./classroom";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import generalTranslations from "./general";

const somaliTranslations: TranslationRecord = {
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...practiceTranslations,
  ...classroomTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...generalTranslations
};

export default somaliTranslations;

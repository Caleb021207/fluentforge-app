
import { TranslationRecord } from "../types";
import vietnameseCoreTranslations from "./core";
import vietnamesePracticeTranslations from "./practice";
import vietnameseVoiceChatTranslations from "./voice-chat";

// Complete Vietnamese translations with voice chat and practice integration
const vietnameseTranslations: TranslationRecord = {
  ...vietnameseCoreTranslations,
  ...vietnamesePracticeTranslations,
  ...vietnameseVoiceChatTranslations
};

export default vietnameseTranslations;

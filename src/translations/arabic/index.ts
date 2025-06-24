
import { TranslationRecord } from "../types";
import arabicCoreTranslations from "./core";
import arabicPracticeTranslations from "./practice";
import arabicVoiceChatTranslations from "./voice-chat";

// Complete Arabic translations with voice chat and practice integration
const arabicTranslations: TranslationRecord = {
  ...arabicCoreTranslations,
  ...arabicVoiceChatTranslations,
  ...arabicPracticeTranslations
};

export default arabicTranslations;

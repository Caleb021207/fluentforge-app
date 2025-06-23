
import { TranslationRecord } from "../types";
import ukrainianCoreTranslations from "./core";
import ukrainianVoiceChatTranslations from "./voice-chat";

// Complete Ukrainian translations with voice chat integration
const ukrainianTranslations: TranslationRecord = {
  ...ukrainianCoreTranslations,
  ...ukrainianVoiceChatTranslations
};

export default ukrainianTranslations;

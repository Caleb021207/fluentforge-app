
import { TranslationRecord } from "../types";
import japaneseCoreTranslations from "./core";
import japanesePracticeTranslations from "./practice";
import japaneseVoiceChatTranslations from "./voice-chat";

// Complete Japanese translations with voice chat and practice integration
const japaneseTranslations: TranslationRecord = {
  ...japaneseCoreTranslations,
  ...japanesePracticeTranslations,
  ...japaneseVoiceChatTranslations
};

export default japaneseTranslations;

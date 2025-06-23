
import { TranslationRecord } from "../types";
import italianCoreTranslations from "./core";
import italianPracticeTranslations from "./practice";
import italianVoiceChatTranslations from "./voice-chat";

// Complete Italian translations with practice and voice chat integration
const italianTranslations: TranslationRecord = {
  ...italianCoreTranslations,
  ...italianPracticeTranslations,
  ...italianVoiceChatTranslations
};

export default italianTranslations;

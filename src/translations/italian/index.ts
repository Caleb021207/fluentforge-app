
import { TranslationRecord } from "../types";
import italianCoreTranslations from "./core";
import italianVoiceChatTranslations from "./voice-chat";

// Complete Italian translations with voice chat integration
const italianTranslations: TranslationRecord = {
  ...italianCoreTranslations,
  ...italianVoiceChatTranslations
};

export default italianTranslations;

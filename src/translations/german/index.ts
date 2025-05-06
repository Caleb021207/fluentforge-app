
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import voiceChatTranslations from "./voice-chat";
import practiceTranslations from "./practice";

// Combine all the translation categories
const germanTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...voiceChatTranslations,
  ...practiceTranslations,
  // You would add more imports here as they are created
};

export default germanTranslations;

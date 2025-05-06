
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";

// Combine all the translation categories
const gujaratiTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  // You would add more imports here as they are created
};

export default gujaratiTranslations;

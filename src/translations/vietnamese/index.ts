
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";

const vietnameseTranslations: TranslationRecord = {
  ...generalTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations
};

export default vietnameseTranslations;

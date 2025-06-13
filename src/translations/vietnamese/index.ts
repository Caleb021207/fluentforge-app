
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import navigationTranslations from "./navigation";

const vietnameseTranslations: TranslationRecord = {
  ...generalTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...navigationTranslations
};

export default vietnameseTranslations;

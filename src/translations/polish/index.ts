
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
import authTranslations from "./auth";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import voiceChatTranslations from "./voice-chat";
import classroomTranslations from "./classroom";

// Combine all Polish translations
const polishTranslations: TranslationRecord = {
  ...generalTranslations,
  ...uiElementsTranslations,
  ...authTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...classroomTranslations
};

export default polishTranslations;


import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import uiElementsTranslations from "./ui-elements";
import navigationTranslations from "./navigation";
import authTranslations from "./auth";
import pronunciationTranslations from "./pronunciation";
import assignmentsTranslations from "./assignments";

// Combine all the translation categories
const tigrinyaTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...pronunciationTranslations,
  ...generalCoreTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...uiElementsTranslations,
  ...navigationTranslations,
  ...authTranslations,
};

export default tigrinyaTranslations;

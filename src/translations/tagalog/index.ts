import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import languagesTranslations from "./languages";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import classroomTranslations from "./classroom";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const tagalogTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...authTranslations,
  ...classroomTranslations,
  ...generalTranslations,
  ...generalCoreTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...languagesTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default tagalogTranslations;

import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import classroomTranslations from "./classroom";
import generalTranslations from "./general";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const yorubaTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...classroomTranslations,
  ...generalTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default yorubaTranslations;

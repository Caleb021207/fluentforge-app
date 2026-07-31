import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import classroomTranslations from "./classroom";
import generalTranslations from "./general";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import uiElementsTranslations from "./ui-elements";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const polishTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...classroomTranslations,
  ...generalTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default polishTranslations;

import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import generalTranslations from "./general";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const hindiTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...generalTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...voiceChatTranslations,
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default hindiTranslations;

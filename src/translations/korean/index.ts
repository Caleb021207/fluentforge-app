import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import languagesTranslations from "./languages";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import uiElementsTranslations from "./ui-elements";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const koreanTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...generalTranslations,
  ...generalCoreTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...languagesTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default koreanTranslations;

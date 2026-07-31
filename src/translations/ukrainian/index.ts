import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import accuracyTranslations from "./accuracy";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import certificationsTranslations from "./certifications";
import commonTranslations from "./common";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import landingAuthTranslations from "./landing-auth";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import settingsTranslations from "./settings";
import uiElementsTranslations from "./ui-elements";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const ukrainianTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...accuracyTranslations,
  ...assignmentsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...certificationsTranslations,
  ...commonTranslations,
  ...generalTranslations,
  ...generalCoreTranslations,
  ...landingAuthTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...settingsTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default ukrainianTranslations;

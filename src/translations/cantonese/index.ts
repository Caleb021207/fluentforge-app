import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import classroomTranslations from "./classroom";
import dataPrivacyTranslations from "./data-privacy";
import ferpaTranslations from "./ferpa";
import generalTranslations from "./general";
import generalCoreTranslations from "./general-core";
import landingAuthTranslations from "./landing-auth";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import languagesTranslations from "./languages";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import safetyTranslations from "./safety";
import uiElementsTranslations from "./ui-elements";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const cantoneseTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...classroomTranslations,
  ...dataPrivacyTranslations,
  ...ferpaTranslations,
  ...generalTranslations,
  ...generalCoreTranslations,
  ...landingAuthTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...languagesTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...safetyTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
  ...minimalTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default cantoneseTranslations;

import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";
import languagesTranslations from "./languages";
import premiumVoiceTranslations from "./premium-voice";
import navigationTranslations from "./navigation";
import assignmentsTranslations from "./assignments";
import authTranslations from "./auth";
import certificatesTranslations from "./certificates";
import dataPrivacyTranslations from "./data-privacy";
import ferpaTranslations from "./ferpa";
import generalTranslations from "./general";
import languageFrameworksTranslations from "./language-frameworks";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import profileTranslations from "./profile";
import progressTranslations from "./progress";
import safetyTranslations from "./safety";
import uiElementsTranslations from "./ui-elements";
import voiceChatTranslations from "./voice-chat";

// Merge every translated category file for this pack.
const swahiliTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...authTranslations,
  ...certificatesTranslations,
  ...dataPrivacyTranslations,
  ...ferpaTranslations,
  ...generalTranslations,
  ...languageFrameworksTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...safetyTranslations,
  ...uiElementsTranslations,
  ...voiceChatTranslations,
  ...pronunciationTranslations,
  ...minimalTranslations,
  ...languagesTranslations,
  ...premiumVoiceTranslations,
  ...navigationTranslations,
};

export default swahiliTranslations;

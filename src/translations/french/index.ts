import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import generalTranslations from "./general";
import uiElementsTranslations from "./ui-elements";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import languageSelectionTranslations from "./language-selection";
import authTranslations from "./auth";
import languagesTranslations from "./languages";
import navigationTranslations from "./navigation";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import assignmentsTranslations from "./assignments";
import certificatesTranslations from "./certificates";
import generalCoreTranslations from "./general-core";
import landingAuthTranslations from "./landing-auth";
import languageFrameworksTranslations from "./language-frameworks";
import profileTranslations from "./profile";
import progressTranslations from "./progress";

const frenchTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...certificatesTranslations,
  ...generalCoreTranslations,
  ...landingAuthTranslations,
  ...languageFrameworksTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...generalTranslations,
  ...uiElementsTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...languageSelectionTranslations,
  ...authTranslations,
  ...languagesTranslations,
  ...navigationTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
  ...minimalTranslations,
};

export default frenchTranslations;

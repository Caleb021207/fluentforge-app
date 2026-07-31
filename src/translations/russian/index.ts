import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import practiceTranslations from "./practice";
import voiceChatTranslations from "./voice-chat";
import authTranslations from "./auth";
import languageSelectionTranslations from "./language-selection";
import navigationTranslations from "./navigation";
import pronunciationTranslations from "./pronunciation";
import premiumVoiceTranslations from "./premium-voice";
import assignmentsTranslations from "./assignments";
import certificatesTranslations from "./certificates";
import generalTranslations from "./general";
import landingAuthTranslations from "./landing-auth";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";
import profileTranslations from "./profile";
import progressTranslations from "./progress";

const russianTranslations: TranslationRecord = {
  // Previously-unmerged files, wired in (existing entries below keep
  // precedence on key collisions).
  ...assignmentsTranslations,
  ...certificatesTranslations,
  ...generalTranslations,
  ...landingAuthTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...profileTranslations,
  ...progressTranslations,
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...practiceTranslations,
  ...voiceChatTranslations,
  ...authTranslations,
  ...languageSelectionTranslations,
  ...navigationTranslations,
  ...pronunciationTranslations,
  ...premiumVoiceTranslations,
  ...minimalTranslations,
};

export default russianTranslations;

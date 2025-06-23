
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import generalTranslations from "./general";
import authTranslations from "./auth";
import languageSelectionTranslations from "./language-selection";
import practiceTranslations from "./practice";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";
import navigationTranslations from "./navigation";
import landingAuthTranslations from "./landing-auth";
import pronunciationTranslations from "./pronunciation";
import classroomTranslations from "./classroom";
import settingsTranslations from "./settings";

// Combine all the translation categories
const koreanTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...generalTranslations,
  ...authTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...navigationTranslations,
  ...landingAuthTranslations,
  ...pronunciationTranslations,
  ...classroomTranslations,
  ...settingsTranslations,
};

export default koreanTranslations;

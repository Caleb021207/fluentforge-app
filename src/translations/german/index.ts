
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import uiElementsTranslations from "./ui-elements";
import landingAuthTranslations from "./landing-auth";
import certificatesTranslations from "./certificates";
import progressTranslations from "./progress";
import profileTranslations from "./profile";
import premiumVoiceTranslations from "./premium-voice";
import languageFrameworksTranslations from "./language-frameworks";
import languagesTranslations from "./languages";
import pronunciationTranslations from "./pronunciation";
import classroomTranslations from "./classroom";
import settingsTranslations from "./settings";

const translations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...landingAuthTranslations,
  ...certificatesTranslations,
  ...progressTranslations,
  ...profileTranslations,
  ...premiumVoiceTranslations,
  ...languageFrameworksTranslations,
  ...languagesTranslations,
  ...pronunciationTranslations,
  ...classroomTranslations,
  ...settingsTranslations,
};

export default translations;

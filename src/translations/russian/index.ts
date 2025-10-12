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

const russianTranslations: TranslationRecord = {
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

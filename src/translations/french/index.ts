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

const frenchTranslations: TranslationRecord = {
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

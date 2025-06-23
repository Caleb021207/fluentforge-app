
import { TranslationRecord } from "../types";
import punjabiGeneralTranslations from "./general-core";
import punjabiPracticeTranslations from "./practice";

// Complete Punjabi translations with practice integration
const punjabiTranslations: TranslationRecord = {
  ...punjabiGeneralTranslations,
  ...punjabiPracticeTranslations
};

export default punjabiTranslations;

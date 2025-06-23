
import { TranslationRecord } from "../types";
import marathiGeneralTranslations from "./general-core";
import marathiPracticeTranslations from "./practice";

// Complete Marathi translations with practice integration
const marathiTranslations: TranslationRecord = {
  ...marathiGeneralTranslations,
  ...marathiPracticeTranslations
};

export default marathiTranslations;


import { TranslationRecord } from "../types";
import romanianGeneralTranslations from "./general";
import romanianPracticeTranslations from "./practice";

// Complete Romanian translations with practice integration
const romanianTranslations: TranslationRecord = {
  ...romanianGeneralTranslations,
  ...romanianPracticeTranslations
};

export default romanianTranslations;

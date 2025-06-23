
import { TranslationRecord } from "../types";
import haitianGeneralTranslations from "./general";
import haitianPracticeTranslations from "./practice";

// Complete Haitian translations with practice integration
const haitianTranslations: TranslationRecord = {
  ...haitianGeneralTranslations,
  ...haitianPracticeTranslations
};

export default haitianTranslations;

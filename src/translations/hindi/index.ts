
import { TranslationRecord } from "../types";
import hindiCoreTranslations from "./core";
import hindiPracticeTranslations from "./practice";

// Complete Hindi translations with practice integration
const hindiTranslations: TranslationRecord = {
  ...hindiCoreTranslations,
  ...hindiPracticeTranslations
};

export default hindiTranslations;

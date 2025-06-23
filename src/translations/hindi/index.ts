
import { TranslationRecord } from "../types";
import hindiCoreTranslations from "./core";

// Use only the clean core translations for Hindi
const hindiTranslations: TranslationRecord = {
  ...hindiCoreTranslations
};

export default hindiTranslations;

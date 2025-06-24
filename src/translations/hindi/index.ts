
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Hindi
const hindiTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default hindiTranslations;

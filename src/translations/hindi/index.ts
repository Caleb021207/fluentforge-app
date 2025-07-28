
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Hindi
const hindiTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
};

export default hindiTranslations;

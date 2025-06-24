
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Malayalam
const malayalamTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default malayalamTranslations;

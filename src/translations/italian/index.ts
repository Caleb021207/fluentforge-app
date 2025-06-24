
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Italian
const italianTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default italianTranslations;

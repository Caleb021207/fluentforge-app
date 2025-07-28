
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Italian
const italianTranslations: TranslationRecord = {
  ...pronunciationTranslations,
  ...minimalTranslations,
};

export default italianTranslations;

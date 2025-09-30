
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Polish
const polishTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
};

export default polishTranslations;

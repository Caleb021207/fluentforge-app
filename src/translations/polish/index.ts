
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Polish
const polishTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default polishTranslations;

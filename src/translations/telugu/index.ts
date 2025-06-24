
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Telugu
const teluguTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default teluguTranslations;

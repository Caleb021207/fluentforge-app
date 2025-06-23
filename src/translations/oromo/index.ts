
import { TranslationRecord } from "../types";
import oromoCoreTranslations from "./core";

// Use only the clean core translations for Oromo
const oromoTranslations: TranslationRecord = {
  ...oromoCoreTranslations
};

export default oromoTranslations;


import { TranslationRecord } from "../types";
import swahiliCoreTranslations from "./core";

// Use only the clean core translations for Swahili
const swahiliTranslations: TranslationRecord = {
  ...swahiliCoreTranslations
};

export default swahiliTranslations;

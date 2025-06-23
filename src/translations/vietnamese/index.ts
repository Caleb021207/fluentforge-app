
import { TranslationRecord } from "../types";
import vietnameseCoreTranslations from "./core";

// Use only the clean core translations for Vietnamese
const vietnameseTranslations: TranslationRecord = {
  ...vietnameseCoreTranslations
};

export default vietnameseTranslations;

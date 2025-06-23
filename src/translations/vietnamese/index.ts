
import { TranslationRecord } from "../types";
import vietnameseCoreTranslations from "./core";
import vietnamesePracticeTranslations from "./practice";

// Complete Vietnamese translations with practice integration
const vietnameseTranslations: TranslationRecord = {
  ...vietnameseCoreTranslations,
  ...vietnamesePracticeTranslations
};

export default vietnameseTranslations;

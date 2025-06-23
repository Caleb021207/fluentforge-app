
import { TranslationRecord } from "../types";
import pashtoCoreTranslations from "./core";
import pashtoPracticeTranslations from "./practice";

// Complete Pashto translations with practice integration
const pashtoTranslations: TranslationRecord = {
  ...pashtoCoreTranslations,
  ...pashtoPracticeTranslations
};

export default pashtoTranslations;

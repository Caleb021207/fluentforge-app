
import { TranslationRecord } from "../types";
import swahiliCoreTranslations from "./core";
import swahiliPracticeTranslations from "./practice";

// Complete Swahili translations with practice integration
const swahiliTranslations: TranslationRecord = {
  ...swahiliCoreTranslations,
  ...swahiliPracticeTranslations
};

export default swahiliTranslations;

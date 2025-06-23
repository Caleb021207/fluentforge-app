
import { TranslationRecord } from "../types";
import italianCoreTranslations from "./core";
import italianPracticeTranslations from "./practice";

// Complete Italian translations with practice integration
const italianTranslations: TranslationRecord = {
  ...italianCoreTranslations,
  ...italianPracticeTranslations
};

export default italianTranslations;

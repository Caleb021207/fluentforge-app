
import { TranslationRecord } from "../types";
import cantoneseCoreTranslations from "./core";
import cantonesePracticeTranslations from "./practice";

// Complete Cantonese translations with practice integration
const cantoneseTranslations: TranslationRecord = {
  ...cantoneseCoreTranslations,
  ...cantonesePracticeTranslations
};

export default cantoneseTranslations;

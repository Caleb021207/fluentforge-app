
import { TranslationRecord } from "../types";
import italianCoreTranslations from "./core";

// Use only the clean core translations for Italian
const italianTranslations: TranslationRecord = {
  ...italianCoreTranslations
};

export default italianTranslations;

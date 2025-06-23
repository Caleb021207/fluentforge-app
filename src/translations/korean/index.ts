
import { TranslationRecord } from "../types";
import koreanCoreTranslations from "./core";

// Use only the clean core translations for Korean
const koreanTranslations: TranslationRecord = {
  ...koreanCoreTranslations
};

export default koreanTranslations;

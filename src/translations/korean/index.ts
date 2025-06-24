
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";

// Use only the minimal translations for Korean
const koreanTranslations: TranslationRecord = {
  ...minimalTranslations,
};

export default koreanTranslations;

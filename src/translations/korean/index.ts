
import { TranslationRecord } from "../types";
import minimalTranslations from "./minimal";
import pronunciationTranslations from "./pronunciation";

// Use only the minimal translations for Korean
const koreanTranslations: TranslationRecord = {
  ...minimalTranslations,
  ...pronunciationTranslations,
};

export default koreanTranslations;

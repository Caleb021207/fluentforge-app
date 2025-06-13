
import { TranslationRecord } from "../types";
import generalTranslations from "./general";
import navigationTranslations from "./navigation";

// Combine all the translation categories
const arabicTranslations: TranslationRecord = {
  ...generalTranslations,
  ...navigationTranslations,
};

export default arabicTranslations;

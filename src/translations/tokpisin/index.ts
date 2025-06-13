
import { TranslationRecord } from "../types";
import navigationTranslations from "./navigation";
import generalTranslations from "./general";

// Combine all the translation categories
const tokpisinTranslations: TranslationRecord = {
  ...navigationTranslations,
  ...generalTranslations,
};

export default tokpisinTranslations;


import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";

// Combine all the translation categories
const thaiTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  // You would add more imports here as they are created
};

export default thaiTranslations;

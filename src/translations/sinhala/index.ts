
import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";

// Combine all the translation categories
const sinhalaTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  // You would add more imports here as they are created
};

export default sinhalaTranslations;

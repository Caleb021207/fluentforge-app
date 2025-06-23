
import { TranslationRecord } from "../types";
import greekCoreTranslations from "./core";

// Use only the clean core translations for Greek
const greekTranslations: TranslationRecord = {
  ...greekCoreTranslations
};

export default greekTranslations;

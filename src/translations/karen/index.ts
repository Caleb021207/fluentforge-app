
import { TranslationRecord } from "../types";
import karenCoreTranslations from "./core";

// Use only the clean core translations for Karen
const karenTranslations: TranslationRecord = {
  ...karenCoreTranslations
};

export default karenTranslations;

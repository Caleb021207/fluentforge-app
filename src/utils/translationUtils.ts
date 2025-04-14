
import translations from "@/translations";
import { TranslationRecord } from "@/translations/types";

export const getTranslationsForLanguage = (language: string): TranslationRecord => {
  const langTranslations = translations[language];
  
  if (language === "english") {
    // For English, combine all module translations
    return Object.values(langTranslations).reduce((acc, moduleTranslations) => ({
      ...acc,
      ...moduleTranslations
    }), {});
  }
  
  // For other languages, return the flat structure
  return langTranslations as TranslationRecord;
};

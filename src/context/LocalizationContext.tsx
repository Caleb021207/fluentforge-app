import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translations, { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "@/translations";
import { LanguageTranslations, TranslationModule, TranslationRecord } from "@/translations/types";
import { getNativeLanguageDisplayName } from "@/utils/languageUtils";

// Create context
type LocalizationContextType = {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  getNativeLanguageName: (language: string) => string;
};

const LocalizationContext = createContext<LocalizationContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setCurrentLanguage: () => {},
  t: () => "",
  getNativeLanguageName: () => "",
});

// Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("nativeLanguage");
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Translation function
  const t = (key: string, replacements?: Record<string, string>): string => {
    // Get translation for current language or fallback to default
    const langTranslations = translations[currentLanguage];
    const defaultTranslations = translations[DEFAULT_LANGUAGE];
    
    let text: string = key;
    
    // Try to get translation based on the structure
    if (key.includes(".")) {
      // Handle nested keys (e.g., "voice-chat.startSpeaking")
      const [module, moduleKey] = key.split(".");
      
      if (currentLanguage === "english") {
        // English uses modular structure
        const moduleTranslations = (defaultTranslations as Record<string, TranslationRecord>)[module as TranslationModule];
        if (moduleTranslations && moduleKey) {
          text = moduleTranslations[moduleKey] || key;
        }
      } else {
        // Other languages use flat structure
        text = (langTranslations as TranslationRecord)[key] || 
               (defaultTranslations.common as TranslationRecord)[key] || 
               key;
      }
    } else {
      // Handle flat keys
      if (currentLanguage === "english") {
        // For English, try to find in common translations first
        text = ((defaultTranslations as Record<string, TranslationRecord>).common?.[key] ||
                (defaultTranslations as Record<string, any>)[key] ||
                key);
      } else {
        // For other languages, use flat structure
        text = ((langTranslations as TranslationRecord)[key] ||
                (defaultTranslations.common as TranslationRecord)[key] ||
                key);
      }
    }
    
    // Apply replacements if any
    if (replacements && typeof text === 'string') {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{{${placeholder}}}`, value);
      });
    }
    
    return text;
  };

  // Get native language name
  const getNativeLanguageName = (language: string): string => {
    return getNativeLanguageDisplayName(language);
  };

  return (
    <LocalizationContext.Provider value={{ 
      currentLanguage, 
      setCurrentLanguage, 
      t,
      getNativeLanguageName
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook for using the localization context
export const useLocalization = () => useContext(LocalizationContext);

// Re-export from translations module for easy access
export { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE };

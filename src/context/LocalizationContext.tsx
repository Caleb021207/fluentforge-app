import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translations, { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "@/translations";
import { LanguageTranslations, TranslationRecord } from "@/translations/types";
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
  const t = (key: string, replacements?: Record<string, string>) => {
    // Get translation for current language or fallback to default
    const langTranslations = translations[currentLanguage];
    const defaultTranslations = translations[DEFAULT_LANGUAGE];
    
    let text: string;
    
    // Handle different translation structures (nested vs flat)
    if (currentLanguage === "english") {
      // English uses nested structure - try to extract from module
      const [module, moduleKey] = key.includes(".") ? key.split(".") : [null, key];
      
      if (module && langTranslations[module] && typeof langTranslations[module] === "object") {
        text = (langTranslations[module] as TranslationRecord)[moduleKey] || key;
      } else {
        // Try direct lookup for non-modularized keys
        text = (langTranslations as any)[key] || key;
      }
    } else {
      // Other languages use flat structure
      text = (langTranslations as TranslationRecord)[key] || 
             (defaultTranslations.common as TranslationRecord)[key] || 
             key;
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

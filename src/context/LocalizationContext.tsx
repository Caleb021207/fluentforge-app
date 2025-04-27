
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translations, { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "@/translations";
import { LanguageTranslations } from "@/translations/types";
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
    
    // Debug - log available translations
    console.log("Available languages:", Object.keys(AVAILABLE_LANGUAGES));
    console.log("Available translations:", Object.keys(translations));
  }, []);

  // Translation function
  const t = (key: string, replacements?: Record<string, string>) => {
    try {
      // Check if translations exist
      if (!translations) {
        console.error("No translations available");
        return key;
      }
      
      // Check if current language exists
      if (!translations[currentLanguage]) {
        console.error(`No translations for language: ${currentLanguage}`);
        return key;
      }
      
      // Get translation for current language or fallback to default
      let text = translations[currentLanguage]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
      
      // Apply replacements if any
      if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
          const regex = new RegExp(`{{${placeholder}}}`, 'g');
          text = text.replace(regex, value);
          
          // Also support {language} format (without double braces)
          const simpleRegex = new RegExp(`{${placeholder}}`, 'g');
          text = text.replace(simpleRegex, value);
        });
      }
      
      return text;
    } catch (error) {
      console.error("Translation error:", error);
      return key; // Return the key as fallback
    }
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
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  
  if (context === undefined) {
    console.error("useLocalization must be used within a LocalizationProvider");
  }
  
  return context;
};

// Re-export from translations module for easy access
export { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE };

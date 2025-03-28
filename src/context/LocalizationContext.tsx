
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translations, { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "@/translations";
import { LanguageTranslations } from "@/translations/types";

// Create context
type LocalizationContextType = {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
};

const LocalizationContext = createContext<LocalizationContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setCurrentLanguage: () => {},
  t: () => "",
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
    let text = translations[currentLanguage]?.[key] || translations[DEFAULT_LANGUAGE][key] || key;
    
    // Apply replacements if any
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{{${placeholder}}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LocalizationContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook for using the localization context
export const useLocalization = () => useContext(LocalizationContext);

// Re-export from translations module for easy access
export { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE };

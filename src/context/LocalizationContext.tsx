
import React, { createContext, useState, useEffect, ReactNode } from "react";
import translations from "@/translations";
import { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from "@/translations/constants";
import { getNativeLanguageDisplayName } from "@/utils/languageUtils";
import { getTranslation, isClassroomRoute } from "@/utils/localizationUtils";

// Create context type
export type LocalizationContextType = {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  getNativeLanguageName: (language: string) => string;
};

// Create context with default values
export const LocalizationContext = createContext<LocalizationContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setCurrentLanguage: () => {},
  t: () => "",
  getNativeLanguageName: () => "",
});

interface LocalizationProviderProps {
  children: ReactNode;
}

// Provider component
export const LocalizationProvider = ({ children }: LocalizationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [missingKeys, setMissingKeys] = useState<Set<string>>(new Set());
  // We need to get the location in a different way since we're outside the router context
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Update path when it changes
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', updatePath);
    
    return () => {
      window.removeEventListener('popstate', updatePath);
    };
  }, []);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("nativeLanguage");
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
    
    // Debug - log available translations
    console.log("Available languages:", Object.keys(AVAILABLE_LANGUAGES));
    console.log("Available translations:", Object.keys(translations));
  }, []);

  // Translation function that uses the utility
  const t = (key: string, replacements?: Record<string, string>): string => {
    return getTranslation(
      key, 
      currentLanguage, 
      currentPath, 
      replacements, 
      missingKeys
    );
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

// Re-export from translations module for easy access
export { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE };

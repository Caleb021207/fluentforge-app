
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translations from "@/translations";
import { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from "@/translations/constants";
import { LanguageTranslations } from "@/translations/types";
import { getNativeLanguageDisplayName } from "@/utils/languageUtils";
import { useLocation } from "react-router-dom";

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

// Check if current path is a classroom-related route
const isClassroomRoute = (path: string): boolean => {
  return path.includes("/teacher/classes") || 
         path.includes("/student/class");
};

// Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
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

  // Translation function with enhanced fallback and logging
  const t = (key: string, replacements?: Record<string, string>) => {
    try {
      // Check if translations exist
      if (!translations) {
        console.error("No translations available");
        return key;
      }
      
      // Always use English translations for classroom routes
      const isClassroom = isClassroomRoute(currentPath);
      const languageToUse = isClassroom ? DEFAULT_LANGUAGE : currentLanguage;
      
      // Check if selected language exists
      const selectedTranslations = translations[languageToUse];
      const defaultTranslations = translations[DEFAULT_LANGUAGE];
      
      if (!selectedTranslations) {
        console.error(`No translations for language: ${languageToUse}`);
        return defaultTranslations?.[key] || key;
      }
      
      // Get translation for selected language or fallback to default
      let text = selectedTranslations[key];
      
      // If translation is missing in selected language but exists in default language
      if (!text && defaultTranslations?.[key]) {
        // Only log each missing key once per session
        if (!missingKeys.has(key)) {
          console.warn(`Missing translation for key "${key}" in language "${languageToUse}"`);
          setMissingKeys(prev => new Set([...prev, key]));
        }
        text = defaultTranslations[key];
      }
      
      // If translation is missing in both languages, return the key
      if (!text) {
        if (!missingKeys.has(key)) {
          console.error(`Translation key not found: "${key}" in any language`);
          setMissingKeys(prev => new Set([...prev, key]));
        }
        return key;
      }
      
      // Apply replacements if any
      if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
          // Support {{placeholder}} format
          const regex = new RegExp(`{{${placeholder}}}`, 'g');
          text = text.replace(regex, value);
          
          // Also support {placeholder} format
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
  
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  
  return context;
};

// Re-export from translations module for easy access
export { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE };

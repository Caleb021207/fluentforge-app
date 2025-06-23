
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

// Routes that should ALWAYS use English
const ENGLISH_ONLY_ROUTES = [
  "/profile",
  "/settings", 
  "/ai-tutor",
  "/admin"
];

// Check if current path should use English only
const shouldUseEnglishOnly = (path: string): boolean => {
  return ENGLISH_ONLY_ROUTES.some(route => path.includes(route)) ||
         path.includes("/teacher/classes") || 
         path.includes("/student/class");
};

// Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
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
  }, []);

  // Focused translation function with automatic English fallback
  const t = (key: string, replacements?: Record<string, string>): string => {
    try {
      // Force English for certain routes
      const languageToUse = shouldUseEnglishOnly(currentPath) ? DEFAULT_LANGUAGE : currentLanguage;
      
      // Get translations for the target language
      const targetTranslations = translations[languageToUse];
      const fallbackTranslations = translations[DEFAULT_LANGUAGE];
      
      if (!targetTranslations || !fallbackTranslations) {
        console.error(`Missing translations for language: ${languageToUse}`);
        return key;
      }
      
      // Try to get translation from target language first
      let translationValue = targetTranslations[key];
      
      // If not found or not a string, fallback to English
      if (!translationValue || typeof translationValue !== 'string') {
        translationValue = fallbackTranslations[key];
        
        // Log missing translation only if we're not already using English
        if (languageToUse !== DEFAULT_LANGUAGE && translationValue) {
          console.warn(`Missing translation for "${key}" in ${languageToUse}, using English fallback`);
        }
      }
      
      // If still not found, return the key itself
      if (!translationValue || typeof translationValue !== 'string') {
        console.error(`Translation key not found: "${key}"`);
        return key;
      }
      
      // Apply replacements if provided
      if (replacements) {
        let result = translationValue;
        Object.entries(replacements).forEach(([placeholder, replaceValue]) => {
          // Support {{placeholder}} format (primary)
          const regex = new RegExp(`{{${placeholder}}}`, 'g');
          result = result.replace(regex, replaceValue);
          
          // Also support {placeholder} format (fallback)
          const simpleRegex = new RegExp(`{${placeholder}}`, 'g');
          result = result.replace(simpleRegex, replaceValue);
        });
        return result;
      }
      
      return translationValue;
    } catch (error) {
      console.error("Translation error:", error);
      return key;
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

// Custom hook
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
};

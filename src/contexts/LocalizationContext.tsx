
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { eagerTranslations, loadLanguage, SUPPORTED_LANGUAGES } from "@/translations/loader";
import type { TranslationRecord } from "@/translations/types";
import { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from "@/translations/constants";
import { getNativeLanguageDisplayName } from "@/utils/languageUtils";
import { secureStorage } from "@/utils/security/dataEncryption";

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

// Teacher-facing classroom management stays English (the dashboard is only
// authored in English); student-facing pages always honor the learner's L1.
const isClassroomRoute = (path: string): boolean => {
  return path.startsWith("/teacher");
};

// Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [missingKeys, setMissingKeys] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  // Translations are loaded on demand. English is always present as a fallback;
  // other languages are merged in once their chunk finishes loading.
  const [translations, setTranslations] = useState<Record<string, TranslationRecord>>(
    eagerTranslations,
  );

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

  // Restore the saved language preference on mount.
  useEffect(() => {
    const savedLanguage = secureStorage.getItem("nativeLanguage");
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Load the active language's translation chunk if we don't have it yet.
  useEffect(() => {
    if (translations[currentLanguage]) return;

    let cancelled = false;
    loadLanguage(currentLanguage).then((loaded) => {
      if (!cancelled && loaded) {
        setTranslations((prev) => ({ ...prev, [currentLanguage]: loaded }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage, translations]);

  // Enhanced translation function with proper interpolation support
  const t = (key: string, replacements?: Record<string, string>): string => {
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
        return String(defaultTranslations?.[key]) || key;
      }
      
      // Get translation for selected language or fallback to default
      let translationValue: string = "";
      
      // Handle nested objects in translations (e.g., suggestedTopics.introductions)
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        const parentObject = selectedTranslations[parentKey];
        
        if (parentObject && typeof parentObject === 'object' && !Array.isArray(parentObject)) {
          const nestedValue = (parentObject as Record<string, any>)[childKey];
          translationValue = typeof nestedValue === 'string' ? nestedValue : String(key);
        }
      } else {
        const value = selectedTranslations[key];
        translationValue = typeof value === 'string' ? value : 
                           (value !== undefined ? String(value) : "");
      }
      
      // Fallback to default language if not found or not a string
      if (translationValue === "" && defaultTranslations) {
        if (key.includes('.')) {
          const [parentKey, childKey] = key.split('.');
          const parentObject = defaultTranslations[parentKey];
          
          if (parentObject && typeof parentObject === 'object' && !Array.isArray(parentObject)) {
            const nestedValue = (parentObject as Record<string, any>)[childKey];
            translationValue = typeof nestedValue === 'string' ? nestedValue : String(key);
          }
        } else {
          const value = defaultTranslations[key];
          translationValue = typeof value === 'string' ? value : 
                             (value !== undefined ? String(value) : key);
        }
        
        if (translationValue !== key) {
          if (!missingKeys.has(key)) {
            console.warn(`Missing translation for key "${key}" in language "${languageToUse}"`);
            setMissingKeys(prev => new Set([...prev, key]));
          }
        }
      }
      
      // If translation is missing in both languages, return the key
      if (translationValue === "") {
        if (!missingKeys.has(key)) {
          console.error(`Translation key not found: "${key}" in any language`);
          setMissingKeys(prev => new Set([...prev, key]));
        }
        return key;
      }
      
      // Enhanced replacement logic with proper interpolation support
      if (replacements && translationValue) {
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

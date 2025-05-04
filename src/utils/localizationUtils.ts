
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "@/translations/constants";
import translations from "@/translations";

/**
 * Check if current path is a classroom-related route
 * @param path The current path
 * @returns Boolean indicating if this is a classroom route
 */
export const isClassroomRoute = (path: string): boolean => {
  return path.includes("/teacher/classes") || 
         path.includes("/student/class");
};

/**
 * Helper function to safely get a string value from a potentially nested structure
 * @param obj The object to extract value from
 * @param path The path to the value, can be nested with dots
 * @returns The extracted string value
 */
export const getStringValueFromTranslation = (obj: any, path: string): string => {
  if (typeof obj === 'string') {
    return obj;
  }
  
  if (path.includes('.') && typeof obj === 'object' && obj !== null) {
    const [firstKey, ...rest] = path.split('.');
    const nestedObj = obj[firstKey];
    if (nestedObj) {
      return getStringValueFromTranslation(nestedObj, rest.join('.'));
    }
  }
  
  // Always return a string, even for complex objects
  return String(path);
};

/**
 * Get translation with fallback handling and replacement support
 * @param key Translation key
 * @param currentLanguage The current language
 * @param currentPath The current path
 * @param replacements Optional replacements for placeholders
 * @param missingKeys Set to track missing translation keys
 * @returns The translated string
 */
export const getTranslation = (
  key: string, 
  currentLanguage: string, 
  currentPath: string, 
  replacements?: Record<string, string>,
  missingKeys?: Set<string>
): string => {
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
        // Ensure we return a string
        translationValue = typeof nestedValue === 'string' ? nestedValue : String(key);
      }
    } else {
      const value = selectedTranslations[key];
      // Ensure we return a string
      translationValue = typeof value === 'string' ? value : 
                         (value !== undefined ? String(value) : "");
    }
    
    // Fallback to default language if not found or not a string
    if (translationValue === "" && defaultTranslations) {
      // Try to get from default translations
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        const parentObject = defaultTranslations[parentKey];
        
        if (parentObject && typeof parentObject === 'object' && !Array.isArray(parentObject)) {
          const nestedValue = (parentObject as Record<string, any>)[childKey];
          // Ensure we return a string
          translationValue = typeof nestedValue === 'string' ? nestedValue : String(key);
        }
      } else {
        const value = defaultTranslations[key];
        // Ensure we return a string
        translationValue = typeof value === 'string' ? value : 
                           (value !== undefined ? String(value) : key);
      }
      
      if (translationValue !== key && missingKeys) {
        // Only log each missing key once per session
        if (!missingKeys.has(key)) {
          console.warn(`Missing translation for key "${key}" in language "${languageToUse}"`);
          missingKeys.add(key);
        }
      }
    }
    
    // If translation is missing in both languages, return the key
    if (translationValue === "") {
      if (missingKeys && !missingKeys.has(key)) {
        console.error(`Translation key not found: "${key}" in any language`);
        missingKeys.add(key);
      }
      return key;
    }
    
    // Apply replacements if any
    if (replacements && translationValue) {
      let result = translationValue;
      Object.entries(replacements).forEach(([placeholder, replaceValue]) => {
        // Support {{placeholder}} format
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, replaceValue);
        
        // Also support {placeholder} format
        const simpleRegex = new RegExp(`{${placeholder}}`, 'g');
        result = result.replace(simpleRegex, replaceValue);
      });
      return result;
    }
    
    return translationValue;
  } catch (error) {
    console.error("Translation error:", error);
    return key; // Return the key as fallback
  }
};

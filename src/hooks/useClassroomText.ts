
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { useLocalization } from "@/context/LocalizationContext";
import translations from "@/translations";

// Helper function to get string value from potentially nested translation
const getStringTranslation = (obj: any, key: string): string => {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    // Try to parse the object for a possible string value
    if (Object.keys(obj).length > 0) {
      // Return the first string property as a fallback
      for (const k in obj) {
        if (typeof obj[k] === 'string') return obj[k];
      }
    }
    return String(key); // Return key as fallback
  }
  return String(key); // Return key as string fallback
};

// This hook ensures classroom pages always use English text
export const useClassroomText = () => {
  const { t } = useLocalization();
  
  // Declare the type of translatedText with all string properties
  type ClassroomTextType = Record<keyof typeof CLASSROOM_TEXT, string>;
  
  // Always use English translations for classroom text
  // This ensures UI consistency regardless of selected language
  const translatedText = Object.keys(CLASSROOM_TEXT).reduce<ClassroomTextType>((acc, key) => {
    // Get the English translation for this key
    const englishKey = key.toLowerCase();
    const englishTranslation = translations.english[englishKey];
    
    // First check if we have a direct UI element translation
    if (translations.english.myClass && key === "MY_CLASS") {
      acc[key as keyof typeof CLASSROOM_TEXT] = translations.english.myClass as string;
    }
    // Then check for JOIN_CLASS
    else if (translations.english.joinClass && key === "JOIN_CLASS") {
      acc[key as keyof typeof CLASSROOM_TEXT] = translations.english.joinClass as string;
    }
    // Then check for other common elements
    else if (translations.english[key] && typeof translations.english[key] === 'string') {
      acc[key as keyof typeof CLASSROOM_TEXT] = translations.english[key] as string;
    }
    // Use the English translation instead of the current language translation
    // Only use the value if it's a string
    else {
      acc[key as keyof typeof CLASSROOM_TEXT] = typeof englishTranslation === 'string' 
        ? englishTranslation 
        : getStringTranslation(englishTranslation, key);
      
      // If we still don't have a good translation, use hardcoded fallbacks
      if (acc[key as keyof typeof CLASSROOM_TEXT] === key) {
        const fallbacks: Record<string, string> = {
          MY_CLASS: "My Class",
          NO_CLASS_JOINED: "You haven't joined any class yet",
          JOIN_CLASS: "Join Class",
          ENTER_CLASS_CODE: "Enter Class Code",
          JOINING: "Joining...",
          ERROR: "Error",
          ERROR_JOINING: "Error joining class",
          SUCCESS: "Success",
          SUCCESS_JOINING: "Successfully joined class",
          ENTER_VALID_CODE: "Please enter a valid class code"
        };
        
        acc[key as keyof typeof CLASSROOM_TEXT] = fallbacks[key] || key;
      }
    }
    
    return acc;
  }, {} as ClassroomTextType);
  
  return translatedText;
};

export default useClassroomText;

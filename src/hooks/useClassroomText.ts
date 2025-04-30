
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { useLocalization } from "@/context/LocalizationContext";
import translations from "@/translations";

// Helper function to get string value from potentially nested translation
const getStringTranslation = (obj: any, key: string): string => {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
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
    
    // Use the English translation instead of the current language translation
    // Only use the value if it's a string
    acc[key as keyof typeof CLASSROOM_TEXT] = typeof englishTranslation === 'string' 
      ? englishTranslation 
      : getStringTranslation(englishTranslation, key);
    
    return acc;
  }, {} as ClassroomTextType);
  
  return translatedText;
};

export default useClassroomText;

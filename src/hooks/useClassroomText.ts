
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { useLocalization } from "@/context/LocalizationContext";
import translations from "@/translations";

// This hook ensures classroom pages always use English text
export const useClassroomText = () => {
  const { t } = useLocalization();
  
  // Always use English translations for classroom text
  // This ensures UI consistency regardless of selected language
  const translatedText: typeof CLASSROOM_TEXT = Object.keys(CLASSROOM_TEXT).reduce((acc, key) => {
    // Get the English translation for this key
    const englishTranslation = translations.english[key.toLowerCase()];
    
    // Use the English translation instead of the current language translation
    // Only use the value if it's a string
    acc[key as keyof typeof CLASSROOM_TEXT] = typeof englishTranslation === 'string' 
      ? englishTranslation 
      : key;
    return acc;
  }, {} as typeof CLASSROOM_TEXT);
  
  return translatedText;
};

export default useClassroomText;


import { CLASSROOM_TEXT } from "@/constants/classroomText";
import { useLocalization } from "@/context/LocalizationContext";

// This hook ensures proper translations for classroom pages
export const useClassroomText = () => {
  const { t } = useLocalization();
  
  // Map each CLASSROOM_TEXT key to its translation
  const translatedText: typeof CLASSROOM_TEXT = Object.keys(CLASSROOM_TEXT).reduce((acc, key) => {
    acc[key as keyof typeof CLASSROOM_TEXT] = t(key.toLowerCase());
    return acc;
  }, {} as typeof CLASSROOM_TEXT);
  
  return translatedText;
};

export default useClassroomText;

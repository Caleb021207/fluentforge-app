
import { CLASSROOM_TEXT } from "@/constants/classroomText";

// This hook ensures classroom pages remain in English regardless of selected language
export const useClassroomText = () => {
  // Always return English classroom text regardless of the current language
  return CLASSROOM_TEXT;
};

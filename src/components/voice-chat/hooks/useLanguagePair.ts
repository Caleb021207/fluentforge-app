
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Hook to determine the language pair for practice based on the user's language
 */
export const useLanguagePair = () => {
  const { currentLanguage } = useLocalization();

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return { practice: "Spanish", native: "English" };
    } else if (currentLanguage === "spanish") {
      return { practice: "English", native: "Spanish" };
    } else if (currentLanguage === "portuguese") {
      return { practice: "English", native: "Portuguese" };
    } else if (currentLanguage === "korean") {
      return { practice: "English", native: "Korean" };
    } else if (currentLanguage === "arabic") {
      return { practice: "English", native: "Arabic" };
    } else if (currentLanguage === "mandarin") {
      return { practice: "English", native: "Mandarin" };
    } else if (currentLanguage === "vietnamese") {
      return { practice: "English", native: "Vietnamese" };
    } else if (currentLanguage === "french") {
      return { practice: "English", native: "French" };
    } else if (currentLanguage === "japanese") {
      return { practice: "English", native: "Japanese" };
    } else if (currentLanguage === "russian") {
      return { practice: "English", native: "Russian" };
    }
    return { practice: "English", native: "Vietnamese" };
  };

  return { getLanguagePair, currentLanguage };
};


import { useLocalization } from "@/context/LocalizationContext";
import { navItemTranslations } from "./navTranslations";

export const useNavTranslation = () => {
  const { currentLanguage } = useLocalization();
  
  const getTranslatedLabel = (label: string) => {
    const translations = navItemTranslations[currentLanguage as keyof typeof navItemTranslations] || navItemTranslations.english;
    return translations[label as keyof typeof translations] || label;
  };

  return { getTranslatedLabel };
};

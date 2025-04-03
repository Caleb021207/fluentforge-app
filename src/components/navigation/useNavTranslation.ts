
import { useLocalization } from "@/context/LocalizationContext";
import { navItemTranslations } from "./navTranslations";
import { NavItem } from "./types";

export const useNavTranslation = () => {
  const { currentLanguage } = useLocalization();
  
  const getTranslatedLabel = (label: string) => {
    const translations = navItemTranslations[currentLanguage as keyof typeof navItemTranslations] || navItemTranslations.english;
    return translations[label as keyof typeof translations] || label;
  };

  const translateNavItem = (item: NavItem, language: string) => {
    const translations = navItemTranslations[language as keyof typeof navItemTranslations] || navItemTranslations.english;
    return translations[item.label as keyof typeof translations] || item.label;
  };

  return { getTranslatedLabel, translateNavItem };
};


import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

export const useTranslationHandler = () => {
  const { currentLanguage } = useLocalization();
  
  // Check if translation is needed based on the user's language settings
  const needsTranslation = () => {
    const { native, practice } = getLanguagePair(currentLanguage);
    
    // Languages that need translation functionality
    const needsTranslationLanguages = [
      "spanish", "portuguese", "korean", "arabic", 
      "mandarin", "vietnamese", "french", "japanese", 
      "russian", "ukrainian", "hindi", "indonesian", 
      "farsi", "urdu", "pashto", "swahili", "bengali", 
      "somali", "yoruba", "amharic", "haitian", "malayalam", 
      "igbo", "polish", "turkish", "romanian", "tagalog"
    ];
    
    return needsTranslationLanguages.includes(native) || 
           needsTranslationLanguages.includes(practice);
  };

  return {
    needsTranslation
  };
};

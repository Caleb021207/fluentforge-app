
import { useLocalization } from "@/context/LocalizationContext";
import { LanguageCode, getLanguageConfig } from "@/utils/languageConfig";

interface VoiceChatPair {
  practice: string;
  native: string;
}

export const useVoiceChatConfig = () => {
  const { currentLanguage } = useLocalization();
  
  const getLanguagePair = (): VoiceChatPair => {
    const config = getLanguageConfig(currentLanguage as LanguageCode);
    const targetConfig = getLanguageConfig(config.targetLanguage);
    
    return {
      practice: targetConfig.name,
      native: config.name
    };
  };
  
  const getSpeechRecognitionLocale = (): string => {
    const config = getLanguageConfig(currentLanguage as LanguageCode);
    return config.speechRecognitionLocale;
  };
  
  const getSpeechSynthesisLocale = (): string => {
    const config = getLanguageConfig(currentLanguage as LanguageCode);
    return config.speechSynthesisLocale;
  };
  
  const isAlwaysTranslated = (): boolean => {
    return ["japanese", "russian", "french"].includes(currentLanguage);
  };
  
  return {
    getLanguagePair,
    getSpeechRecognitionLocale,
    getSpeechSynthesisLocale,
    isAlwaysTranslated,
    currentLanguage
  };
};

export default useVoiceChatConfig;

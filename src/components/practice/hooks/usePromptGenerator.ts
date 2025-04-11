
import { useLocalization } from "@/context/LocalizationContext";

export const usePromptGenerator = () => {
  const { currentLanguage } = useLocalization();
  
  const generateLanguageLearningPrompt = (): string => {
    let prompt = "";
    
    if (currentLanguage === "english") {
      prompt = "¡Hola! Quiero practicar español contigo.";
    } else if (currentLanguage === "spanish") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "portuguese") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "korean") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "arabic") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "mandarin") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "vietnamese") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "french") {
      prompt = "Hello! I want to practice English with you!";
    } else if (currentLanguage === "japanese") {
      prompt = "こんにちは！英語を練習したいと思います！";
    } else if (currentLanguage === "russian") {
      prompt = "Здравствуйте! Я хочу попрактиковаться в английском с вами!";
    } else if (currentLanguage === "ukrainian") {
      prompt = "Привіт! Я хочу попрактикуватися в англійській з вами!";
    } else if (currentLanguage === "hindi") {
      prompt = "नमस्ते! मैं आपके साथ अंग्रेजी का अभ्यास करना चाहता हूँ!";
    } else if (currentLanguage === "indonesian") {
      prompt = "Halo! Saya ingin berlatih bahasa Inggris dengan Anda!";
    }

    return prompt;
  };

  return {
    generateLanguageLearningPrompt
  };
};

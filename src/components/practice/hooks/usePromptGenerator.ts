
import { useLocalization } from "@/context/LocalizationContext";
import { useState, useEffect } from "react";

export const usePromptGenerator = () => {
  const { currentLanguage } = useLocalization();
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the user's target language from localStorage
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    if (savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    }
  }, []);
  
  const generateLanguageLearningPrompt = (specificTargetLanguage?: string): string => {
    const effectiveTarget = specificTargetLanguage || targetLanguage;
    let prompt = "";
    
    // English speaker learning another language
    if (currentLanguage === "english" && effectiveTarget) {
      switch (effectiveTarget.toLowerCase()) {
        case "spanish":
          return "¡Hola! Quiero practicar español contigo.";
        case "french":
          return "Bonjour! Je veux pratiquer le français avec toi.";
        case "portuguese":
          return "Olá! Eu quero praticar português com você.";
        case "mandarin":
          return "你好！我想和你练习中文。";
        case "japanese":
          return "こんにちは！日本語を練習したいです。";
        case "korean":
          return "안녕하세요! 한국어를 연습하고 싶어요.";
        case "russian":
          return "Привет! Я хочу попрактиковаться в русском с тобой.";
        default:
          return "Hello! I want to practice " + effectiveTarget + " with you!";
      }
    } 
    // Non-English speakers learning English
    else {
      switch (currentLanguage) {
        case "spanish":
          return "Hello! I want to practice English with you!";
        case "portuguese":
          return "Hello! I want to practice English with you!";
        case "korean":
          return "Hello! I want to practice English with you!";
        case "arabic":
          return "Hello! I want to practice English with you!";
        case "mandarin":
          return "Hello! I want to practice English with you!";
        case "vietnamese":
          return "Hello! I want to practice English with you!";
        case "french":
          return "Hello! I want to practice English with you!";
        case "japanese":
          return "こんにちは！英語を練習したいと思います！";
        case "russian":
          return "Здравствуйте! Я хочу попрактиковаться в английском с вами!";
        case "ukrainian":
          return "Привіт! Я хочу попрактикуватися в англійській з вами!";
        case "hindi":
          return "नमस्ते! मैं आपके साथ अंग्रेजी का अभ्यास करना चाहता हूँ!";
        case "indonesian":
          return "Halo! Saya ingin berlatih bahasa Inggris dengan Anda!";
        default:
          return "Hello! I want to practice English with you!";
      }
    }

    return prompt;
  };

  return {
    generateLanguageLearningPrompt
  };
};

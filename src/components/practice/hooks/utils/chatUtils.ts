
import { supabase } from "@/integrations/supabase/client";

export const getInitialPromptForLanguage = (currentLanguage: string): string => {
  switch (currentLanguage) {
    case "english":
      return "¡Hola! Quiero practicar español contigo.";
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
    default:
      return "Hello! I want to practice with you!";
  }
};

export const getPlaceholderForLanguage = (currentLanguage: string): string => {
  switch (currentLanguage) {
    case "english":
      return "Type your message in English or Spanish...";
    case "japanese":
      return "英語または日本語でメッセージを入力してください...";
    case "russian":
      return "Введите сообщение на английском или русском...";
    case "french":
      return "Tapez votre message en anglais ou français...";
    case "hindi":
      return "अंग्रेजी या हिंदी में अपना संदेश टाइप करें...";
    default:
      return "Type your message...";
  }
};

export const sendChatMessage = async (
  message: string,
  userLanguage: string,
  requestTranslation: boolean = true
) => {
  return await supabase.functions.invoke('chat-with-tutor', {
    body: { 
      message: message,
      userLanguage: userLanguage,
      requestTranslation: requestTranslation 
    }
  });
};

export const requestTranslation = async (
  content: string,
  targetLanguage: string
) => {
  return await supabase.functions.invoke('chat-with-tutor', {
    body: {
      message: content,
      userLanguage: targetLanguage,
      requestType: 'translation'
    }
  });
};

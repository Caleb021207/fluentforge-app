
import { useLocalization } from "@/context/LocalizationContext";

export const getPlaceholderTextForLanguage = (language: string): string => {
  if (language === "spanish") {
    return "Escribe tu mensaje en español o inglés...";
  } else if (language === "portuguese") {
    return "Digite sua mensagem em português ou inglês...";
  } else if (language === "korean") {
    return "한국어 또는 영어로 메시지를 입력하세요...";
  } else if (language === "arabic") {
    return "اكتب رسالتك بالعربية أو الإنجليزية...";
  } else if (language === "mandarin") {
    return "用中文或英语输入您的消息...";
  } else if (language === "vietnamese") {
    return "Nhập tin nhắn của bạn bằng tiếng Việt hoặc tiếng Anh...";
  } else {
    return "Type your message in English or Spanish...";
  }
};

export const getLanguageLearningPrompt = (language: string): string => {
  if (language === "english") {
    return "¡Hola! Quiero practicar español contigo.";
  } else if (language === "spanish") {
    return "Hello! I want to practice English with you!";
  } else if (language === "portuguese") {
    return "Hello! I want to practice English with you!";
  } else if (language === "korean") {
    return "Hello! I want to practice English with you!";
  } else if (language === "arabic") {
    return "Hello! I want to practice English with you!";
  } else if (language === "mandarin") {
    return "Hello! I want to practice English with you!";
  } else if (language === "vietnamese") {
    return "Hello! I want to practice English with you!";
  }
  
  return "";
};


import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

export type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export const useVoiceChatMessages = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const { currentLanguage } = useLocalization();
  
  const clearMessages = () => {
    setMessages([]);
  };
  
  const addInitialMessage = () => {
    const { practice, native } = getLanguagePair(currentLanguage);
    
    let initialContent = "";
    
    if (currentLanguage === "english") {
      initialContent = `Hello, I'd like to practice ${practice} with you.`;
    } else if (currentLanguage === "mandarin") {
      initialContent = "你好，我想和你练习英语。";
    } else if (currentLanguage === "indonesian") {
      initialContent = "Halo, saya ingin berlatih Bahasa Inggris dengan Anda.";
    } else if (currentLanguage === "turkish") {
      initialContent = "Merhaba, sizinle İngilizce pratik yapmak istiyorum.";
    } else if (currentLanguage === "polish") {
      initialContent = "Cześć, chciałbym poćwiczyć z tobą język angielski.";
    } else if (currentLanguage === "hindi") {
      initialContent = "नमस्ते, मैं आपके साथ अंग्रेजी का अभ्यास करना चाहता हूँ।";
    } else if (currentLanguage === "ukrainian") {
      initialContent = "Привіт, я хотів би практикувати англійську з вами.";
    } else if (currentLanguage === "japanese") {
      initialContent = "こんにちは、あなたと英語を練習したいです。";
    } else if (currentLanguage === "russian") {
      initialContent = "Здравствуйте, я хотел бы попрактиковаться в английском с вами.";
    } else if (currentLanguage === "vietnamese") {
      initialContent = "Xin chào, tôi muốn thực hành tiếng Anh với bạn.";
    } else if (currentLanguage === "korean") {
      initialContent = "안녕하세요, 저는 당신과 영어를 연습하고 싶습니다.";
    } else if (currentLanguage === "arabic") {
      initialContent = "مرحبًا، أود أن أمارس اللغة الإنجليزية معك.";
    } else if (currentLanguage === "portuguese") {
      initialContent = "Olá, eu gostaria de praticar inglês com você.";
    } else if (currentLanguage === "french") {
      initialContent = "Bonjour, j'aimerais pratiquer l'anglais avec vous.";
    } else if (currentLanguage === "spanish") {
      initialContent = "Hola, me gustaría practicar inglés contigo.";
    } else {
      initialContent = `Hello, I'd like to practice ${practice} with you.`;
    }
    
    const initialUserMessage: VoiceMessage = {
      role: "user",
      content: initialContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, initialUserMessage]);
    return initialUserMessage;
  };
  
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: VoiceMessage = {
      role,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };
  
  return {
    messages,
    clearMessages,
    addInitialMessage,
    addMessage
  };
};

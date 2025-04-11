
import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

export type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  translation?: string;
};

export const useVoiceChatMessages = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const { currentLanguage } = useLocalization();
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the target language from localStorage
    const storedTargetLanguage = localStorage.getItem("targetLanguage");
    setTargetLanguage(storedTargetLanguage);
  }, []);
  
  const clearMessages = () => {
    setMessages([]);
  };
  
  const addInitialMessage = () => {
    const { practice, native } = getLanguagePair(currentLanguage, targetLanguage || undefined);
    
    let initialContent = "";
    let initialTranslation = "";
    
    if (currentLanguage === "english") {
      if (targetLanguage === "french") {
        initialContent = "Bonjour ! Je suis là pour vous aider à pratiquer le français. Qu'aimeriez-vous aborder aujourd'hui ?";
        initialTranslation = "Hello! I'm here to help you practice French. What would you like to talk about today?";
      } else if (targetLanguage === "spanish") {
        initialContent = "¡Hola! Estoy aquí para ayudarte a practicar español. ¿Qué te gustaría conversar hoy?";
        initialTranslation = "Hello! I'm here to help you practice Spanish. What would you like to talk about today?";
      } else {
        initialContent = `Hello, I'd like to practice ${practice} with you.`;
      }
    } else if (currentLanguage === "mandarin") {
      initialContent = "你好，我想和你练习英语。";
      initialTranslation = "Hello, I'd like to practice English with you.";
    } else {
      initialContent = `Hello, I'd like to practice ${practice} with you.`;
    }
    
    const initialUserMessage: VoiceMessage = {
      role: "assistant",
      content: initialContent,
      timestamp: new Date(),
      translation: initialTranslation
    };
    
    setMessages(prev => [...prev, initialUserMessage]);
    return initialUserMessage;
  };
  
  const addMessage = (role: 'user' | 'assistant', content: string, translation?: string) => {
    const newMessage: VoiceMessage = {
      role,
      content,
      timestamp: new Date(),
      translation
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

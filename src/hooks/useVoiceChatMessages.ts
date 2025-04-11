
import { useState, useEffect } from "react";
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
    
    if (currentLanguage === "english") {
      initialContent = `Hello, I'd like to practice ${practice} with you.`;
    } else if (currentLanguage === "mandarin") {
      initialContent = "你好，我想和你练习英语。";
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

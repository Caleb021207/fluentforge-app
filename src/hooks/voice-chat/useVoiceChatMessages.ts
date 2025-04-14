
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
    
    // Customize initial content based on user's interface language
    switch (currentLanguage) {
      case "english":
        initialContent = `Hello, I'd like to practice ${practice} with you.`;
        break;
      case "spanish":
        initialContent = `Hola, me gustaría practicar ${practice} contigo.`;
        break;
      case "french":
        initialContent = `Bonjour, j'aimerais pratiquer ${practice} avec vous.`;
        break;
      case "russian":
        initialContent = `Здравствуйте, я хотел бы попрактиковаться в ${practice} с вами.`;
        break;
      default:
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

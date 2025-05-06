
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
    const { practice } = getLanguagePair(currentLanguage);
    
    let initialContent = "";
    
    if (currentLanguage === "english") {
      initialContent = `Hello, I'd like to practice ${practice} with you.`;
    } else if (currentLanguage === "mandarin") {
      initialContent = "你好，我想和你练习英语。";
    } else if (currentLanguage === "cantonese") {
      initialContent = "你好，我想同你練習英語。";
    } else if (currentLanguage === "urdu") {
      initialContent = "السلام علیکم، میں آپ کے ساتھ انگریزی کی مشق کرنا چاہتا ہوں۔";
    } else if (currentLanguage === "pashto") {
      initialContent = "سلام، زه غواړم چې ستاسو سره انګلیسي تمرین وکړم.";
    } else if (currentLanguage === "swahili") {
      initialContent = "Habari, ningependa kufanya mazoezi ya Kiingereza nawe.";
    } else if (currentLanguage === "tagalog") {
      initialContent = "Kamusta, gusto kong magsanay ng Ingles kasama ka.";
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

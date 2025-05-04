import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalization } from "@/hooks/useLocalization";
import { useChatApi } from "./useChatApi";
import { useTranslationHandler } from "./useTranslationHandler";
import type { ChatMessage } from "@/types/chat";

export const useChatMessages = () => {
  const { t, currentLanguage } = useLocalization();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { sendMessage } = useChatApi();
  const { needsTranslation } = useTranslationHandler();
  
  // Get placeholder text for the chat input
  const getPlaceholderText = useCallback(() => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    return t("chatPlaceholder", { targetLanguage: targetLanguage === "english" ? "anglè" : targetLanguage });
  }, [t]);
  
  // Send a language learning prompt to start the conversation
  const sendLanguageLearningPrompt = useCallback(async () => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    const prompt = t("practicePrompt", { targetLanguage: targetLanguage === "english" ? "anglè" : targetLanguage });
    
    try {
      const assistantMessage = await sendMessage(prompt);
      setMessages(prev => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: typeof assistantMessage === 'string' ? assistantMessage : assistantMessage.content }
      ]);
    } catch (error) {
      console.error("Error sending language learning prompt:", error);
    }
  }, [t, sendMessage]);
  
  // Handle chat form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    try {
      const assistantMessage = await sendMessage(userMessage);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: typeof assistantMessage === 'string' ? assistantMessage : assistantMessage.content 
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: t("errorSendingMessage") 
      }]);
    }
  }, [input, sendMessage, t]);
  
  return {
    messages,
    input,
    setInput,
    isLoading: false,
    sendLanguageLearningPrompt,
    handleSubmit,
    getPlaceholderText
  };
};


import { useState, useCallback } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatApi } from "./useChatApi";
import { useTranslationHandler } from "./useTranslationHandler";
import { ChatMessage } from "@/types/chat";

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
        { role: "user" as const, content: prompt },
        // Fix: Make sure assistantMessage is properly handled as a ChatMessage object
        ...(assistantMessage ? [{ 
          role: "assistant" as const, 
          content: assistantMessage.content, 
          translation: assistantMessage.translation 
        }] : [])
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
    setMessages(prev => [...prev, { role: "user" as const, content: userMessage }]);
    
    try {
      const assistantMessage = await sendMessage(userMessage);
      // Fix: Make sure assistantMessage is properly handled as a ChatMessage object
      if (assistantMessage) {
        setMessages(prev => [...prev, { 
          role: "assistant" as const, 
          content: assistantMessage.content,
          translation: assistantMessage.translation 
        }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        role: "assistant" as const, 
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

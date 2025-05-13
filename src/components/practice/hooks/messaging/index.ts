
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { TranslationType, extractStringFromTranslation } from "../translation";
import { useChatService } from "./useChatService";
import { useTranslationProcessor } from "./useTranslationProcessor";
import { useErrorHandler } from "./useErrorHandler";
import { ChatResponse } from "./types";
import { Message } from "@/types/chat";

export type { ChatResponse };

export const useChatMessaging = () => {
  const { currentLanguage } = useLocalization();
  const { isLoading, setIsLoading, sendChatRequest } = useChatService();
  const { processTranslation } = useTranslationProcessor();
  const { hasError, setHasError, handleError, clearError } = useErrorHandler();
  
  // Added messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [hints, setHints] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendChatMessage = async (message: string, correctGrammar: boolean = false) => {
    if (!message || message.trim() === "") {
      return null;
    }
    
    setIsLoading(true);
    setHasError(false);

    try {
      // Get the targetLanguage from localStorage 
      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      
      // Send the request with the correctGrammar option
      const response = await sendChatRequest(message, currentLanguage, targetLanguage, correctGrammar);
      
      if (!response) {
        return null;
      }
      
      // Process the translation
      const processedTranslation = await processTranslation(
        response.translation,
        response.content,
        currentLanguage
      );
      
      // Return the data with processed translation
      return {
        content: response.content,
        translation: processedTranslation
      };
      
    } catch (error) {
      handleError(error);
      setError(error instanceof Error ? error.message : String(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = async (message: string) => {
    if (hasError) {
      clearError();
      return await sendChatMessage(message);
    }
    return null;
  };

  // Added new methods to match what Practice.tsx expects
  const sendMessage = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: message
    };
    
    setMessages([...messages, userMessage]);
    
    // Send to API
    const response = await sendChatMessage(message);
    
    if (response) {
      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        translation: response.translation
      };
      
      setMessages([...messages, userMessage, assistantMessage]);
    }
  };
  
  const startNewChat = async () => {
    setMessages([]);
    setError(null);
    
    // Generate a default welcome message
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    
    try {
      const response = await sendChatRequest(
        `Start a new chat and greet the user in ${targetLanguage}`, 
        currentLanguage, 
        targetLanguage, 
        false
      );
      
      if (response) {
        const processedTranslation = await processTranslation(
          response.translation,
          response.content,
          currentLanguage
        );
        
        setMessages([{
          role: "assistant",
          content: response.content,
          translation: processedTranslation
        }]);
      }
    } catch (error) {
      handleError(error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return {
    isLoading,
    hasError,
    setIsLoading,
    sendChatMessage,
    retryLastMessage,
    extractStringFromTranslation,
    // Add additional exports
    messages,
    isGenerating: isLoading,
    sendMessage,
    startNewChat,
    error,
    hints
  };
};

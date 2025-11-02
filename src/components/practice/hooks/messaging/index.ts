
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { TranslationType, extractStringFromTranslation } from "../translation";
import { useChatService } from "./useChatService";
import { useTranslationProcessor } from "./useTranslationProcessor";
import { useErrorHandler } from "./useErrorHandler";
import { ChatResponse } from "./types";

export type { ChatResponse };

export const useChatMessaging = () => {
  const { currentLanguage } = useLocalization();
  const { isLoading, setIsLoading, sendChatRequest } = useChatService();
  const { processTranslation } = useTranslationProcessor();
  const { hasError, setHasError, handleError, clearError } = useErrorHandler();

  const sendChatMessage = async (message: string, correctGrammar: boolean = false, conversationHistory: {role: 'user' | 'assistant' | 'system'; content: string}[] = [], conversationLevel: string = "intermediate") => {
    if (!message || message.trim() === "") {
      return null;
    }
    
    setIsLoading(true);
    setHasError(false);

    try {
      // Get the targetLanguage from localStorage 
      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      
      // Send the request with the correctGrammar option, conversation history, and level
      const response = await sendChatRequest(message, currentLanguage, targetLanguage, correctGrammar, conversationHistory, conversationLevel);
      
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
        translation: processedTranslation,
        usingFallbackModel: response.usingFallbackModel
      };
      
    } catch (error) {
      handleError(error);
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

  return {
    isLoading,
    hasError,
    setIsLoading,
    sendChatMessage,
    retryLastMessage,
    extractStringFromTranslation
  };
};

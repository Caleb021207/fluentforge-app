
import { useMessageHandlers } from "./useMessageHandlers";
import { useTranslation } from "./useTranslation";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

/**
 * Main hook for chat functionality combining all sub-hooks
 */
export const useChatMessages = () => {
  const { 
    messages, 
    setMessages, 
    input, 
    setInput, 
    isLoading, 
    setIsLoading,
    sendLanguageLearningPrompt: baseSendLanguageLearningPrompt,
    handleSendPrompt,
    handleSubmit: baseHandleSubmit
  } = useMessageHandlers();
  
  const { getPlaceholderText, currentLanguage } = useTranslation();
  
  // Wrap handlers to automatically pass the current language
  const sendLanguageLearningPrompt = () => {
    baseSendLanguageLearningPrompt(currentLanguage);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    baseHandleSubmit(e, currentLanguage);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    sendLanguageLearningPrompt,
    handleSendPrompt,
    handleSubmit,
    getPlaceholderText,
    currentLanguage
  };
};

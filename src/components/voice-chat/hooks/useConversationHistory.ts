
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
}

/**
 * Hook for managing conversation history
 */
export const useConversationHistory = () => {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  const addUserMessage = (content: string) => {
    const userMessage: ConversationMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addAssistantMessage = (content: string, translation: string) => {
    const aiMessage: ConversationMessage = {
      role: 'assistant',
      content,
      translation,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, aiMessage]);
    
    const updatedApiHistory = [
      ...apiConversationHistory,
      { role: 'user', content: conversationHistory[conversationHistory.length - 1]?.content || "" },
      { role: 'assistant', content: content + (translation ? "\nTranslation: " + translation : "") }
    ];
    
    setApiConversationHistory(updatedApiHistory);
    
    return aiMessage;
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  return {
    conversationHistory,
    apiConversationHistory,
    conversationEndRef,
    addUserMessage,
    addAssistantMessage,
    clearConversation,
    setApiConversationHistory
  };
};

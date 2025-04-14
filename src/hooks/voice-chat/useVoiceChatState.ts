
import { useState } from 'react';
import type { ConversationMessage } from '@/types/chat';

export const useVoiceChatState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);

  return {
    isLoading,
    setIsLoading,
    isSpeaking,
    setIsSpeaking,
    gptResponse,
    setGptResponse,
    translation,
    setTranslation,
    conversationHistory,
    setConversationHistory,
    apiConversationHistory,
    setApiConversationHistory,
  };
};


import { useState, useCallback, useEffect, useRef } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatMessaging } from "./messaging";
import { useSessionManagement } from "./useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TranslationType } from "./translation/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
}

interface ChallengeChatOptions {
  cefrLevel: string;
  topicPrompt: string;
  submissionId?: string;
  initialMessages?: Message[] | null;
}

/**
 * useChallengeChat - A specialized hook for Challenge Mode that:
 * 1. Uses the EXACT CEFR level from the assignment (no overrides from student proficiency)
 * 2. Generates an AI opening message based on the assignment topic
 * 3. Keeps conversation focused on the assignment topic
 * 4. Supports progress persistence
 */
export const useChallengeChat = ({ cefrLevel, topicPrompt, submissionId, initialMessages }: ChallengeChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: 'user' | 'assistant' | 'system'; content: string}[]>([]);
  const [isGeneratingOpening, setIsGeneratingOpening] = useState(false);
  const { t, currentLanguage } = useLocalization();
  const { isLoading, hasError, sendChatMessage, extractStringFromTranslation } = useChatMessaging();
  const { startSession, sessionId } = useSessionManagement();
  const { toast } = useToast();
  
  const currentSessionIdRef = useRef<string | null>(null);
  const hasGeneratedOpening = useRef(false);
  const hasRestoredMessages = useRef(false);

  // Normalize CEFR level
  const normalizedCefrLevel = cefrLevel.toUpperCase().split('/')[0].replace('+', '').trim();
  
  console.log(`[useChallengeChat] Initialized with CEFR=${normalizedCefrLevel}, topic="${topicPrompt.substring(0, 50)}..."`);

  // Restore messages from initial state (from database)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && !hasRestoredMessages.current) {
      hasRestoredMessages.current = true;
      hasGeneratedOpening.current = true;
      setMessages(initialMessages);
      
      const history = initialMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
      setApiConversationHistory(history);
      
      console.log(`[useChallengeChat] Restored ${initialMessages.length} messages from database`);
    }
  }, [initialMessages]);

  // Generate an AI opening message when the chat starts
  const generateOpeningMessage = useCallback(async () => {
    if (hasGeneratedOpening.current || !topicPrompt || hasRestoredMessages.current) return;
    hasGeneratedOpening.current = true;
    
    setIsGeneratingOpening(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('[useChallengeChat] No auth session for opening message');
        return;
      }

      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      const userLanguage = localStorage.getItem("nativeLanguage") || "english";

      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          requestType: 'opening_message',
          userLanguage,
          targetLanguage,
          cefrLevel: normalizedCefrLevel,
          assignmentTopic: topicPrompt
        }
      });

      if (error) {
        console.error('[useChallengeChat] Error generating opening message:', error);
        return;
      }

      if (data?.content) {
        const openingMessage: Message = {
          role: "assistant",
          content: data.content,
          translation: data.translation || undefined
        };
        
        setMessages([openingMessage]);
        setApiConversationHistory([
          { role: 'assistant', content: data.content }
        ]);
      }
    } catch (error) {
      console.error('[useChallengeChat] Failed to generate opening message:', error);
    } finally {
      setIsGeneratingOpening(false);
    }
  }, [topicPrompt, normalizedCefrLevel]);

  // Initialize session and generate opening message on mount
  useEffect(() => {
    const initSession = async () => {
      const newSessionId = await startSession('challenge_mode');
      currentSessionIdRef.current = newSessionId;
      
      if (!hasRestoredMessages.current) {
        await generateOpeningMessage();
      }
    };
    initSession();
  }, [generateOpeningMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    const response = await sendChatMessageForChallenge(input);
    
    if (response) {
      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        translation: response.translation
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      const updatedHistory = [
        ...apiConversationHistory,
        { role: 'user' as const, content: input },
        { role: 'assistant' as const, content: response.content }
      ];
      setApiConversationHistory(updatedHistory);
    }
  };
  
  const sendChatMessageForChallenge = async (message: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('[useChallengeChat] No auth session');
        return null;
      }

      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      const userLanguage = localStorage.getItem("nativeLanguage") || "english";

      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message,
          userLanguage,
          targetLanguage,
          conversationHistory: apiConversationHistory,
          conversationLevel: normalizedCefrLevel.toLowerCase(),
          cefrLevel: normalizedCefrLevel,
          assignmentTopic: topicPrompt,
          correctGrammar: false
        }
      });

      if (error) {
        console.error('[useChallengeChat] Chat error:', error);
        return null;
      }

      return {
        content: data.content || '',
        translation: data.translation || ''
      };
    } catch (error) {
      console.error("[useChallengeChat] Error sending message:", error);
      return null;
    }
  };
  
  const getPlaceholderText = useCallback(() => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    return t("chatPlaceholder", { targetLanguage }) || `Type your message to practice ${targetLanguage}...`;
  }, [t]);

  const getAssignmentContext = useCallback(() => ({
    cefrLevel: normalizedCefrLevel,
    topicPrompt
  }), [normalizedCefrLevel, topicPrompt]);
  
  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading: isLoading || isGeneratingOpening,
    hasError,
    handleSubmit,
    getPlaceholderText,
    cefrLevel: normalizedCefrLevel,
    topicPrompt,
    getAssignmentContext
  };
};

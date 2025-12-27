
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
  cefrLevel: string;  // MANDATORY - the assignment's CEFR level (A1, A2, B1, etc.)
  topicPrompt: string; // The assignment's topic/task description
}

/**
 * useChallengeChat - A specialized hook for Challenge Mode that:
 * 1. Uses the EXACT CEFR level from the assignment (no overrides from student proficiency)
 * 2. Passes the assignment topic for contextual hints
 * 3. Disables session storage persistence (assignments are one-time)
 */
export const useChallengeChat = ({ cefrLevel, topicPrompt }: ChallengeChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: 'user' | 'assistant' | 'system'; content: string}[]>([]);
  const { t, currentLanguage } = useLocalization();
  const { isLoading, hasError, sendChatMessage, extractStringFromTranslation } = useChatMessaging();
  const { startSession, sessionId } = useSessionManagement();
  const { toast } = useToast();
  
  const currentSessionIdRef = useRef<string | null>(null);

  // Normalize CEFR level (e.g., "A2/B1" -> "A2", "B1+" -> "B1")
  const normalizedCefrLevel = cefrLevel.toUpperCase().split('/')[0].replace('+', '').trim();
  
  console.log(`[useChallengeChat] Initialized with CEFR=${normalizedCefrLevel}, topic="${topicPrompt.substring(0, 50)}..."`);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const newSessionId = await startSession('challenge_mode');
      currentSessionIdRef.current = newSessionId;
    };
    initSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Send message to API with MANDATORY CEFR level - NO OVERRIDE
    const response = await sendChatMessageForChallenge(input);
    
    if (response) {
      // Add assistant response to the chat
      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        translation: response.translation
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update API conversation history to maintain context
      const updatedHistory = [
        ...apiConversationHistory,
        { role: 'user' as const, content: input },
        { role: 'assistant' as const, content: response.content }
      ];
      setApiConversationHistory(updatedHistory);
    }
  };
  
  // Send function that ALWAYS uses the assignment's CEFR level
  const sendChatMessageForChallenge = async (message: string) => {
    try {
      // CRITICAL: Always pass the assignment's CEFR level, never let it be overridden
      console.log(`[useChallengeChat] Sending message with CEFR=${normalizedCefrLevel}`);
      return await sendChatMessage(
        message, 
        false, // Don't correct grammar in challenge mode
        apiConversationHistory, 
        normalizedCefrLevel.toLowerCase(), // conversationLevel
        normalizedCefrLevel // cefrLevel - this takes priority
      );
    } catch (error) {
      console.error("[useChallengeChat] Error sending message:", error);
      return null;
    }
  };
  
  const getPlaceholderText = useCallback(() => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    return t("chatPlaceholder", { targetLanguage }) || `Type your message to practice ${targetLanguage}...`;
  }, [t]);

  // Expose the assignment context for hints
  const getAssignmentContext = useCallback(() => ({
    cefrLevel: normalizedCefrLevel,
    topicPrompt
  }), [normalizedCefrLevel, topicPrompt]);
  
  return {
    messages,
    input,
    setInput,
    isLoading,
    hasError,
    handleSubmit,
    getPlaceholderText,
    // Challenge-specific exports
    cefrLevel: normalizedCefrLevel,
    topicPrompt,
    getAssignmentContext
  };
};

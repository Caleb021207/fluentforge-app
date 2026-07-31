
import { useState, useCallback, useEffect, useRef } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatMessaging } from "./useChatMessaging";
import { usePromptGenerator } from "./usePromptGenerator";
import { useSessionManagement } from "./useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useStudentProficiency } from "@/hooks/useStudentProficiency";
import { supabase } from "@/integrations/supabase/client";
import type { TranslationType } from "./useTranslationHandler";
import type { ChatMessage } from "@/types/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
}

/** Structured end-of-conversation feedback from chat-with-tutor debrief mode. */
export interface DebriefFeedback {
  corrections: { you_said: string; better: string; why: string }[];
  strength: string;
  goal_met: boolean | null;
}

export const useChatMessages = (conversationLevel: string = "intermediate", scenarioId: string | null = null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [correctGrammar, setCorrectGrammar] = useState<boolean>(false);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: 'user' | 'assistant' | 'system'; content: string}[]>([]);
  const { t, currentLanguage } = useLocalization();
  const { isLoading, hasError, sendChatMessage, retryLastMessage, extractStringFromTranslation } = useChatMessaging();
  const { generateLanguageLearningPrompt } = usePromptGenerator();
  const { messageCount, setMessageCount, startSession, sessionId } = useSessionManagement();
  const { toast } = useToast();
  const { awardXP } = useGamification();
  const { checkCanSendTextMessage, trackTextMessage, usageLimits, refreshLimits } = useUsageLimits();
  const { proficiency } = useStudentProficiency(conversationLevel);
  
  const currentSessionIdRef = useRef<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const newSessionId = await startSession('text_practice');
      currentSessionIdRef.current = newSessionId;
    };
    initSession();
  }, []);

  // Load saved messages from session storage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chatMessages');
    const savedApiHistory = sessionStorage.getItem('apiConversationHistory');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
    
    if (savedApiHistory) {
      try {
        const parsedApiHistory = JSON.parse(savedApiHistory);
        setApiConversationHistory(parsedApiHistory);
      } catch (e) {
        console.error('Failed to parse saved API history:', e);
      }
    }
    
    // Load grammar correction preference
    const savedCorrectGrammar = localStorage.getItem('correctGrammar');
    if (savedCorrectGrammar) {
      setCorrectGrammar(savedCorrectGrammar === 'true');
    }
  }, []);

  // Save messages to session storage when they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save API conversation history when it changes
  useEffect(() => {
    if (apiConversationHistory.length > 0) {
      sessionStorage.setItem('apiConversationHistory', JSON.stringify(apiConversationHistory));
    }
  }, [apiConversationHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Check text practice token limits before sending
    const limitCheck = await checkCanSendTextMessage();
    if (!limitCheck.allowed) {
      toast({
        title: "Text Practice Limit Reached",
        description: `You've used all ${limitCheck.messagesLimit || 0} text practice messages this month.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Send message to API with conversation history for context
    const response = await sendChatMessageWithCorrection(input);
    
    if (response) {
      // Show toast if using fallback model
      if (response.usingFallbackModel) {
        toast({
          title: "Using Economy Model",
          description: "You've reached your monthly text practice token limit. Now using GPT-3.5 for cost-effective practice.",
        });
      }
      
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
      
      // Track text practice usage - CRITICAL for limit enforcement
      await trackTextMessage();
      
      // Refresh usage limits to get updated counts
      await refreshLimits();
      
      // Award XP for sending a text message
      console.log('📝 Awarding XP for text message:', { 
        messageLength: input.length,
        grammarAccuracy: correctGrammar ? 100 : undefined 
      });
      const xpResult = await awardXP('text_message', {
        messageLength: input.length,
        grammarAccuracy: correctGrammar ? 100 : undefined
      });
      return xpResult;
    }
  };
  
  // Modified send function that includes grammar correction preference, conversation history, and proficiency
  const sendChatMessageWithCorrection = async (message: string) => {
    try {
      const effectiveCefrLevel = proficiency?.cefrLevel || null;
      return await sendChatMessage(message, correctGrammar, apiConversationHistory, conversationLevel, effectiveCefrLevel, scenarioId);
    } catch (error) {
      console.error("Error sending message with correction flag:", error);
      return null;
    }
  };
  
  // End-of-conversation debrief: ask the tutor for structured feedback on the
  // whole transcript. Throws on failure so the caller can show an error state.
  const requestDebrief = useCallback(async (): Promise<DebriefFeedback> => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "english";
    const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
      body: {
        mode: 'debrief',
        messages: apiConversationHistory,
        scenario_id: scenarioId,
        userLanguage: currentLanguage,
        targetLanguage,
      }
    });

    if (error) throw error;
    if (!data || data.error) throw new Error(data?.error || "Empty debrief response");

    return {
      corrections: Array.isArray(data.corrections) ? data.corrections : [],
      strength: typeof data.strength === 'string' ? data.strength : "",
      goal_met: typeof data.goal_met === 'boolean' ? data.goal_met : null,
    };
  }, [apiConversationHistory, scenarioId, currentLanguage]);

  const toggleGrammarCorrection = () => {
    const newValue = !correctGrammar;
    setCorrectGrammar(newValue);
    localStorage.setItem('correctGrammar', String(newValue));
    
    toast({
      title: newValue ? t("grammarCorrectionEnabled") : t("grammarCorrectionDisabled"),
      description: newValue ? t("tutor.willCorrectGrammar") : t("tutor.wontCorrectGrammar"),
      variant: "default",
    });
  };
  
  const sendLanguageLearningPrompt = async () => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    const prompt = generateLanguageLearningPrompt();
    
    setInput(prompt);
    
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
  };
  
  const clearConversation = async () => {
    setMessages([]);
    setApiConversationHistory([]);
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('apiConversationHistory');
    
    setMessageCount({ inputs: 0, outputs: 0 });
    
    // Start new session
    const newSessionId = await startSession('text_practice');
    currentSessionIdRef.current = newSessionId;
  };
  
  const getPlaceholderText = useCallback(() => {
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    return t("chatPlaceholder", { targetLanguage }) || `Type your message to practice ${targetLanguage}...`;
  }, [t]);
  
  return {
    messages,
    input,
    setInput,
    isLoading,
    hasError,
    handleSubmit,
    sendLanguageLearningPrompt,
    clearConversation,
    getPlaceholderText,
    correctGrammar,
    toggleGrammarCorrection,
    requestDebrief
  };
};

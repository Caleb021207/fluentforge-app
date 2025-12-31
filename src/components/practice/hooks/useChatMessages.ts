
import { useState, useCallback, useEffect, useRef } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatMessaging } from "./useChatMessaging";
import { usePromptGenerator } from "./usePromptGenerator";
import { useSessionManagement } from "./useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useConversationProfiling } from "@/hooks/useConversationProfiling";
import { useStudentProficiency } from "@/hooks/useStudentProficiency";
import { supabase } from "@/integrations/supabase/client";
import type { TranslationType } from "./useTranslationHandler";
import type { ChatMessage } from "@/types/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
}

export const useChatMessages = (conversationLevel: string = "intermediate") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [correctGrammar, setCorrectGrammar] = useState<boolean>(false);
  // Add conversation history for API context (similar to voice chat)
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: 'user' | 'assistant' | 'system'; content: string}[]>([]);
  const { t, currentLanguage } = useLocalization();
  const { isLoading, hasError, sendChatMessage, retryLastMessage, extractStringFromTranslation } = useChatMessaging();
  const { generateLanguageLearningPrompt } = usePromptGenerator();
  const { messageCount, setMessageCount, startSession, sessionId } = useSessionManagement();
  const { toast } = useToast();
  const { awardXP } = useGamification();
  const { checkCanSendTextMessage, trackTextMessage, usageLimits, refreshLimits } = useUsageLimits();
  const { triggerProfiling } = useConversationProfiling();
  const { proficiency } = useStudentProficiency(conversationLevel);
  
  // Track if profiling has been triggered for current session
  const profilingTriggeredRef = useRef(false);
  const currentSessionIdRef = useRef<string | null>(null);
  const userMessageCountRef = useRef(0);
  const PROFILING_INTERVAL = 6; // Trigger profiling every 6 user messages

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

  // Trigger profiling - can be called multiple times during a session
  const triggerProfilingNow = useCallback(async (force: boolean = false) => {
    // Only skip if already triggered AND not forcing
    if (profilingTriggeredRef.current && !force) {
      console.log('[Profiling] Skipping - already triggered this session');
      return;
    }
    
    if (messages.length < 4) {
      console.log('[Profiling] Skipping - not enough messages:', messages.length);
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[Profiling] Skipping - no user');
        return;
      }
      
      console.log('[Profiling] 🚀 Triggering profiling for user:', user.id, 'messages:', messages.length);
      
      profilingTriggeredRef.current = true;
      
      // Format messages for profiling
      const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const result = await triggerProfiling({
        studentId: user.id,
        sessionId: currentSessionIdRef.current || `session_${Date.now()}`,
        messages: formattedMessages,
        topic: 'text_practice',
        targetLevel: conversationLevel
      });
      
      console.log('[Profiling] ✅ Result:', result);
    } catch (error) {
      console.error('[Profiling] ❌ Error:', error);
    }
  }, [messages, conversationLevel, triggerProfiling]);

  // Trigger profiling on unmount and page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable async on page close
      if (messages.length >= 4 && currentSessionIdRef.current) {
        console.log('[Profiling] Page unloading - triggering via beacon');
        triggerProfilingNow(true);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      triggerProfilingNow(true);
    };
  }, [triggerProfilingNow, messages.length]);

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
      
      // Track user message count for profiling intervals
      userMessageCountRef.current++;
      console.log('[Profiling] User message count:', userMessageCountRef.current);
      
      // Trigger profiling every N user messages
      if (userMessageCountRef.current >= PROFILING_INTERVAL) {
        console.log('[Profiling] 📊 Interval reached, triggering profiling...');
        userMessageCountRef.current = 0;
        profilingTriggeredRef.current = false; // Allow re-triggering
        triggerProfilingNow(true);
      }
      
      // Track text practice usage - CRITICAL for limit enforcement
      await trackTextMessage();
      
      // Refresh usage limits to get updated counts
      await refreshLimits();
      
      // Award XP for sending a text message with metadata for better calculation
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
      // Pass the correctGrammar flag, conversation history, level, and CEFR level
      const effectiveCefrLevel = proficiency?.cefrLevel || null;
      return await sendChatMessage(message, correctGrammar, apiConversationHistory, conversationLevel, effectiveCefrLevel);
    } catch (error) {
      console.error("Error sending message with correction flag:", error);
      return null;
    }
  };
  
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
    // Generate appropriate prompt based on target language
    const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
    const prompt = generateLanguageLearningPrompt();
    
    // Force replace the input with the generated prompt
    setInput(prompt);
    
    // Simulate form submission
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
  };
  
  const clearConversation = async () => {
    // Trigger profiling before clearing
    await triggerProfilingNow(true);
    
    setMessages([]);
    setApiConversationHistory([]);
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('apiConversationHistory');
    
    // Reset message count and profiling flag
    setMessageCount({ inputs: 0, outputs: 0 });
    profilingTriggeredRef.current = false;
    userMessageCountRef.current = 0;
    
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
    toggleGrammarCorrection
  };
};

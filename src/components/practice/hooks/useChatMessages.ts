
import { useState, useCallback, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatMessaging } from "./useChatMessaging";
import { usePromptGenerator } from "./usePromptGenerator";
import { useSessionManagement } from "./useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { useUsageLimits } from "@/hooks/useUsageLimits";
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
  const { messageCount, setMessageCount } = useSessionManagement();
  const { toast } = useToast();
  const { awardXP } = useGamification();
  const { checkCanSendTextMessage, trackTextMessage, usageLimits, refreshLimits } = useUsageLimits();

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
  
  // Modified send function that includes grammar correction preference and conversation history
  const sendChatMessageWithCorrection = async (message: string) => {
    try {
      // Pass the correctGrammar flag and conversation history for context, plus conversation level
      return await sendChatMessage(message, correctGrammar, apiConversationHistory, conversationLevel);
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
  
  const clearConversation = () => {
    setMessages([]);
    setApiConversationHistory([]);
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('apiConversationHistory');
    
    // Reset message count
    setMessageCount({ inputs: 0, outputs: 0 });
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

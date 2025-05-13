
import { useState, useCallback, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatMessaging } from "./useChatMessaging";
import { usePromptGenerator } from "./usePromptGenerator";
import { useSessionManagement } from "./useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import type { TranslationType } from "./useTranslationHandler";
import type { ChatMessage } from "@/types/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [correctGrammar, setCorrectGrammar] = useState<boolean>(false);
  const { t, currentLanguage } = useLocalization();
  const { isLoading, hasError, sendChatMessage, retryLastMessage, extractStringFromTranslation } = useChatMessaging();
  const { generateLanguageLearningPrompt } = usePromptGenerator();
  const { messageCount, setMessageCount } = useSessionManagement();
  const { toast } = useToast();
  const { analyzeConversation } = useLanguageAnalysis();

  // Load saved messages from session storage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
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

  // Automatically analyze conversation when user navigates away
  useEffect(() => {
    // Only run if we have enough messages to analyze
    const analyzeBeforeUnload = () => {
      if (messages.length >= 4) {
        // Use the silent option to avoid showing toasts
        analyzeConversation(messages, { silent: true })
          .catch(err => console.error("Error in auto-analysis:", err));
      }
    };

    // Add event listener for when user navigates away
    window.addEventListener('beforeunload', analyzeBeforeUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', analyzeBeforeUnload);
      
      // Also analyze when component unmounts (navigating to another page)
      if (messages.length >= 4) {
        analyzeConversation(messages, { silent: true })
          .catch(err => console.error("Error in auto-analysis on unmount:", err));
      }
    };
  }, [messages, analyzeConversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Check session limits - simplified check since we removed checkSessionLimits
    const isAllowed = true; // Simplifying for now, could be enhanced later
    if (!isAllowed) {
      console.log('Session limits exceeded');
      return;
    }
    
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Send message to API, passing the correctGrammar flag
    const response = await sendChatMessageWithCorrection(input);
    
    if (response) {
      // Add assistant response to the chat
      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        translation: response.translation
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }
  };
  
  // Modified send function that includes grammar correction preference
  const sendChatMessageWithCorrection = async (message: string) => {
    // Get the current instance of sendChatMessage but add correctGrammar option
    try {
      // Pass the correctGrammar flag in the request
      return await sendChatMessage(message, correctGrammar);
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
    // If we have enough messages, analyze before clearing
    if (messages.length >= 4) {
      analyzeConversation(messages, { silent: true })
        .catch(err => console.error("Error analyzing conversation before clearing:", err));
    }
    
    setMessages([]);
    sessionStorage.removeItem('chatMessages');
    
    // Reset message count
    setMessageCount({ inputs: 0, outputs: 0 });
    
    // Show toast notification
    toast({
      title: t("success"),
      description: t("conversationCleared"),
      variant: "default",
    });
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

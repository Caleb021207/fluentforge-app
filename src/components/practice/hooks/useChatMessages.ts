
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getInitialPromptForLanguage, getPlaceholderForLanguage, sendChatMessage, requestTranslation } from "./utils/chatUtils";
import type { ChatMessage, UseChatMessagesResult } from "./types/chatTypes";

export const useChatMessages = (): UseChatMessagesResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  const sendLanguageLearningPrompt = () => {
    const prompt = getInitialPromptForLanguage(currentLanguage);
    
    if (prompt) {
      const userMessage: ChatMessage = {
        role: "user",
        content: prompt,
      };

      setMessages((prev) => [...prev, userMessage]);
      handleSendPrompt(prompt);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await sendChatMessage(promptText, currentLanguage, true);

      if (error) {
        throw error;
      }
      
      console.log('Response with translation check:', data);
      
      let translation = data.translation || "";
      
      if (!translation && currentLanguage !== "english") {
        console.log("No translation provided for response in language:", currentLanguage);
        
        try {
          const { data: translationData, error: translationError } = await requestTranslation(data.content, currentLanguage);
          
          if (!translationError && translationData && translationData.translation) {
            translation = translationData.translation;
            console.log("Got translation manually:", translation);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: translation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    await handleSendPrompt(input);
  };

  const getPlaceholderText = () => {
    return getPlaceholderForLanguage(currentLanguage);
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
    getPlaceholderText
  };
};

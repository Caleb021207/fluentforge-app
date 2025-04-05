
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useChatApi } from "./useChatApi";
import { useTranslation } from "./useTranslation";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { t } = useLocalization();
  const { sendChatMessage, getLanguageLearningPrompt, isLoading, setIsLoading } = useChatApi();
  const { getPlaceholderText, currentLanguage } = useTranslation();

  const sendLanguageLearningPrompt = () => {
    const prompt = getLanguageLearningPrompt(currentLanguage);

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

    const assistantMessage = await sendChatMessage(promptText, currentLanguage);
    
    if (assistantMessage) {
      setMessages((prev) => [...prev, assistantMessage]);
    }
    
    setIsLoading(false);
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
    
    const assistantMessage = await sendChatMessage(input, currentLanguage);
    
    if (assistantMessage) {
      setMessages((prev) => [...prev, assistantMessage]);
    }
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

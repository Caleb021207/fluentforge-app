
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "../types/chat";
import { getPlaceholderTextForLanguage, getLanguageLearningPrompt } from "../utils/languageUtils";
import { useMessageSubmission } from "./useMessageSubmission";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  
  const { handleSendPrompt } = useMessageSubmission(currentLanguage, setMessages, setIsLoading);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Use the shared handler to send the message
    handleSendPrompt(input);
  };

  const getPlaceholderText = () => {
    return getPlaceholderTextForLanguage(currentLanguage);
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

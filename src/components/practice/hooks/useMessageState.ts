
import { useState } from "react";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

export const useMessageState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addUserMessage = (content: string) => {
    const isSafe = isSafeContent(content);
    let processedContent = content;
    
    if (!isSafe) {
      processedContent = filterContent(content);
    }
    
    const userMessage: ChatMessage = {
      role: "user",
      content: processedContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  };

  const addAssistantMessage = (content: string, translation?: string) => {
    const safeContent = filterContent(content);
    const safeTranslation = translation ? filterContent(translation) : "";
    
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: safeContent,
      translation: safeTranslation,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage;
  };

  return {
    messages,
    setMessages,
    addUserMessage,
    addAssistantMessage
  };
};

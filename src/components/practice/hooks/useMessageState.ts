
import { useState } from "react";
import { ChatMessage } from "@/types/chat";
import { MessageCount } from "@/types/chat";

export const useMessageState = (setMessageCount: (count: MessageCount) => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessageCount(prev => ({
      ...prev,
      inputs: prev.inputs + 1
    }));
  };

  const addAssistantMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setMessageCount(prev => ({
      ...prev,
      outputs: prev.outputs + 1
    }));
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
  };
};

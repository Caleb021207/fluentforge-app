
import { useState } from "react";
import { ChatMessage, MessageCount } from "@/types/chat";

export const useMessageState = (setMessageCount: (count: MessageCount) => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Fix: Create a new MessageCount object instead of using an updater function
    setMessageCount({
      inputs: messages.filter(msg => msg.role === "user").length + 1,
      outputs: messages.filter(msg => msg.role === "assistant").length
    });
  };

  const addAssistantMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    
    // Fix: Create a new MessageCount object instead of using an updater function
    setMessageCount({
      inputs: messages.filter(msg => msg.role === "user").length,
      outputs: messages.filter(msg => msg.role === "assistant").length + 1
    });
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
  };
};

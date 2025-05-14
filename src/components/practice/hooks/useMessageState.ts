
import { useState } from "react";
import { ChatMessage, MessageCount } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

export const useMessageState = (setMessageCount: (count: MessageCount) => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
    };
    
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, userMessage];
      
      // Calculate counts from the updated messages array
      const userCount = updatedMessages.filter(msg => msg.role === "user").length;
      const assistantCount = updatedMessages.filter(msg => msg.role === "assistant").length;
      
      // Update message count with correct values
      setMessageCount({
        inputs: userCount,
        outputs: assistantCount
      });
      
      return updatedMessages;
    });
  };

  const addAssistantMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, message];
      
      // Calculate counts from the updated messages array
      const userCount = updatedMessages.filter(msg => msg.role === "user").length;
      const assistantCount = updatedMessages.filter(msg => msg.role === "assistant").length;
      
      // Update message count with correct values
      setMessageCount({
        inputs: userCount,
        outputs: assistantCount
      });
      
      return updatedMessages;
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

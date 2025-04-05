
import { useState } from "react";
import { ChatMessage } from "./useChatMessages";

/**
 * Hook for managing chat message state
 */
export const useMessageState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  
  return {
    messages,
    setMessages,
    input,
    setInput
  };
};

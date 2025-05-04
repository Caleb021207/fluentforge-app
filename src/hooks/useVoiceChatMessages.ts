import { useState } from "react";
import { Message } from "@/types/chat"; 
import { useLocalization } from "@/hooks/useLocalization";

interface UseVoiceChatMessagesProps {
  initialMessages?: Message[];
}

export const useVoiceChatMessages = ({ initialMessages = [] }: UseVoiceChatMessagesProps = {}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { t } = useLocalization();

  const addMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const generateErrorMessage = (error: string) => {
    return {
      role: "assistant",
      content: t("errorMessage", { message: error }),
      timestamp: new Date(),
      isLoading: false,
      isError: true,
    } as Message;
  };

  return {
    messages,
    addMessage,
    clearMessages,
    generateErrorMessage
  };
};

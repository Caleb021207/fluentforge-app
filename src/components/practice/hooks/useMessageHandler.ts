
import { useMessageState } from "./useMessageState";
import { useChatApi } from "./useChatApi";
import type { MessageCount } from "@/types/chat";

export const useMessageHandler = (setMessageCount: (count: MessageCount) => void) => {
  const {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
  } = useMessageState(setMessageCount);

  const { sendMessage } = useChatApi();

  const handleMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      addUserMessage(input);

      const assistantMessage = await sendMessage(input);
      if (assistantMessage) {
        addAssistantMessage(assistantMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleMessage };
};

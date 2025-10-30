
import { useState } from "react";
import { useMessageState } from "./useMessageState";
import { useChatApi } from "./useChatApi";
import type { MessageCount } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useUsageLimits } from "@/hooks/useUsageLimits";

export const useMessageHandler = (setMessageCount: (count: MessageCount) => void) => {
  const {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
  } = useMessageState(setMessageCount);
  
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  
  const { sendChatMessage } = useChatApi();
  const { toast } = useToast();
  const { t } = useLocalization();
  const { checkCanSendTextMessage, trackTextMessage } = useUsageLimits();

  // Process the message queue
  const processQueue = async () => {
    if (isProcessingQueue || messageQueue.length === 0) return;
    
    setIsProcessingQueue(true);
    
    try {
      const nextMessage = messageQueue[0];
      setIsLoading(true);
      
      // Process the message with required arguments
      const assistantMessage = await sendChatMessage(nextMessage, 'spanish', 'english');
      
      if (assistantMessage) {
        addAssistantMessage(assistantMessage);
      }
      
      // Remove the processed message from the queue
      setMessageQueue(prev => prev.slice(1));
    } catch (error) {
      console.error('Error processing message queue:', error);
      toast({
        title: t("error") || "Error",
        description: t("failedToSendMessage") || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsProcessingQueue(false);
    }
  };
  
  // Watch the queue and process messages when available
  useState(() => {
    if (messageQueue.length > 0 && !isLoading && !isProcessingQueue) {
      processQueue();
    }
  });

  const handleMessage = async (input: string) => {
    if (!input.trim()) return;
    
    // Check text message limit before sending
    const canSend = await checkCanSendTextMessage();
    if (!canSend.allowed) {
      return; // Don't send if limit reached
    }
    
    // Add user message immediately for better UX
    addUserMessage(input);
    
    try {
      setIsLoading(true);
      
      // Send message to API with required arguments
      const assistantMessage = await sendChatMessage(input, 'spanish', 'english');
      
      if (assistantMessage) {
        addAssistantMessage(assistantMessage);
        // Track the message after successful send
        await trackTextMessage();
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleMessage };
};

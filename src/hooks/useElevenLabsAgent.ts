
import { useState, useEffect, useRef, useCallback } from "react";
import { getAgentIdForLanguage, getVoiceIdForLanguage, formatConversationHistory } from "@/utils/elevenLabsUtils";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentConversation {
  messages: AgentMessage[];
  id?: string;
  lastUserMessage?: string;
  lastAssistantMessage?: string;
}

export const useElevenLabsAgent = (targetLanguage: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<AgentConversation>({
    messages: []
  });
  const { toast } = useToast();
  const { t } = useLocalization();
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isProcessingAudioRef = useRef<boolean>(false);

  // Clean up function for WebSocket and AudioContext
  const cleanupConnection = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    setIsConnected(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isProcessingAudioRef.current = false;
  }, []);

  // Process audio queue - simplified to avoid actual audio processing
  const processAudioQueue = useCallback(async () => {
    console.log("Note: ElevenLabs functionality removed - processAudioQueue called");
    setIsSpeaking(false);
    isProcessingAudioRef.current = false;
  }, []);

  // Handle WebSocket messages - simplified to avoid actual WebSocket handling
  const handleWebSocketMessage = useCallback((event: any) => {
    console.log("Note: ElevenLabs functionality removed - handleWebSocketMessage called");
  }, []);

  // Start agent conversation - returns a dummy conversation ID
  const startAgent = useCallback(async (apiKey: string): Promise<string> => {
    console.log("Note: ElevenLabs functionality removed - startAgent called");
    
    // Create a simulated conversation for compatibility
    const conversationId = Date.now().toString();
    
    setIsConnected(true);
    
    // Create an initial message to maintain compatibility
    const greeting = `Hello! I'm your ${targetLanguage} language tutor. (Note: Voice functionality is disabled)`;
    setConversation({
      messages: [
        { role: 'assistant', content: greeting }
      ],
      lastAssistantMessage: greeting,
      id: conversationId
    });
    
    return conversationId;
  }, [targetLanguage]);

  // Send message to the agent - simplified to update conversation state only
  const sendMessage = useCallback((text: string) => {
    console.log("Note: ElevenLabs functionality removed - sendMessage called with:", text);
    
    setConversation(prev => {
      const userMessage: AgentMessage = {
        role: 'user',
        content: text
      };
      
      const updatedMessages = [...prev.messages, userMessage];
      
      return {
        ...prev,
        messages: updatedMessages,
        lastUserMessage: text
      };
    });
    
    // Simulate a response after a delay
    setTimeout(() => {
      setConversation(prev => {
        const assistantMessage: AgentMessage = {
          role: 'assistant',
          content: "I'm sorry, voice chat functionality is currently unavailable."
        };
        
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          lastAssistantMessage: assistantMessage.content
        };
      });
    }, 1000);
    
    return true;
  }, []);

  // Stop the agent - clean up resources
  const stopAgent = useCallback(async () => {
    cleanupConnection();
    return true;
  }, [cleanupConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, [cleanupConnection]);

  return {
    isConnected,
    isSpeaking,
    conversation,
    startAgent,
    stopAgent,
    sendMessage,
  };
};

export default useElevenLabsAgent;

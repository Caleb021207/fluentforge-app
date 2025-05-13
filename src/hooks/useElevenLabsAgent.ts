
import { useState, useEffect, useRef, useCallback } from "react";
import { getAgentIdForLanguage, getVoiceIdForLanguage } from "@/utils/elevenLabsUtils";
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

  // Process audio queue
  const processAudioQueue = useCallback(async () => {
    if (isProcessingAudioRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) {
      return;
    }
    
    isProcessingAudioRef.current = true;
    setIsSpeaking(true);
    
    try {
      const audioData = audioQueueRef.current.shift();
      if (!audioData) {
        isProcessingAudioRef.current = false;
        setIsSpeaking(false);
        return;
      }
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        isProcessingAudioRef.current = false;
        if (audioQueueRef.current.length > 0) {
          processAudioQueue();
        } else {
          setIsSpeaking(false);
        }
      };
      
      source.start();
    } catch (error) {
      console.error("Error processing audio:", error);
      isProcessingAudioRef.current = false;
      setIsSpeaking(false);
      processAudioQueue(); // Try next in queue
    }
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'speech') {
      // Handle audio data
      const audioData = Uint8Array.from(atob(message.audio), c => c.charCodeAt(0)).buffer;
      audioQueueRef.current.push(audioData);
      
      if (!isProcessingAudioRef.current) {
        processAudioQueue();
      }
    } else if (message.type === 'message') {
      // Handle text message from the agent
      setConversation(prev => {
        const updatedMessages = [...prev.messages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update existing assistant message
          lastMessage.content = message.text;
        } else {
          // Add new assistant message
          updatedMessages.push({
            role: 'assistant',
            content: message.text
          });
        }
        
        return {
          ...prev,
          messages: updatedMessages,
          lastAssistantMessage: message.text
        };
      });
    } else if (message.type === 'error') {
      console.error("ElevenLabs agent error:", message.error);
      toast({
        title: t("error"),
        description: message.error || t("serviceUnavailable"),
        variant: "destructive",
      });
    }
  }, [processAudioQueue, toast, t]);

  // Start agent conversation
  const startAgent = useCallback(async (apiKey: string): Promise<string> => {
    try {
      if (!apiKey) {
        throw new Error("API key is required");
      }
      
      cleanupConnection();
      
      // Initialize AudioContext
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Get agent ID for the target language
      const agentId = getAgentIdForLanguage(targetLanguage);
      const voiceId = getVoiceIdForLanguage(targetLanguage);
      
      // Create WebSocket connection
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=eleven_turbo_v2&output_format=mp3&optimize_streaming_latency=3&xi-api-key=${apiKey}`;
      websocketRef.current = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        if (!websocketRef.current) {
          reject(new Error("Failed to create WebSocket connection"));
          return;
        }
        
        websocketRef.current.onopen = () => {
          setIsConnected(true);
          console.log("WebSocket connection established");
          
          // Initialize conversation with agent configuration
          if (websocketRef.current) {
            websocketRef.current.send(JSON.stringify({
              text: `You are an AI language tutor for ${targetLanguage}. You will help the user practice ${targetLanguage} through conversation.`,
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0,
                use_speaker_boost: true
              },
              generation_config: {
                chunk_length_schedule: [120, 160, 250, 290]
              },
              xi_api_key: apiKey
            }));
            
            // Send initial greeting
            const greeting = `Hello! I'm your ${targetLanguage} language tutor. How can I help you practice today?`;
            setConversation({
              messages: [
                { role: 'assistant', content: greeting }
              ],
              lastAssistantMessage: greeting,
              id: Date.now().toString()
            });
            
            resolve(Date.now().toString());
          } else {
            reject(new Error("WebSocket connection lost during initialization"));
          }
        };
        
        if (websocketRef.current) {
          websocketRef.current.onmessage = handleWebSocketMessage;
          
          websocketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            reject(new Error("WebSocket connection error"));
            cleanupConnection();
          };
          
          websocketRef.current.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
          };
        }
      });
    } catch (error) {
      console.error("Error starting agent:", error);
      cleanupConnection();
      throw error;
    }
  }, [targetLanguage, cleanupConnection, handleWebSocketMessage]);

  // Send message to the agent
  const sendMessage = useCallback((text: string) => {
    if (!isConnected || !websocketRef.current) {
      toast({
        title: t("error"),
        description: t("notConnectedToAgent"),
        variant: "destructive",
      });
      return false;
    }
    
    try {
      websocketRef.current.send(JSON.stringify({ text }));
      
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
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t("error"),
        description: t("failedToSendMessage"),
        variant: "destructive",
      });
      return false;
    }
  }, [isConnected, toast, t]);

  // Stop the agent
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

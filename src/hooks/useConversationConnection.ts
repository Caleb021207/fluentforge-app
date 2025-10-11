import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '@/utils/audioUtils';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sequence: number;
  responseId?: string;
}

interface UseConversationConnectionProps {
  nativeLanguage: string;
  targetLanguage: string;
  onSpeakingChange: (speaking: boolean) => void;
}

export const useConversationConnection = ({
  nativeLanguage,
  targetLanguage,
  onSpeakingChange,
}: UseConversationConnectionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sequenceCounterRef = useRef(0);
  const pendingUserMessageIndexRef = useRef<number | null>(null);

  const startConversation = useCallback(async () => {
    try {
      console.log("🚀 Starting conversation...");
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Initialize audio context and queue
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to edge function WebSocket
      const wsUrl = `wss://dukpljcweixxmpkiblwo.functions.supabase.co/realtime-chat?nativeLanguage=${encodeURIComponent(nativeLanguage)}&targetLanguage=${encodeURIComponent(targetLanguage)}&authorization=${encodeURIComponent(session.access_token)}`;
      
      console.log("🔌 Connecting to WebSocket...");
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      return new Promise<void>((resolve, reject) => {
        if (!ws) {
          reject(new Error("WebSocket not initialized"));
          return;
        }

        ws.onopen = () => {
          console.log("✅ WebSocket connected!");
          
          // Start audio recording
          audioRecorderRef.current = new AudioRecorder((audioData) => {
            if (ws.readyState === WebSocket.OPEN) {
              const encoded = encodeAudioForAPI(audioData);
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: encoded
              }));
            }
          });

          audioRecorderRef.current.start()
            .then(() => {
              setIsConnected(true);
              resolve();
            })
            .catch(reject);
        };

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          reject(new Error("Failed to connect to voice service"));
        };

        ws.onclose = (event) => {
          console.log("🔌 WebSocket closed:", event.code, event.reason);
          setIsConnected(false);
          audioRecorderRef.current?.stop();
          audioQueueRef.current?.clear();
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("📨 Received:", data.type);

          switch (data.type) {
            case 'session.created':
              console.log("✅ Session created");
              break;

            case 'session.updated':
              console.log("✅ Session configured");
              break;

            case 'response.created':
              // AI starting to respond - add placeholder for user message
              setMessages(prev => {
                const userSequence = sequenceCounterRef.current++;
                pendingUserMessageIndexRef.current = prev.length;
                return [...prev, {
                  role: 'user',
                  text: '[Transcribing...]',
                  sequence: userSequence
                }];
              });
              break;

            case 'conversation.item.input_audio_transcription.completed':
              // Update placeholder with actual user transcript
              setMessages(prev => {
                if (pendingUserMessageIndexRef.current !== null) {
                  const newMessages = [...prev];
                  newMessages[pendingUserMessageIndexRef.current] = {
                    ...newMessages[pendingUserMessageIndexRef.current],
                    text: data.transcript
                  };
                  pendingUserMessageIndexRef.current = null;
                  return newMessages;
                }
                return prev;
              });
              break;

            case 'response.audio.delta':
              // Play audio chunk
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              audioQueueRef.current?.addChunk(bytes);
              onSpeakingChange(true);
              break;

            case 'response.audio.done':
              audioQueueRef.current?.flush();
              onSpeakingChange(false);
              break;

            case 'response.audio_transcript.delta':
              // Append AI transcript fragments
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant' && lastMsg.responseId === data.response_id) {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...lastMsg,
                    text: lastMsg.text + data.delta
                  };
                  return newMessages;
                } else {
                  return [...prev, {
                    role: 'assistant',
                    text: data.delta,
                    sequence: sequenceCounterRef.current++,
                    responseId: data.response_id
                  }];
                }
              });
              break;

            case 'error':
              console.error("❌ OpenAI error:", data);
              break;
          }
        };
      });
    } catch (error) {
      console.error("❌ Connection error:", error);
      throw error;
    }
  }, [nativeLanguage, targetLanguage, onSpeakingChange]);

  const endConversation = useCallback(() => {
    console.log("🛑 Ending conversation...");
    
    audioRecorderRef.current?.stop();
    audioQueueRef.current?.clear();
    wsRef.current?.close();
    audioContextRef.current?.close();
    
    wsRef.current = null;
    audioRecorderRef.current = null;
    audioQueueRef.current = null;
    audioContextRef.current = null;
    
    setIsConnected(false);
    pendingUserMessageIndexRef.current = null;
  }, []);

  return {
    isConnected,
    messages,
    startConversation,
    endConversation,
  };
};

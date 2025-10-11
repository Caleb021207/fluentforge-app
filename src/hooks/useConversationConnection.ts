import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useConversationConnection = ({ onSpeakingChange }: any) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startConversation = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    console.log("🚀 CONNECTING");
    
    const ws = new WebSocket(
      `wss://dukpljcweixxmpkiblwo.functions.supabase.co/realtime-chat`
    );
    wsRef.current = ws;

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);

      ws.onopen = async () => {
        clearTimeout(timeout);
        console.log("✅ CONNECTED");

        // Start mic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1 }});
        streamRef.current = stream;
        
        const ctx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const float32 = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
          }
          const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
          ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: base64 }));
        };
        
        source.connect(processor);
        processor.connect(ctx.destination);

        setIsConnected(true);
        resolve();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Connection failed"));
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        
        if (data.type === 'response.audio.delta') onSpeakingChange(true);
        if (data.type === 'response.audio.done') onSpeakingChange(false);
        
        if (data.type === 'response.audio_transcript.delta') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, text: last.text + data.delta }];
            }
            return [...prev, { role: 'assistant', text: data.delta }];
          });
        }
      };
    });
  }, [onSpeakingChange]);

  const endConversation = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    wsRef.current?.close();
    setIsConnected(false);
  }, []);

  return { isConnected, messages, startConversation, endConversation };
};

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useConversationConnection = ({ onSpeakingChange }: any) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startConversation = useCallback(async () => {
    try {
      console.log("🚀 Getting ephemeral token...");
      
      const { data, error } = await supabase.functions.invoke('realtime-chat');
      
      if (error) throw error;
      if (!data?.client_secret?.value) throw new Error("No token received");

      const token = data.client_secret.value;
      console.log("✅ Token received");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      if (!audioRef.current) {
        audioRef.current = document.createElement("audio");
        audioRef.current.autoplay = true;
      }

      pc.ontrack = (e) => {
        console.log("🎵 Audio track received");
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 24000, channelCount: 1 } 
      });
      pc.addTrack(stream.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("📨 Event:", event.type);

        if (event.type === 'response.audio.delta') onSpeakingChange(true);
        if (event.type === 'response.audio.done') onSpeakingChange(false);

        if (event.type === 'response.audio_transcript.delta') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, text: last.text + event.delta }];
            }
            return [...prev, { role: 'assistant', text: event.delta }];
          });
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/sdp"
          },
        }
      );

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      console.log("✅ WebRTC connected");
      setIsConnected(true);
    } catch (error) {
      console.error("❌ Connection error:", error);
      throw error;
    }
  }, [onSpeakingChange]);

  const endConversation = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    audioRef.current = null;
    setIsConnected(false);
    setMessages([]);
  }, []);

  return { isConnected, messages, startConversation, endConversation };
};

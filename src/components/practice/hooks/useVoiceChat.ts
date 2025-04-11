
import { useState, useEffect } from "react";
import { useElevenLabsAgent } from "@/utils/elevenLabsUtils";
import { useLocalization } from "@/context/LocalizationContext";

export const useVoiceChat = (targetLanguage?: string) => {
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean | null>(null);
  const { currentLanguage } = useLocalization();
  
  const {
    startAgent,
    stopAgent,
    isConnected,
    isSpeaking
  } = useElevenLabsAgent(currentLanguage, targetLanguage);
  
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        if (hasMicrophone) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophoneAccess(true);
          } catch (error) {
            console.error("Microphone access error:", error);
            setMicrophoneAccess(false);
          }
        } else {
          setMicrophoneAccess(false);
        }
      } catch (error) {
        console.error("Unable to check microphone access:", error);
        setMicrophoneAccess(false);
      }
    };
    
    checkMicrophoneAccess();
  }, []);
  
  const startVoiceConversation = async () => {
    console.log(`Starting voice conversation with language: ${currentLanguage}, target: ${targetLanguage || 'default'}`);
    return await startAgent();
  };
  
  const endVoiceConversation = async () => {
    return await stopAgent();
  };
  
  const isConversationActive = () => {
    return isConnected;
  };
  
  return {
    microphoneAccess,
    startVoiceConversation,
    endVoiceConversation,
    isConversationActive,
    isSpeaking,
    // Add a voiceChatTimeRemaining property with a null value
    // as it doesn't exist in this hook but is expected by Practice.tsx
    voiceChatTimeRemaining: null,
    conversation: {
      isSpeaking
    }
  };
};

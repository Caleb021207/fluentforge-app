
import { useState, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/components/ui/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { VoiceMessage } from "../types";

export const useVoiceConversation = (
  currentSessionId: string | null,
  setCurrentSessionId: (id: string | null) => void,
  endSession: (id: string) => Promise<void>,
  setSessionStatus: (status: 'available' | 'active' | 'cooldown') => void
) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  const conversation = useConversation({
    onMessage: message => {
      if (message.type === "llm_response") {
        const assistantMessage: VoiceMessage = {
          role: "assistant",
          content: message.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    },
    onError: error => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive"
        });
      }
    };
    initMicrophone();
  }, [toast, t]);

  useEffect(() => {
    let timerId: number | null = null;
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setVoiceChatTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit5MinReached")
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isConversationActive(), voiceChatTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return {
        practice: "Spanish",
        native: "English"
      };
    } else if (currentLanguage === "spanish") {
      return {
        practice: "English",
        native: "Spanish"
      };
    } else if (currentLanguage === "portuguese") {
      return {
        practice: "English",
        native: "Portuguese"
      };
    } else if (currentLanguage === "korean") {
      return {
        practice: "English",
        native: "Korean"
      };
    } else if (currentLanguage === "arabic") {
      return {
        practice: "English",
        native: "Arabic"
      };
    } else if (currentLanguage === "mandarin") {
      return {
        practice: "English",
        native: "Mandarin Chinese"
      };
    } else if (currentLanguage === "vietnamese") {
      return {
        practice: "English",
        native: "Vietnamese"
      };
    }
    
    return {
      practice: "Spanish",
      native: "English"
    };
  };

  const getInitialUserMessage = (): string => {
    if (currentLanguage === "english") {
      return "Hello, I'd like to practice Spanish with you.";
    } else if (currentLanguage === "mandarin") {
      return "你好，我想和你练习英语。"; // "Hello, I'd like to practice English with you" in Mandarin
    } else if (currentLanguage === "vietnamese") {
      return "Xin chào, tôi muốn thực hành tiếng Anh với bạn."; // "Hello, I'd like to practice English with you" in Vietnamese
    } else {
      return "Hello, I'd like to practice English with you.";
    }
  };

  const startConversation = async (createSession: () => Promise<string | null>) => {
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      const sessionId = await createSession();
      if (!sessionId) {
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "destructive"
        });
        return;
      }
      
      setCurrentSessionId(sessionId);
      const selectedAgentId = getAgentIdForLanguage(currentLanguage);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      if (isConversationActive()) {
        endConversation();
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const conversationId = await conversation.startSession({
        agentId: selectedAgentId
      });
      
      console.log(`Successfully started conversation session: ${conversationId}`);
      setIsRecording(true);
      setVoiceChatTimeRemaining(300);
      setSessionStatus('active');
      
      const initialUserMessage: VoiceMessage = {
        role: "user",
        content: getInitialUserMessage(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, initialUserMessage]);
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting")
      });
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive"
      });
    }
  };

  const endConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      setIsRecording(false);
      setVoiceChatTimeRemaining(null);
      
      if (currentSessionId) {
        await endSession(currentSessionId);
      }
      
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded")
      });
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared")
    });
  };

  return {
    messages,
    isRecording,
    microphoneAccess,
    voiceChatTimeRemaining,
    conversation,
    isConversationActive,
    formatTime,
    getLanguagePair,
    startConversation,
    endConversation,
    clearConversation
  };
};

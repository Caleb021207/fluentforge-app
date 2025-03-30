
import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { getAgentIdForLanguage } from "@/components/certifications/utils/elevenLabsUtils";
import { useLocalization } from "@/context/LocalizationContext";

type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const PremiumVoiceChat = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  const getAgentId = () => {
    return getAgentIdForLanguage(currentLanguage);
  };

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        const assistantMessage: VoiceMessage = {
          role: "assistant",
          content: message.content,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
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
                description: t("timeLimit5MinReached"),
              });
            }
            return null;
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

  const startConversation = async () => {
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const selectedAgentId = getAgentId();
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      if (isConversationActive()) {
        endConversation();
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const sessionId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      
      console.log(`Successfully started conversation session: ${sessionId}`);
      setIsRecording(true);
      setVoiceChatTimeRemaining(300); // 5 minutes
      
      // Add initial user message to the conversation
      const initialUserMessage: VoiceMessage = {
        role: "user",
        content: currentLanguage === "english" 
          ? "Hello, I'd like to practice Spanish with you."
          : "Hello, I'd like to practice English with you.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, initialUserMessage]);
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      setIsRecording(false);
      setVoiceChatTimeRemaining(null);
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return { practice: "Spanish", native: "English" };
    } else if (currentLanguage === "spanish") {
      return { practice: "English", native: "Spanish" };
    } else if (currentLanguage === "portuguese") {
      return { practice: "English", native: "Portuguese" };
    }
    return { practice: "Spanish", native: "English" };
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: t("Success"),
      description: "Conversation history has been cleared",
    });
  };

  const { practice, native } = getLanguagePair();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("premiumVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Have natural voice conversations with our premium AI tutor to practice your ${practice}! The AI will help correct your grammar, vocabulary, and pronunciation.`
            : currentLanguage === "spanish"
              ? `¡Mantén conversaciones de voz naturales con nuestro tutor de IA premium para practicar tu ${practice}! La IA te ayudará a corregir tu gramática, vocabulario y pronunciación.`
              : `Tenha conversas de voz naturais com nosso tutor de IA premium para praticar seu ${practice}! A IA irá ajudá-lo a corrigir sua gramática, vocabulário e pronúncia.`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: Premium voice conversations use ElevenLabs realistic voice technology. There is a 5-minute conversational limit per session."
              : currentLanguage === "spanish"
                ? "Nota: Las conversaciones de voz premium utilizan la tecnología de voz realista de ElevenLabs. Hay un límite de conversación de 5 minutos por sesión."
                : "Nota: As conversas de voz premium usam a tecnologia de voz realista da ElevenLabs. Há um limite de conversação de 5 minutos por sessão."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={startConversation}
            variant={isConversationActive() ? "destructive" : "default"}
            className="bg-lingua-primary hover:bg-lingua-primary/90"
          >
            {isConversationActive() ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                {t("stopVoiceChat")}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {t("startVoiceChat")}
              </>
            )}
          </Button>
          
          {voiceChatTimeRemaining !== null && (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Headphones className="h-4 w-4" />
              <span>{formatTime(voiceChatTimeRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-3">
          {t("premiumVoiceChatBenefits")}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Volume2 className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>
              {currentLanguage === "english"
                ? "Natural, human-like voice interactions using ElevenLabs technology"
                : currentLanguage === "spanish"
                  ? "Interacciones de voz naturales y humanas utilizando la tecnología de ElevenLabs"
                  : "Interações de voz naturais e humanas usando a tecnologia ElevenLabs"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Headphones className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>
              {currentLanguage === "english"
                ? "Accurate accent and pronunciation for immersive learning"
                : currentLanguage === "spanish"
                  ? "Acento y pronunciación precisos para un aprendizaje inmersivo"
                  : "Sotaque e pronúncia precisos para aprendizado imersivo"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PremiumVoiceChat;

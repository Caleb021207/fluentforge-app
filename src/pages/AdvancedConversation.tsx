
import { useState, useEffect } from "react";
import { MessageCircle, Volume2, Mic, MicOff, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { getAgentIdForLanguage } from "@/components/certifications/utils/elevenLabsUtils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const AdvancedConversation = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  const targetLanguage = currentLanguage === "english" ? "Spanish" : "English";
  
  const getAgentId = () => {
    return getAgentIdForLanguage(currentLanguage);
  };

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: message.content,
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

  const startVoiceConversation = async () => {
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
        await conversation.endSession();
        console.log("Ended previous conversation session");
        toast({
          title: t("startVoiceChat"),
          description: t("startChatting"),
        });
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const sessionId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      console.log(`Successfully started conversation session: ${sessionId}`);
      
      toast({
        title: isConversationActive() ? t("stopVoiceChat") : t("startVoiceChat"),
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("advancedConversation")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Have a natural conversation with our advanced AI tutor in Spanish. This experience provides real-time voice recognition and response to help you practice speaking and listening in a realistic context.`
            : `Have a natural conversation with our advanced AI tutor in English. This experience provides real-time voice recognition and response to help you practice speaking and listening in a realistic context.`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: This feature uses ElevenLabs for voice conversations. There is a 5-minute usage limit per day on the free plan. For unlimited practice, subscribe to our premium plan."
              : currentLanguage === "spanish"
                ? "Nota: Esta función utiliza ElevenLabs para conversaciones de voz. Hay un límite de uso de 5 minutos por día en el plan gratuito. Para práctica ilimitada, suscríbete a nuestro plan premium."
                : "Nota: Este recurso utiliza ElevenLabs para conversações por voz. Há um limite de uso de 5 minutos por dia no plano gratuito. Para prática ilimitada, assine nosso plano premium."}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button
            onClick={startVoiceConversation}
            variant={isConversationActive() ? "destructive" : "default"}
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
        </div>
      </div>

      <Card className="mb-4 p-6">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("startChatting")}</p>
              <p className="text-sm mt-2">
                {microphoneAccess 
                  ? t("clickToStartVoice")
                  : t("allowMicAccess")}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-lingua-primary text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.translation && (
                    <p className="text-sm mt-2 text-gray-500">
                      {message.translation}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center py-4">
          {isConversationActive() ? (
            <div className="flex items-center justify-center gap-2 text-lingua-primary">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lingua-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-lingua-primary"></span>
              </span>
              <p className="font-medium">{t("listeningToYou")}</p>
            </div>
          ) : (
            <p className="text-gray-500">{t("clickStartToBegin")}</p>
          )}
        </div>
      </Card>
      
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Conversation Tips</h2>
        <ul className="space-y-2 text-gray-700 list-disc pl-5">
          <li>Speak clearly and at a moderate pace</li>
          <li>Try asking questions about everyday topics</li>
          <li>When you don't understand something, ask for clarification</li>
          <li>Practice responding to questions about your interests</li>
          <li>Don't worry about mistakes - focus on communication!</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedConversation;


import React, { useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useProVoiceChat } from "@/hooks/useProVoiceChat";
import ProVoiceStatus from "@/components/pro-voice/ProVoiceStatus";
import ProVoiceControls from "@/components/pro-voice/ProVoiceControls";
import ProVoiceBenefits from "@/components/pro-voice/ProVoiceBenefits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProVoiceChat: React.FC = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const {
    status,
    microphoneAccess,
    transcript,
    interimTranscript,
    response,
    isActive,
    sessionTimeRemaining,
    startSession,
    endSession,
    audioRef
  } = useProVoiceChat();

  // Create audio element for text-to-speech playback
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Get status text based on current status
  const getStatusText = () => {
    switch (status) {
      case "idle":
        return t("startSessionToChat");
      case "listening":
        return t("listeningNow");
      case "processing":
        return t("processingYourSpeech");
      case "speaking":
        return t("aiSpeaking");
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{t("proVoiceChat")}</h1>
      <p className="text-gray-600 mb-6">
        {t("proVoiceChatDescription")}
      </p>

      <ProVoiceStatus
        status={status}
        isActive={isActive}
        timeRemaining={sessionTimeRemaining}
        statusText={getStatusText()}
      />

      <ProVoiceControls
        isActive={isActive}
        onStart={startSession}
        onStop={endSession}
        disabled={!microphoneAccess}
      />

      {isActive && (
        <div className="mt-8 space-y-4">
          {status === "listening" && interimTranscript && (
            <Card className="border-dashed border-gray-300">
              <CardContent className="pt-4">
                <p className="text-gray-500 italic animate-pulse">
                  {interimTranscript}
                </p>
              </CardContent>
            </Card>
          )}

          {transcript && (
            <Card>
              <CardHeader>
                <CardTitle>{t("youSaid")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{transcript}</p>
              </CardContent>
            </Card>
          )}
          
          {response && (
            <Card>
              <CardHeader>
                <CardTitle>{t("aiResponse")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{response}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ProVoiceBenefits />
    </div>
  );
};

export default ProVoiceChat;

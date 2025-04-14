
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useProVoiceChat } from "@/hooks/useProVoiceChat";
import ProVoiceStatus from "@/components/pro-voice/ProVoiceStatus";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import BenefitsList from "@/components/premium-voice/BenefitsList";
import { Card } from "@/components/ui/card";
import { formatTime } from "@/utils/timeUtils";

const ProVoiceChat = () => {
  const { t, currentLanguage } = useLocalization();
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

  // Create wrapper functions to match the expected props interface
  const startConversation = () => {
    if (microphoneAccess) {
      startSession();
    }
  };

  const isConversationActive = () => {
    return isActive;
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("premiumVoiceChat")}</h1>
          <p className="text-gray-600">
            {t("premiumVoiceChatDescription", { practice: currentLanguage })}
          </p>
        </div>

        <div className="grid gap-6">
          <ProVoiceStatus
            status={status}
            isActive={isActive}
            timeRemaining={sessionTimeRemaining}
            statusText={getStatusText()}
          />

          <VoiceChatControls
            startConversation={startConversation}
            isConversationActive={isConversationActive}
            weeklyTimeRemaining={sessionTimeRemaining}
            sessionStatus={isActive ? 'active' : 'available'}
            formatTime={formatTime}
          />

          {isActive && (transcript || interimTranscript || response) && (
            <Card className="p-6 space-y-4">
              {interimTranscript && (
                <div className="italic text-gray-500 animate-pulse">
                  {interimTranscript}
                </div>
              )}
              
              {transcript && (
                <div>
                  <h3 className="font-medium mb-2">{t("youSaid")}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {transcript}
                  </div>
                </div>
              )}
              
              {response && (
                <div>
                  <h3 className="font-medium mb-2">{t("aiResponse")}</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    {response}
                  </div>
                </div>
              )}
            </Card>
          )}

          <BenefitsList />
        </div>
      </div>
    </div>
  );
};

export default ProVoiceChat;

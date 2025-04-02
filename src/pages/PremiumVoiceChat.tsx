
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useVoiceSession } from "@/components/premium-voice/hooks/useVoiceSession";
import { useVoiceConversation } from "@/components/premium-voice/hooks/useVoiceConversation";
import LoginRequired from "@/components/premium-voice/LoginRequired";
import CooldownMessage from "@/components/premium-voice/CooldownMessage";
import PremiumBenefits from "@/components/premium-voice/PremiumBenefits";
import VoiceControls from "@/components/premium-voice/VoiceControls";

const PremiumVoiceChat = () => {
  const { currentLanguage, t } = useLocalization();
  
  const {
    sessionStatus,
    cooldownTimeRemaining,
    currentSessionId,
    isLoggedIn,
    isLoading,
    setCurrentSessionId,
    setSessionStatus,
    createSession,
    endSession,
    formatCooldownTime
  } = useVoiceSession();
  
  const {
    voiceChatTimeRemaining,
    isConversationActive,
    formatTime,
    getLanguagePair,
    startConversation,
    endConversation
  } = useVoiceConversation(currentSessionId, setCurrentSessionId, endSession, setSessionStatus);
  
  const { practice } = getLanguagePair();
  
  const handleStartConversation = async () => {
    if (!isLoggedIn) {
      return;
    }
    
    if (sessionStatus === 'cooldown') {
      return;
    }
    
    await startConversation(createSession);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("premiumVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("premiumVoiceChatDescription", { practice })}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm font-normal">
            {t("premiumVoiceNote")}
          </p>
        </div>
      </div>

      {sessionStatus === 'cooldown' && cooldownTimeRemaining && (
        <CooldownMessage 
          cooldownTimeRemaining={cooldownTimeRemaining} 
          formatCooldownTime={formatCooldownTime} 
        />
      )}

      <VoiceControls 
        isConversationActive={isConversationActive}
        startConversation={handleStartConversation}
        endConversation={endConversation}
        sessionStatus={sessionStatus}
        voiceChatTimeRemaining={voiceChatTimeRemaining}
        formatTime={formatTime}
      />

      <PremiumBenefits />
    </div>
  );
};

export default PremiumVoiceChat;

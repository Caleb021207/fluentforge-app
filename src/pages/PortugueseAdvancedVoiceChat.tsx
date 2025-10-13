
import React, { useState, useEffect } from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useVoiceChatTimer } from "@/hooks/useVoiceChatTimer";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import PageHeader from "@/components/premium-voice/PageHeader";
import BenefitsList from "@/components/premium-voice/BenefitsList";

const PortugueseAdvancedVoiceChat = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t, currentLanguage } = useLocalization();

  const {
    weeklyTimeRemaining,
    isLoading: sessionLoading,
    isLoggedIn,
    sessionStatus,
    createSession,
    endSession
  } = useSessionManagement();

  const {
    startVoiceConversation,
    endVoiceConversation,
    isConversationActive,
    conversation
  } = useVoiceChat();

  // If not using Portuguese, redirect to regular voice chat
  useEffect(() => {
    if (!authLoading && currentLanguage !== "portuguese") {
      window.location.href = "/voice-chat";
    }
  }, [authLoading, currentLanguage]);

  const handleStartConversation = async () => {
    if (isConversationActive()) {
      await endVoiceConversation();
      await endSession();
    } else {
      await createSession();
      
      try {
        // Pass language option to ensure Portuguese voice is used
        await startVoiceConversation("portuguese");
      } catch (error) {
        console.error("Failed to start conversation:", error);
        await endSession();
      }
    }
  };

  const handleTimeExpired = async () => {
    if (isConversationActive()) {
      await endVoiceConversation();
      await endSession();
    }
  };

  const { timerValue, formatTimer } = useVoiceChatTimer({
    isConversationActive,
    weeklyTimeRemaining,
    onTimeExpired: handleTimeExpired,
    t
  });

  if (authLoading || sessionLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  if (!isAuthenticated || !isLoggedIn) {
    return <AuthRequiredPrompt />;
  }

  // Ensure we only show this page for Portuguese language users
  if (currentLanguage !== "portuguese") {
    return <div className="flex justify-center py-8">Redirecting...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PageHeader customTitle={t("portugueseAdvancedVoiceChat")} />
      
      <VoiceChatControls 
        startConversation={handleStartConversation}
        isConversationActive={isConversationActive}
        weeklyTimeRemaining={weeklyTimeRemaining}
        sessionStatus={sessionStatus}
        timerValue={timerValue}
        formatTime={formatTimer}
      />
      
      <BenefitsList />
    </div>
  );
};

export default PortugueseAdvancedVoiceChat;

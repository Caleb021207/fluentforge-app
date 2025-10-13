
import React, { useState, useEffect } from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useVoiceChatTimer } from "@/hooks/useVoiceChatTimer";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useToast } from "@/hooks/use-toast";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import PageHeader from "@/components/premium-voice/PageHeader";
import BenefitsList from "@/components/premium-voice/BenefitsList";

const SpanishAdvancedVoiceChat = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();

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

  const { checkCanStartVoiceSession } = useUsageLimits();

  // If not using Spanish, redirect to regular voice chat
  useEffect(() => {
    if (!authLoading && currentLanguage !== "spanish") {
      window.location.href = "/voice-chat";
    }
  }, [authLoading, currentLanguage]);

  const handleStartConversation = async () => {
    if (isConversationActive()) {
      await endVoiceConversation();
      await endSession();
    } else {
      // Check usage limits before starting session
      const limitCheck = await checkCanStartVoiceSession();
      
      if (!limitCheck.allowed) {
        let errorMessage = t("usageLimitReached");
        
        if (limitCheck.reason === 'monthly_voice_limit_reached') {
          errorMessage = t("monthlyVoiceLimitReached");
        } else if (limitCheck.reason === 'outside_allowed_hours') {
          errorMessage = t("outsideAllowedHours");
        }
        
        toast({
          title: t("voiceSessionBlocked"),
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      await createSession();
      
      try {
        // Pass language option to ensure Spanish voice is used
        await startVoiceConversation("spanish");
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
  
  // Ensure we only show this page for Spanish language users
  if (currentLanguage !== "spanish") {
    return <div className="flex justify-center py-8">Redirecting...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PageHeader customTitle={t("spanishAdvancedVoiceChat")} />
      
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

export default SpanishAdvancedVoiceChat;

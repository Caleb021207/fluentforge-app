
import React, { useState, useEffect, useCallback } from "react";
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

const PremiumVoiceChat = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
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
        await startVoiceConversation();
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

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <PageHeader />
      
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

export default PremiumVoiceChat;


import React, { useState, useEffect, useCallback } from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useVoiceChatTimer } from "@/hooks/useVoiceChatTimer";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import VoiceChatMessages from "@/components/premium-voice/VoiceChatMessages";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import PageHeader from "@/components/premium-voice/PageHeader";
import BenefitsList from "@/components/premium-voice/BenefitsList";

const PremiumVoiceChat = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();

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
    conversation,
    setMessageHandler
  } = useVoiceChat();

  const { 
    messages,
    clearMessages,
    addInitialMessage,
    addMessage 
  } = useVoiceChatMessages();

  // Create message handler callback outside useEffect
  const handleMessage = useCallback((message: any) => {
    if (message.type === "transcription") {
      addMessage("user", message.content);
    } else if (message.type === "llm_response") {
      addMessage("assistant", message.content);
    }
  }, [addMessage]);

  const handleStartConversation = async () => {
    if (isConversationActive()) {
      await endVoiceConversation();
      await endSession();
    } else {
      clearMessages();
      await createSession();
      
      try {
        addInitialMessage();
        const { conversationId } = await startVoiceConversation();
        console.log("Started conversation with ID:", conversationId);
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

  // Set up message handler with proper dependency
  useEffect(() => {
    setMessageHandler(handleMessage);
    return () => setMessageHandler(() => {});
  }, [handleMessage, setMessageHandler]);

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
      
      <VoiceChatMessages 
        messages={messages}
        onClearMessages={clearMessages}
      />
    </div>
  );
};

export default PremiumVoiceChat;

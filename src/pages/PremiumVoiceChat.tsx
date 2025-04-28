
import React, { useState, useEffect, useCallback } from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useVoiceChatTimer } from "@/hooks/useVoiceChatTimer";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import VoiceChatMessages from "@/components/premium-voice/VoiceChatMessages";
import ConversationStarters from "@/components/premium-voice/ConversationStarters";
import PracticeLevelSelector from "@/components/premium-voice/PracticeLevelSelector";
import PracticeGuide from "@/components/practice/PracticeGuide";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import PageHeader from "@/components/premium-voice/PageHeader";
import BenefitsList from "@/components/premium-voice/BenefitsList";

const PremiumVoiceChat = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const [practiceLevel, setPracticeLevel] = useState("B1");

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
      
      <PracticeLevelSelector 
        selectedLevel={practiceLevel}
        onSelectLevel={setPracticeLevel}
      />

      <VoiceChatMessages 
        messages={messages}
        onClearMessages={clearMessages}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ConversationStarters />
        <PracticeGuide />
      </div>
    </div>
  );
};

export default PremiumVoiceChat;

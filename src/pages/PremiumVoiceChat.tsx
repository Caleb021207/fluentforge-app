
import React, { useState, useEffect } from "react";
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

const PremiumVoiceChat = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const { t, currentLanguage } = useLocalization();
  const [practiceLevel, setPracticeLevel] = useState("B1");
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  
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

  const { 
    messages,
    clearMessages,
    addInitialMessage,
    addMessage 
  } = useVoiceChatMessages();

  const handleStartConversation = async () => {
    if (isConversationActive()) {
      await endVoiceConversation();
      await endSession();
    } else {
      clearMessages();
      await createSession();
      
      try {
        const initialMessage = addInitialMessage();
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

  useEffect(() => {
    // Setup conversation message handler
    if (isConversationActive()) {
      conversation.onMessage((message) => {
        if (message.type === "transcription") {
          addMessage("user", message.content);
        } else if (message.type === "llm_response") {
          addMessage("assistant", message.content);
        }
      });
    }
  }, [isConversationActive(), conversation]);

  if (authLoading || sessionLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  if (!isAuthenticated || !isLoggedIn) {
    return <AuthRequiredPrompt />;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("premiumVoiceChat")}</h1>
      
      <p className="text-muted-foreground mb-6">
        {t("premiumVoiceChatDescription", { practice: t(targetLanguage) })}
      </p>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
        <p className="text-amber-800 text-sm">
          {t("premiumVoiceNoteWithReset")}
        </p>
      </div>
      
      <VoiceChatControls 
        startConversation={handleStartConversation}
        isConversationActive={isConversationActive}
        weeklyTimeRemaining={weeklyTimeRemaining}
        sessionStatus={sessionStatus}
        timerValue={timerValue}
        formatTime={formatTimer}
      />
      
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
        <PracticeGuide targetLanguage={targetLanguage} />
      </div>
    </div>
  );
};

export default PremiumVoiceChat;

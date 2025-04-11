
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import { useVoiceChatTimer } from "@/hooks/useVoiceChatTimer";

// Import French-specific components
import LoginPrompt from "@/components/premium-voice/LoginPrompt";
import CooldownMessage from "@/components/premium-voice/CooldownMessage";
import FrenchBenefitsList from "@/components/premium-voice/french/FrenchBenefitsList";
import FrenchVoiceChatControls from "@/components/premium-voice/french/FrenchVoiceChatControls";
import FrenchPageHeader from "@/components/premium-voice/french/FrenchPageHeader";
import FrenchConversationStarters from "@/components/premium-voice/french/FrenchConversationStarters";

const FrenchPremiumVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const {
    microphoneAccess,
    isConversationActive,
    startVoiceConversation: startElevenLabsConversation,
    endVoiceConversation: endElevenLabsConversation,
    conversation
  } = useVoiceChat();

  const {
    isLoggedIn,
    isLoading,
    sessionStatus,
    weeklyTimeRemaining,
    cooldownTimeRemaining,
    setWeeklyTimeRemaining,
    createSession,
    endSession,
    formatCooldownTime
  } = useSessionManagement(t);
  
  const { messages, clearMessages, addInitialMessage } = useVoiceChatMessages();
  
  // Define endConversation function
  const endConversation = async () => {
    if (isConversationActive()) {
      await endElevenLabsConversation();
      setIsRecording(false);
      
      // Check and update the session status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: activeSession } = await supabase
          .from('premium_voice_chat_sessions')
          .select('id')
          .eq('user_id', user.id)
          .is('session_end', null)
          .single();
          
        if (activeSession) {
          await endSession(activeSession.id);
        }
      }
    }
  };
  
  const { timerValue, formatTimer } = useVoiceChatTimer({
    isConversationActive,
    weeklyTimeRemaining,
    onTimeExpired: endConversation,
    t
  });

  const startConversation = async () => {
    if (!isLoggedIn) {
      toast({
        title: t("loginRequired"),
        description: t("pleaseLoginToAccessPremiumFeature"),
        variant: "destructive"
      });
      return;
    }
    
    if (sessionStatus === 'cooldown') {
      toast({
        title: t("cooldownActive"),
        description: t("dailyLimitReached"),
        variant: "destructive"
      });
      return;
    }

    if (isConversationActive()) {
      await endConversation();
      return;
    }

    try {
      const sessionId = await createSession();
      if (!sessionId) return;
      
      // Set targetLanguage in localStorage to ensure the correct agent is used
      localStorage.setItem("targetLanguage", "french");
      
      await startElevenLabsConversation();
      setIsRecording(true);
      
      // Add initial message to the conversation - French specific
      const initialMessage = addInitialMessage();
      
      // We'll use a French-specific greeting for the initial message
      if (initialMessage && initialMessage.content === "Hello, I'd like to practice French with you.") {
        console.log("Starting French conversation");
      }
      
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive"
      });
    }
  };

  const clearConversation = () => {
    clearMessages();
    toast({
      title: t("success"),
      description: t("conversationHistoryCleared")
    });
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
    return <LoginPrompt />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <FrenchPageHeader />
      
      <CooldownMessage 
        cooldownTimeRemaining={cooldownTimeRemaining} 
        sessionStatus={sessionStatus} 
        formatCooldownTime={formatCooldownTime} 
      />

      <FrenchVoiceChatControls 
        startConversation={startConversation}
        isConversationActive={isConversationActive}
        weeklyTimeRemaining={weeklyTimeRemaining}
        sessionStatus={sessionStatus}
        formatTime={formatTimer}
      />
      
      <FrenchConversationStarters />

      <FrenchBenefitsList />
    </div>
  );
};

export default FrenchPremiumVoiceChat;

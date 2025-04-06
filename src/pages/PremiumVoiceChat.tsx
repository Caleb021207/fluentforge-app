
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";

// Import refactored components
import LoginPrompt from "@/components/premium-voice/LoginPrompt";
import CooldownMessage from "@/components/premium-voice/CooldownMessage";
import BenefitsList from "@/components/premium-voice/BenefitsList";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import PageHeader from "@/components/premium-voice/PageHeader";

type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};
type SessionStatus = 'available' | 'active' | 'cooldown';

const PremiumVoiceChat = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  
  const {
    microphoneAccess,
    voiceChatTimeRemaining,
    isConversationActive,
    formatTime,
    startVoiceConversation,
    endVoiceConversation,
    conversation,
    calculateRemainingWeeklyTime,
    getCurrentWeekStart
  } = useVoiceChat();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setIsLoading(false);
      if (data.session) {
        checkSessionStatus();
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthenticated = !!session;
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated) {
        checkSessionStatus();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSessionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSessionStatus('available');
        return;
      }
      
      const { data: activeSessions, error: activeError } = await supabase
        .from('premium_voice_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('session_end', null)
        .single();
      
      if (activeError && activeError.code !== 'PGRST116') {
        console.error("Error checking active sessions:", activeError);
      }
      
      if (activeSessions) {
        setCurrentSessionId(activeSessions.id);
        setSessionStatus('active');
        
        const sessionStartTime = new Date(activeSessions.session_start).getTime();
        const timeElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const remaining = await calculateRemainingWeeklyTime(user.id);
        setWeeklyTimeRemaining(remaining);
        
        if (remaining <= 0) {
          await endSession(activeSessions.id);
        }
        return;
      }
      
      const remaining = await calculateRemainingWeeklyTime(user.id);
      setWeeklyTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setSessionStatus('cooldown');
        
        const now = new Date();
        const nextMonday6AM = new Date(getCurrentWeekStart());
        nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7);
        const cooldownRemaining = Math.floor((nextMonday6AM.getTime() - now.getTime()) / 1000);
        setCooldownTimeRemaining(cooldownRemaining);
      } else {
        setSessionStatus('available');
        setCooldownTimeRemaining(null);
      }
      
    } catch (error) {
      console.error("Error checking session status:", error);
      setSessionStatus('available');
    }
  };

  useEffect(() => {
    let timerId: number | null = null;
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setWeeklyTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit5MinReached")
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isConversationActive(), voiceChatTimeRemaining]);

  useEffect(() => {
    let cooldownTimerId: number | null = null;
    if (sessionStatus === 'cooldown' && cooldownTimeRemaining !== null && cooldownTimeRemaining > 0) {
      cooldownTimerId = window.setInterval(() => {
        setCooldownTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (cooldownTimerId) clearInterval(cooldownTimerId);
            checkSessionStatus();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerId) clearInterval(cooldownTimerId);
    };
  }, [sessionStatus, cooldownTimeRemaining]);

  const formatCooldownTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h ${mins}m`;
  };

  const endSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('premium_voice_chat_sessions')
        .update({
          session_end: new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (error) {
        console.error("Error ending session:", error);
      }
      
      setCurrentSessionId(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        
        if (remaining <= 0) {
          setSessionStatus('cooldown');
          
          const now = new Date();
          const nextMonday6AM = new Date(getCurrentWeekStart());
          nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7);
          
          const cooldownRemaining = Math.floor((nextMonday6AM.getTime() - now.getTime()) / 1000);
          setCooldownTimeRemaining(cooldownRemaining);
        } else {
          setSessionStatus('available');
          setWeeklyTimeRemaining(remaining);
        }
      }
    } catch (error) {
      console.error("Error in endSession:", error);
    }
  };

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
      await startVoiceConversation();
      setIsRecording(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        setWeeklyTimeRemaining(remaining);
      }
      
      setSessionStatus('active');
      const initialUserMessage: VoiceMessage = {
        role: "user",
        content: currentLanguage === "english" 
          ? "Hello, I'd like to practice Spanish with you." 
          : currentLanguage === "mandarin"
            ? "你好，我想和你练习英语。"
            : "Hello, I'd like to practice English with you.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, initialUserMessage]);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive"
      });
    }
  };

  const endConversation = async () => {
    if (isConversationActive()) {
      await endVoiceConversation();
      setIsRecording(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        setWeeklyTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setSessionStatus('cooldown');
          
          const now = new Date();
          const nextMonday6AM = new Date(getCurrentWeekStart());
          nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7);
          
          const cooldownRemaining = Math.floor((nextMonday6AM.getTime() - now.getTime()) / 1000);
          setCooldownTimeRemaining(cooldownRemaining);
        } else {
          setSessionStatus('available');
        }
      }
    }
  };

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return {
        practice: "Spanish",
        native: "English"
      };
    } else if (currentLanguage === "spanish") {
      return {
        practice: "English",
        native: "Spanish"
      };
    } else if (currentLanguage === "portuguese") {
      return {
        practice: "English",
        native: "Portuguese"
      };
    } else if (currentLanguage === "korean") {
      return {
        practice: "English",
        native: "Korean"
      };
    } else if (currentLanguage === "arabic") {
      return {
        practice: "English",
        native: "Arabic"
      };
    } else if (currentLanguage === "mandarin") {
      return {
        practice: "English",
        native: "Mandarin"
      };
    } else if (currentLanguage === "vietnamese") {
      return {
        practice: "English",
        native: "Vietnamese"
      };
    } else if (currentLanguage === "hindi") {
      return {
        practice: "English",
        native: "Hindi"
      };
    }
    return {
      practice: "Spanish",
      native: "English"
    };
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared")
    });
  };

  const { practice, native } = getLanguagePair();

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
      <PageHeader practice={practice} />
      
      <CooldownMessage 
        cooldownTimeRemaining={cooldownTimeRemaining} 
        sessionStatus={sessionStatus} 
        formatCooldownTime={formatCooldownTime} 
      />

      <VoiceChatControls 
        startConversation={startConversation}
        isConversationActive={isConversationActive}
        weeklyTimeRemaining={weeklyTimeRemaining}
        sessionStatus={sessionStatus}
        formatTime={formatTime}
      />

      <BenefitsList />
    </div>
  );
};

export default PremiumVoiceChat;

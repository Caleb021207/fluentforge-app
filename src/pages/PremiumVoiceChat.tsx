
import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Headphones, Clock, LockIcon, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";

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
  const {
    toast
  } = useToast();
  const {
    currentLanguage,
    t
  } = useLocalization();
  const navigate = useNavigate();
  
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

  // Check if a session is currently active or if the user has time remaining for the week
  const checkSessionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSessionStatus('available');
        return;
      }
      
      // Check for active sessions
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
        
        // If time remaining is 0, end the session
        if (remaining <= 0) {
          await endSession(activeSessions.id);
        }
        return;
      }
      
      // Calculate remaining time for this week
      const remaining = await calculateRemainingWeeklyTime(user.id);
      setWeeklyTimeRemaining(remaining);
      
      if (remaining <= 0) {
        // All time used up for this week
        setSessionStatus('cooldown');
        
        // Calculate time until next Monday at 6 AM Central
        const now = new Date();
        const nextMonday6AM = new Date(getCurrentWeekStart());
        nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7); // Next Monday
        
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
            checkSessionStatus(); // Re-check status when cooldown expires
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
      
      // Check if weekly limit is reached
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        
        if (remaining <= 0) {
          setSessionStatus('cooldown');
          
          // Calculate time until next Monday at 6 AM Central
          const now = new Date();
          const nextMonday6AM = new Date(getCurrentWeekStart());
          nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7); // Next Monday
          
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

    // If already recording, stop it
    if (isConversationActive()) {
      await endConversation();
      return;
    }

    // Otherwise start a new conversation
    try {
      await startVoiceConversation();
      setIsRecording(true);
      
      // Get updated remaining time
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
      
      // Check if weekly limit is reached
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        setWeeklyTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setSessionStatus('cooldown');
          
          // Calculate time until next Monday at 6 AM Central
          const now = new Date();
          const nextMonday6AM = new Date(getCurrentWeekStart());
          nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7); // Next Monday
          
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

  const {
    practice,
    native
  } = getLanguagePair();

  const redirectToLogin = () => {
    navigate("/");
    toast({
      title: t("loginRequired"),
      description: t("redirectingToLogin")
    });
  };

  const renderLoginRequired = () => {
    return <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lingua-text mb-4">
            {t("premiumVoiceChat")}
          </h1>
          <p className="text-gray-600 mb-4">
            {t("premiumVoiceChatDescription", {
            practice
          })}
          </p>
        </div>
        
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <LogIn className="h-12 w-12 text-amber-600" />
            <h2 className="text-xl font-semibold text-amber-800">
              {t("loginRequired")}
            </h2>
            <p className="text-amber-700">
              {t("loginRequiredDescription")}
            </p>
            <Button onClick={redirectToLogin} className="bg-lingua-primary hover:bg-lingua-primary/90">
              {t("login")}
            </Button>
          </div>
        </Card>
      </div>;
  };

  const renderCooldownMessage = () => {
    if (sessionStatus === 'cooldown' && cooldownTimeRemaining) {
      return <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <LockIcon className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">
                {t("cooldownPeriodActive")}
              </h3>
              <p className="text-sm text-red-600">
                {t("resetsAt6AM", {
                time: formatCooldownTime(cooldownTimeRemaining)
              })}
              </p>
            </div>
          </div>
        </Card>;
    }
    return null;
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
        </div>
      </div>;
  }

  if (!isLoggedIn) {
    return renderLoginRequired();
  }

  return <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("premiumVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("premiumVoiceChatDescription", {
          practice
        })}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm font-normal">
            {t("premiumVoiceNoteWithReset")}
          </p>
        </div>
      </div>

      {renderCooldownMessage()}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button onClick={startConversation} variant={isConversationActive() ? "destructive" : "default"} className="bg-lingua-primary hover:bg-lingua-primary/90" disabled={sessionStatus === 'cooldown'}>
            {isConversationActive() ? <>
                <MicOff className="h-4 w-4 mr-2" />
                {t("stopVoiceChat")}
              </> : <>
                <Mic className="h-4 w-4 mr-2" />
                {t("startVoiceChat")}
              </>}
          </Button>
          
          {weeklyTimeRemaining !== null && weeklyTimeRemaining > 0 && (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{formatTime(weeklyTimeRemaining)} {t("remaining")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-3">
          {t("premiumVoiceChatBenefits")}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Volume2 className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>{t("benefitNaturalVoice")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Headphones className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>{t("benefitAccentPronunciation")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>{t("benefitRegularPractice")}</span>
          </li>
        </ul>
      </div>
    </div>;
};

export default PremiumVoiceChat;

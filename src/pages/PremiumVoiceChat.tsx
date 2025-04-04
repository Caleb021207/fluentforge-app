
import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Headphones, Clock, LockIcon, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { PremiumVoiceChatSession } from "@/types/supabase";
import { useNavigate } from "react-router-dom";

type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};
type SessionStatus = 'available' | 'active' | 'cooldown';

const PremiumVoiceChat = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const [dailyTimeUsed, setDailyTimeUsed] = useState(0);
  const [dailyTimeRemaining, setDailyTimeRemaining] = useState(300); // 5 minutes in seconds
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    currentLanguage,
    t
  } = useLocalization();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const {
        data
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setIsLoading(false);
      if (data.session) {
        checkSessionStatus();
      }
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
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

  const getAgentId = () => {
    return getAgentIdForLanguage(currentLanguage);
  };

  const conversation = useConversation({
    onMessage: message => {
      if (message.type === "llm_response") {
        const assistantMessage: VoiceMessage = {
          role: "assistant",
          content: message.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    },
    onError: error => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  const checkSessionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSessionStatus('available');
        return;
      }

      // Get the current date boundaries for today
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

      // Get all sessions for today
      const { data: sessions, error } = await supabase
        .from('premium_voice_chat_sessions')
        .select('session_start, session_end, duration_seconds')
        .eq('user_id', user.id)
        .gte('session_start', startOfDay)
        .lte('session_start', endOfDay);

      if (error) {
        console.error("Error fetching voice chat sessions:", error);
        setSessionStatus('available');
        return;
      }

      // Calculate total time used today
      let totalTimeUsed = 0;
      for (const session of sessions || []) {
        if (session.duration_seconds) {
          totalTimeUsed += session.duration_seconds;
        } else if (session.session_end) {
          const start = new Date(session.session_start).getTime();
          const end = new Date(session.session_end).getTime();
          totalTimeUsed += Math.round((end - start) / 1000);
        }
      }

      setDailyTimeUsed(totalTimeUsed);
      setDailyTimeRemaining(Math.max(0, 300 - totalTimeUsed));

      console.log(`Daily voice chat usage: ${totalTimeUsed} seconds, ${300 - totalTimeUsed} seconds remaining`);

      // Check if any session is still active (no end time)
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
        const remainingTimeForSession = Math.min(
          Math.max(0, 300 - totalTimeUsed),  // Daily remaining time
          Math.max(0, 300 - timeElapsed)     // Session remaining time (5 min max)
        );
        setVoiceChatTimeRemaining(remainingTimeForSession);
        
        if (remainingTimeForSession <= 0) {
          await endSession(activeSessions.id);
        }
      } else {
        // If daily limit reached, set to cooldown
        if (totalTimeUsed >= 300) {
          setSessionStatus('cooldown');
          setCooldownTimeRemaining(secondsUntilMidnight());
        } else {
          setSessionStatus('available');
        }
      }
    } catch (error) {
      console.error("Error checking session status:", error);
      setSessionStatus('available');
    }
  };

  // Calculate seconds until midnight
  const secondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive"
        });
      }
    };
    initMicrophone();
  }, [toast, t]);

  useEffect(() => {
    let timerId: number | null = null;
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setVoiceChatTimeRemaining(prev => {
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
            setSessionStatus('available');
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatCooldownTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return `${hours}h ${mins}m`;
  };

  const createSession = async (): Promise<string | null> => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive"
        });
        return null;
      }

      // First check if daily time is available
      if (dailyTimeRemaining <= 0) {
        toast({
          title: t("dailyLimitReached"),
          description: t("comeBackTomorrow"),
          variant: "destructive"
        });
        return null;
      }

      const {
        data,
        error
      } = await supabase.from('premium_voice_chat_sessions').insert({
        user_id: user.id
      }).select().single();
      
      if (error) {
        console.error("Error creating session:", error);
        toast({
          title: t("error"),
          description: t("failedToStartSession"),
          variant: "destructive"
        });
        return null;
      }
      return data.id;
    } catch (error) {
      console.error("Error in createSession:", error);
      return null;
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      // Calculate duration for this session
      const { data: session, error: fetchError } = await supabase
        .from('premium_voice_chat_sessions')
        .select('session_start')
        .eq('id', sessionId)
        .single();
      
      let durationSeconds = 0;
      if (!fetchError && session) {
        const startTime = new Date(session.session_start).getTime();
        durationSeconds = Math.round((Date.now() - startTime) / 1000);
      }
      
      const {
        error
      } = await supabase.from('premium_voice_chat_sessions').update({
        session_end: new Date().toISOString(),
        duration_seconds: durationSeconds
      }).eq('id', sessionId);
      
      if (error) {
        console.error("Error ending session:", error);
      }
      
      setCurrentSessionId(null);
      
      // Refresh the session status to check if we hit the daily limit
      checkSessionStatus();
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
    
    // Check if we've used up our daily time
    if (dailyTimeRemaining <= 0) {
      toast({
        title: t("dailyLimitReached"),
        description: t("comeBackTomorrow"),
        variant: "destructive"
      });
      return;
    }
    
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      const sessionId = await createSession();
      if (!sessionId) {
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "destructive"
        });
        return;
      }
      
      setCurrentSessionId(sessionId);
      const selectedAgentId = getAgentId();
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      if (isConversationActive()) {
        endConversation();
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const conversationId = await conversation.startSession({
        agentId: selectedAgentId
      });
      
      console.log(`Successfully started conversation session: ${conversationId}`);
      setIsRecording(true);
      
      // Set session time and time remaining
      const sessionDuration = Math.min(300, dailyTimeRemaining); // Can't exceed daily remaining time
      setVoiceChatTimeRemaining(sessionDuration);
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
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting")
      });
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive"
      });
    }
  };

  const endConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      setIsRecording(false);
      setVoiceChatTimeRemaining(null);
      
      if (currentSessionId) {
        await endSession(currentSessionId);
      }
      
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded")
      });
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
    if (dailyTimeRemaining <= 0) {
      return <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <LockIcon className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">
                {t("dailyLimitReached")}
              </h3>
              <p className="text-sm text-red-600">
                {t("dailyLimitDescription", {
                time: formatCooldownTime(cooldownTimeRemaining || secondsUntilMidnight())
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
            {t("premiumVoiceNote")}
          </p>
        </div>
      </div>

      {renderCooldownMessage()}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button 
            onClick={startConversation} 
            variant={isConversationActive() ? "destructive" : "default"} 
            className="bg-lingua-primary hover:bg-lingua-primary/90" 
            disabled={dailyTimeRemaining <= 0}
          >
            {isConversationActive() ? <>
                <MicOff className="h-4 w-4 mr-2" />
                {t("stopVoiceChat")}
              </> : <>
                <Mic className="h-4 w-4 mr-2" />
                {t("startVoiceChat")}
              </>}
          </Button>
          
          {voiceChatTimeRemaining !== null && voiceChatTimeRemaining > 0 && <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{formatTime(voiceChatTimeRemaining)}</span>
            </div>}
        </div>
        
        {/* Daily time usage indicator */}
        <div className="flex items-center gap-1 ml-auto text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
          <Clock className="h-4 w-4" />
          <span>{t("dailyRemaining")}: {formatTime(dailyTimeRemaining)}</span>
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

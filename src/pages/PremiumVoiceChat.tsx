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
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);
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
        const timeRemaining = Math.max(0, 300 - timeElapsed);
        
        setVoiceChatTimeRemaining(timeRemaining);
        
        if (timeRemaining <= 0) {
          await endSession(activeSessions.id);
        }
        return;
      }
      
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      
      const { data: recentSessions, error: recentError } = await supabase
        .from('premium_voice_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('session_end', 'is', null)
        .gte('session_end', oneDayAgo.toISOString())
        .order('session_end', { ascending: false })
        .limit(1)
        .single();
      
      if (recentError && recentError.code !== 'PGRST116') {
        console.error("Error checking recent sessions:", recentError);
      }
      
      if (recentSessions) {
        setSessionStatus('cooldown');
        
        const sessionEndTime = new Date(recentSessions.session_end).getTime();
        const cooldownEndTime = sessionEndTime + 24 * 60 * 60 * 1000;
        const cooldownRemaining = Math.max(0, Math.floor((cooldownEndTime - Date.now()) / 1000));
        
        setCooldownTimeRemaining(cooldownRemaining);
        
        if (cooldownRemaining <= 0) {
          setSessionStatus('available');
          setCooldownTimeRemaining(null);
        }
        return;
      }
      
      setSessionStatus('available');
      setCooldownTimeRemaining(null);
      
    } catch (error) {
      console.error("Error checking session status:", error);
      setSessionStatus('available');
    }
  };

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
      const {
        error
      } = await supabase.from('premium_voice_chat_sessions').update({
        session_end: new Date().toISOString()
      }).eq('id', sessionId);
      if (error) {
        console.error("Error ending session:", error);
      }
      setCurrentSessionId(null);
      setSessionStatus('cooldown');
      setCooldownTimeRemaining(24 * 60 * 60);
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
        description: t("waitBeforeNextSession"),
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
      setVoiceChatTimeRemaining(300);
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
    if (sessionStatus === 'cooldown' && cooldownTimeRemaining) {
      return <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <LockIcon className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">
                {t("cooldownPeriodActive")}
              </h3>
              <p className="text-sm text-red-600">
                {t("cooldownPeriodDescription", {
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
            {t("premiumVoiceNote")}
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
          
          {voiceChatTimeRemaining !== null && voiceChatTimeRemaining > 0 && <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{formatTime(voiceChatTimeRemaining)}</span>
            </div>}
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

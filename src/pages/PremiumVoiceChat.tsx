
import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Headphones, Clock, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { getAgentIdForLanguage } from "@/components/certifications/utils/elevenLabsUtils";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  const getAgentId = () => {
    return getAgentIdForLanguage(currentLanguage);
  };

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        const assistantMessage: VoiceMessage = {
          role: "assistant",
          content: message.content,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  // Check user's session status when component mounts
  useEffect(() => {
    checkSessionStatus();
    
    // Check session status every minute
    const intervalId = setInterval(checkSessionStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

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
        // There's an active session
        setCurrentSessionId(activeSessions.id);
        setSessionStatus('active');
        
        // Calculate time remaining in current session
        const sessionStartTime = new Date(activeSessions.session_start).getTime();
        const timeElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const timeRemaining = Math.max(0, 300 - timeElapsed); // 5 minutes = 300 seconds
        
        setVoiceChatTimeRemaining(timeRemaining);
        
        // If time is up but session wasn't properly closed, close it now
        if (timeRemaining <= 0) {
          await endSession(activeSessions.id);
        }
        
        return;
      }
      
      // Check for recent completed sessions
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
        // There's a recent session, user is in cooldown
        setSessionStatus('cooldown');
        
        // Calculate cooldown time remaining
        const sessionEndTime = new Date(recentSessions.session_end).getTime();
        const cooldownEndTime = sessionEndTime + (24 * 60 * 60 * 1000); // 24 hours after session end
        const cooldownRemaining = Math.max(0, Math.floor((cooldownEndTime - Date.now()) / 1000));
        
        setCooldownTimeRemaining(cooldownRemaining);
        
        // If cooldown is over, set status to available
        if (cooldownRemaining <= 0) {
          setSessionStatus('available');
          setCooldownTimeRemaining(null);
        }
        
        return;
      }
      
      // No active or recent sessions
      setSessionStatus('available');
      setCooldownTimeRemaining(null);
      
    } catch (error) {
      console.error("Error checking session status:", error);
      // Default to available in case of error
      setSessionStatus('available');
    }
  };

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
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
                description: t("timeLimit5MinReached"),
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

  // Cooldown timer effect
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
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // Create a new session record in the database
  const createSession = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive",
        });
        return null;
      }
      
      const { data, error } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: user.id,
          session_start: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating session:", error);
        toast({
          title: t("error"),
          description: t("failedToStartSession"),
          variant: "destructive",
        });
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error in createSession:", error);
      return null;
    }
  };

  // End the session by updating the session_end timestamp
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
      
      // Clear the current session ID
      setCurrentSessionId(null);
      
      // Update session status
      setSessionStatus('cooldown');
      setCooldownTimeRemaining(24 * 60 * 60); // 24 hours in seconds
      
    } catch (error) {
      console.error("Error in endSession:", error);
    }
  };

  const startConversation = async () => {
    // If in cooldown, don't allow starting
    if (sessionStatus === 'cooldown') {
      toast({
        title: t("cooldownActive"),
        description: t("waitBeforeNextSession"),
        variant: "destructive",
      });
      return;
    }

    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Create a new session in the database
      const sessionId = await createSession();
      
      if (!sessionId) {
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "destructive",
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
        agentId: selectedAgentId,
      });
      
      console.log(`Successfully started conversation session: ${conversationId}`);
      setIsRecording(true);
      setVoiceChatTimeRemaining(300); // 5 minutes
      setSessionStatus('active');
      
      // Add initial user message to the conversation
      const initialUserMessage: VoiceMessage = {
        role: "user",
        content: currentLanguage === "english" 
          ? "Hello, I'd like to practice Spanish with you."
          : "Hello, I'd like to practice English with you.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, initialUserMessage]);
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      setIsRecording(false);
      setVoiceChatTimeRemaining(null);
      
      // End the database session if we have an active session ID
      if (currentSessionId) {
        await endSession(currentSessionId);
      }
      
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return { practice: "Spanish", native: "English" };
    } else if (currentLanguage === "spanish") {
      return { practice: "English", native: "Spanish" };
    } else if (currentLanguage === "portuguese") {
      return { practice: "English", native: "Portuguese" };
    }
    return { practice: "Spanish", native: "English" };
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: t("Success"),
      description: "Conversation history has been cleared",
    });
  };

  const { practice, native } = getLanguagePair();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("premiumVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Have natural voice conversations with our premium AI tutor to practice your ${practice}! The AI will help correct your grammar, vocabulary, and pronunciation.`
            : currentLanguage === "spanish"
              ? `¡Mantén conversaciones de voz naturales con nuestro tutor de IA premium para practicar tu ${practice}! La IA te ayudará a corregir tu gramática, vocabulario y pronunciación.`
              : `Tenha conversas de voz naturais com nosso tutor de IA premium para praticar seu ${practice}! A IA irá ajudá-lo a corrigir sua gramática, vocabulário e pronúncia.`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: Premium voice conversations use ElevenLabs realistic voice technology. There is a 5-minute conversational limit per session and a 24-hour cooldown period after each session."
              : currentLanguage === "spanish"
                ? "Nota: Las conversaciones de voz premium utilizan la tecnología de voz realista de ElevenLabs. Hay un límite de conversación de 5 minutos por sesión y un período de enfriamiento de 24 horas después de cada sesión."
                : "Nota: As conversas de voz premium usam a tecnologia de voz realista da ElevenLabs. Há um limite de conversação de 5 minutos por sessão e um período de espera de 24 horas após cada sessão."}
          </p>
        </div>
      </div>

      {sessionStatus === 'cooldown' && cooldownTimeRemaining && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <LockIcon className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">
                {t("cooldownPeriodActive") || "Cooldown Period Active"}
              </h3>
              <p className="text-sm text-red-600">
                {currentLanguage === "english"
                  ? `You need to wait ${formatCooldownTime(cooldownTimeRemaining)} before starting another premium voice chat session.`
                  : currentLanguage === "spanish"
                    ? `Debes esperar ${formatCooldownTime(cooldownTimeRemaining)} antes de iniciar otra sesión premium de chat de voz.`
                    : `Você precisa aguardar ${formatCooldownTime(cooldownTimeRemaining)} antes de iniciar outra sessão premium de chat de voz.`}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={startConversation}
            variant={isConversationActive() ? "destructive" : "default"}
            className="bg-lingua-primary hover:bg-lingua-primary/90"
            disabled={sessionStatus === 'cooldown'}
          >
            {isConversationActive() ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                {t("stopVoiceChat")}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {t("startVoiceChat")}
              </>
            )}
          </Button>
          
          {voiceChatTimeRemaining !== null && voiceChatTimeRemaining > 0 && (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{formatTime(voiceChatTimeRemaining)}</span>
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
            <span>
              {currentLanguage === "english"
                ? "Natural, human-like voice interactions using ElevenLabs technology"
                : currentLanguage === "spanish"
                  ? "Interacciones de voz naturales y humanas utilizando la tecnología de ElevenLabs"
                  : "Interações de voz naturais e humanas usando a tecnologia ElevenLabs"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Headphones className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>
              {currentLanguage === "english"
                ? "Accurate accent and pronunciation for immersive learning"
                : currentLanguage === "spanish"
                  ? "Acento y pronunciación precisos para un aprendizaje inmersivo"
                  : "Sotaque e pronúncia precisos para aprendizado imersivo"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>
              {currentLanguage === "english"
                ? "5-minute sessions with a 24-hour cooldown to encourage regular, focused practice"
                : currentLanguage === "spanish"
                  ? "Sesiones de 5 minutos con un tiempo de espera de 24 horas para fomentar una práctica regular y concentrada"
                  : "Sessões de 5 minutos com um período de espera de 24 horas para incentivar prática regular e focada"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PremiumVoiceChat;

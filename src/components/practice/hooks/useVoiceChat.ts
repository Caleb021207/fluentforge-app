
import { useState, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/components/ui/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { supabase } from "@/integrations/supabase/client";

export const useVoiceChat = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const [dailyTimeUsed, setDailyTimeUsed] = useState(0);
  const [dailyTimeRemaining, setDailyTimeRemaining] = useState(300); // 5 minutes in seconds
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        // Handle LLM response here if needed
        console.log("LLM response received:", message.content);
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

  // Initialize microphone access
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

  // Check daily time usage when component mounts
  useEffect(() => {
    checkDailyUsage();
  }, []);

  // Track active session time
  useEffect(() => {
    let timerId: number | null = null;
    
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setVoiceChatTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endVoiceConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit5MinReached"),
              });
            }
            return null;
          }
          return prev - 1;
        });

        // Also decrease daily time remaining
        setDailyTimeRemaining(prev => {
          if (prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endVoiceConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("dailyTimeLimitReached"),
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const checkDailyUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User not authenticated, cannot check daily usage");
        setDailyTimeUsed(0);
        setDailyTimeRemaining(300);
        return;
      }

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
    } catch (error) {
      console.error("Error checking daily usage:", error);
    }
  };

  const startVoiceConversation = async () => {
    if (dailyTimeRemaining <= 0) {
      toast({
        title: t("dailyLimitReached"),
        description: t("comeBackTomorrow"),
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
      const selectedAgentId = getAgentIdForLanguage(currentLanguage);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      if (isConversationActive()) {
        endVoiceConversation();
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const sessionId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      console.log(`Successfully started conversation session: ${sessionId}`);
      
      // Set the session start time for tracking
      setSessionStartTime(Date.now());
      
      // Calculate the session duration based on daily remaining time
      const sessionDuration = Math.min(300, dailyTimeRemaining);
      setVoiceChatTimeRemaining(sessionDuration);
      
      // Create session record in database
      await createSessionRecord();
      
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

  const createSessionRecord = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated, cannot create session record");
        return;
      }
      
      const { data, error } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: user.id,
          session_start: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating session record:", error);
      } else {
        console.log("Created session record:", data);
        return data.id;
      }
    } catch (error) {
      console.error("Error in createSessionRecord:", error);
    }
    
    return null;
  };

  const endVoiceConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      
      // Calculate the duration of this session
      let sessionDuration = 0;
      if (sessionStartTime) {
        sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        setSessionStartTime(null);
      }
      
      // Update the session record in the database
      await updateSessionRecord(sessionDuration);
      
      // Update daily usage
      await checkDailyUsage();
      
      setVoiceChatTimeRemaining(null);
      
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  const updateSessionRecord = async (durationSeconds: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated, cannot update session record");
        return;
      }
      
      // Get the most recent unfinished session
      const { data: sessions, error: fetchError } = await supabase
        .from('premium_voice_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('session_end', null)
        .order('session_start', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        console.error("Error fetching session to update:", fetchError);
        return;
      }
      
      if (sessions && sessions.length > 0) {
        const sessionId = sessions[0].id;
        
        const { error: updateError } = await supabase
          .from('premium_voice_chat_sessions')
          .update({
            session_end: new Date().toISOString(),
            duration_seconds: durationSeconds
          })
          .eq('id', sessionId);
        
        if (updateError) {
          console.error("Error updating session record:", updateError);
        } else {
          console.log(`Updated session ${sessionId} with duration: ${durationSeconds} seconds`);
        }
      }
    } catch (error) {
      console.error("Error in updateSessionRecord:", error);
    }
  };

  return {
    microphoneAccess,
    voiceChatTimeRemaining,
    dailyTimeUsed,
    dailyTimeRemaining,
    isConversationActive,
    formatTime,
    startVoiceConversation,
    endVoiceConversation,
    conversation
  };
};


import { useState, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { supabase } from "@/integrations/supabase/client";

export const useVoiceChat = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
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

  // Get the start of the current week (Monday at 6 AM Central Time)
  const getCurrentWeekStart = (): Date => {
    const now = new Date();
    
    // Convert to Central Time (UTC-6 or UTC-5 depending on daylight saving)
    // This is a simplification - in production, use a proper time library like date-fns-tz
    const centralTimeOffset = -6; // Central Standard Time (adjust for daylight saving if needed)
    const utcHours = now.getUTCHours();
    const centralHours = (utcHours + centralTimeOffset + 24) % 24;
    
    // Calculate days since last Monday
    const dayOfWeek = now.getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Create a date for the most recent Monday at 6 AM Central Time
    const monday = new Date(now);
    monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
    monday.setUTCHours(6 - centralTimeOffset, 0, 0, 0); // 6 AM Central Time in UTC
    
    // If current time is before Monday 6 AM, use previous week's Monday
    if (now < monday) {
      monday.setUTCDate(monday.getUTCDate() - 7);
    }
    
    return monday;
  };

  const calculateRemainingWeeklyTime = async (userId: string): Promise<number> => {
    // Get the start of the current week at Monday 6 AM Central Time
    const weekStart = getCurrentWeekStart();
    
    try {
      // Get all sessions since the start of the week
      const { data, error } = await supabase
        .from('premium_voice_chat_sessions')
        .select('session_start, session_end')
        .eq('user_id', userId)
        .gte('session_start', weekStart.toISOString());
      
      if (error) {
        console.error("Error fetching session data:", error);
        return 900; // Default to full time (15 minutes) if error
      }
      
      if (!data || data.length === 0) {
        return 900; // No sessions this week, full time available (15 minutes)
      }
      
      // Calculate total time used this week
      let totalTimeUsedSeconds = 0;
      
      data.forEach(session => {
        const start = new Date(session.session_start).getTime();
        const end = session.session_end ? new Date(session.session_end).getTime() : Date.now();
        const sessionDuration = Math.floor((end - start) / 1000);
        totalTimeUsedSeconds += sessionDuration;
      });
      
      // Calculate remaining time (cap at 0 if all used)
      const remainingTime = Math.max(0, 900 - totalTimeUsedSeconds); // 15 minutes = 900 seconds
      return remainingTime;
      
    } catch (error) {
      console.error("Error in calculateRemainingWeeklyTime:", error);
      return 900; // Default to full time if error
    }
  };

  const startVoiceConversation = async () => {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive",
        });
        return;
      }
      
      // Check if there's an active session
      if (isConversationActive()) {
        endVoiceConversation();
        return;
      }
      
      // Calculate remaining time for the week
      const remainingTime = await calculateRemainingWeeklyTime(user.id);
      
      if (remainingTime <= 0) {
        // All time used up for the week
        toast({
          title: t("cooldownActive"),
          description: t("dailyLimitReached"),
          variant: "destructive",
        });
        return;
      }
      
      // Create a new session
      const { data: sessionData, error: sessionError } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: user.id
        })
        .select()
        .single();
        
      if (sessionError) {
        console.error("Error creating session:", sessionError);
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "destructive",
        });
        return;
      }

      const selectedAgentId = getAgentIdForLanguage(currentLanguage);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const sessionId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      console.log(`Successfully started conversation session: ${sessionId}`);
      
      // Set the time remaining to the calculated remaining time
      setVoiceChatTimeRemaining(remainingTime);
      
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

  const endVoiceConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      
      // Update the session end time
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Find the most recent active session
          const { data: activeSession, error: findError } = await supabase
            .from('premium_voice_chat_sessions')
            .select('id')
            .eq('user_id', user.id)
            .is('session_end', null)
            .order('session_start', { ascending: false })
            .limit(1)
            .single();
            
          if (!findError && activeSession) {
            await supabase
              .from('premium_voice_chat_sessions')
              .update({ session_end: new Date().toISOString() })
              .eq('id', activeSession.id);
          }
        }
      } catch (error) {
        console.error("Error updating session end time:", error);
      }
      
      setVoiceChatTimeRemaining(null);
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  return {
    microphoneAccess,
    voiceChatTimeRemaining,
    isConversationActive,
    formatTime,
    startVoiceConversation,
    endVoiceConversation,
    conversation,
    calculateRemainingWeeklyTime,
    getCurrentWeekStart
  };
};

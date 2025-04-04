
import { useState, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/components/ui/use-toast";
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

  const calculateRemainingDailyTime = async (userId: string): Promise<number> => {
    // Get the start of today at 6 AM
    const today = new Date();
    const todayAt6AM = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0, 0);
    
    // If current time is before 6 AM, use previous day's 6 AM
    if (today < todayAt6AM) {
      todayAt6AM.setDate(todayAt6AM.getDate() - 1);
    }
    
    try {
      // Get all sessions since today at 6 AM
      const { data, error } = await supabase
        .from('premium_voice_chat_sessions')
        .select('session_start, session_end')
        .eq('user_id', userId)
        .gte('session_start', todayAt6AM.toISOString());
      
      if (error) {
        console.error("Error fetching session data:", error);
        return 300; // Default to full time if error
      }
      
      if (!data || data.length === 0) {
        return 300; // No sessions today, full time available
      }
      
      // Calculate total time used today
      let totalTimeUsedSeconds = 0;
      
      data.forEach(session => {
        const start = new Date(session.session_start).getTime();
        const end = session.session_end ? new Date(session.session_end).getTime() : Date.now();
        const sessionDuration = Math.floor((end - start) / 1000);
        totalTimeUsedSeconds += sessionDuration;
      });
      
      // Calculate remaining time (cap at 0 if all used)
      const remainingTime = Math.max(0, 300 - totalTimeUsedSeconds);
      return remainingTime;
      
    } catch (error) {
      console.error("Error in calculateRemainingDailyTime:", error);
      return 300; // Default to full time if error
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
      
      // Calculate remaining time for today
      const remainingTime = await calculateRemainingDailyTime(user.id);
      
      if (remainingTime <= 0) {
        // All time used up for today
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
    calculateRemainingDailyTime
  };
};

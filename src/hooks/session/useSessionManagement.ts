
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionStatus, SessionStatus } from "./useSessionStatus";
import { useSessionTimer } from "./useSessionTimer";
import { formatCooldownTime } from "@/utils/voiceChatUtils";

export const useSessionManagement = (t: (key: string, options?: any) => string) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoggedIn, isLoading, sessionStatus, setSessionStatus } = useSessionStatus(t);
  const { weeklyTimeRemaining, cooldownTimeRemaining, updateTimeRemaining, setWeeklyTimeRemaining, setCooldownTimeRemaining } = useSessionTimer(isLoggedIn ? (supabase.auth.getUser() as any).data?.user?.id : null);

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
        await updateTimeRemaining();
        
        if (weeklyTimeRemaining !== null && weeklyTimeRemaining <= 0) {
          await endSession(activeSessions.id);
        }
        return;
      }
      
      await updateTimeRemaining();
      
      if (weeklyTimeRemaining !== null && weeklyTimeRemaining <= 0) {
        setSessionStatus('cooldown');
      } else {
        setSessionStatus('available');
      }
      
    } catch (error) {
      console.error("Error checking session status:", error);
      setSessionStatus('available');
    }
  };

  const createSession = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("loginRequired"),
          description: t("pleaseLoginToAccessPremiumFeature"),
          variant: "destructive"
        });
        return null;
      }

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
          variant: "destructive"
        });
        return null;
      }

      setCurrentSessionId(sessionData.id);
      setSessionStatus('active');
      await updateTimeRemaining();
      
      return sessionData.id;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
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
      await updateTimeRemaining();
    } catch (error) {
      console.error("Error in endSession:", error);
    }
  };

  return {
    isLoggedIn,
    isLoading,
    sessionStatus,
    currentSessionId,
    weeklyTimeRemaining,
    cooldownTimeRemaining,
    setWeeklyTimeRemaining,
    checkSessionStatus,
    createSession,
    endSession,
    formatCooldownTime
  };
};

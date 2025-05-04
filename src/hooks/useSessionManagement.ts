import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useLocalization } from "@/hooks/useLocalization";

interface SessionData {
  session_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  minutes_used: number;
  weekly_minutes_remaining: number;
  status: 'active' | 'ended';
}

export const useSessionManagement = () => {
  const { t } = useLocalization();
  const { isLoggedIn } = useAuthStatus();
  const { toast } = useToast();
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number>(0);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'ended'>('ended');
  const [isLoading, setIsLoading] = useState(true);

  const loadSessionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWeeklyTimeRemaining(0);
        setSessionStatus('ended');
        return;
      }

      const { data: sessionData, error } = await supabase
        .from('premium_voice_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching session data:", error);
        setWeeklyTimeRemaining(0);
        setSessionStatus('ended');
        return;
      }

      if (sessionData) {
        setWeeklyTimeRemaining(sessionData.weekly_minutes_remaining);
        setSessionStatus(sessionData.status);
      } else {
        setWeeklyTimeRemaining(10);
        setSessionStatus('ended');
      }
    } catch (error: any) {
      console.error("Unexpected error loading session data:", error);
      toast({
        title: t("error"),
        description: t("couldNotLoadSessionData"),
        variant: "destructive",
      });
      setWeeklyTimeRemaining(0);
      setSessionStatus('ended');
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    if (isLoggedIn) {
      loadSessionData();
    } else {
      setIsLoading(false);
      setWeeklyTimeRemaining(0);
      setSessionStatus('ended');
    }
  }, [isLoggedIn, loadSessionData]);

  const createSession = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('start_premium_voice_session', { user_id: user.id });

      if (error) throw error;

      const session = data as unknown as SessionData;

      setWeeklyTimeRemaining(session.weekly_minutes_remaining);
      setSessionStatus('active');
      toast({
        title: t("sessionStarted"),
        description: t("enjoyYourVoicePractice"),
      });
    } catch (error: any) {
      console.error("Error starting session:", error);
      toast({
        title: t("error"),
        description: error.message || t("couldNotStartSession"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .rpc('end_premium_voice_session', { user_id: user.id });

      if (error) throw error;

      const session = data as unknown as SessionData;

      setWeeklyTimeRemaining(session.weekly_minutes_remaining);
      setSessionStatus('ended');
      toast({
        title: t("sessionEnded"),
        description: t("minutesUpdated"),
      });
    } catch (error: any) {
      console.error("Error ending session:", error);
      toast({
        title: t("error"),
        description: error.message || t("couldNotEndSession"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    weeklyTimeRemaining,
    isLoading,
    isLoggedIn,
    sessionStatus,
    createSession,
    endSession
  };
};

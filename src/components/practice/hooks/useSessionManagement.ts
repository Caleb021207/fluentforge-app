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
  status: 'active' | 'ended';
}

export const useSessionManagement = () => {
  const { t } = useLocalization();
  const { isLoggedIn } = useAuthStatus();
  const { toast } = useToast();
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number>(0);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'active' | 'ended'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);

  const fetchWeeklyTimeRemaining = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('premium_minutes')
        .eq('id', supabase.auth.currentUser?.id)
        .single();

      if (error) {
        throw error;
      }

      setWeeklyTimeRemaining(data?.premium_minutes || 0);
    } catch (error: any) {
      console.error("Error fetching weekly time remaining:", error);
      toast({
        title: t("error"),
        description: t("couldNotFetchTimeRemaining"),
        variant: "destructive",
      });
      setWeeklyTimeRemaining(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, supabase, toast, t]);

  const createSession = useCallback(async () => {
    if (!isLoggedIn || sessionStatus === 'active') return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('start_premium_session');

      if (error) {
        throw error;
      }

      const newSession = data as unknown as SessionData;

      setActiveSession(newSession);
      setSessionStatus('active');
      setWeeklyTimeRemaining(prev => Math.max(0, prev - 1));

      toast({
        title: t("sessionStarted"),
        description: t("enjoyYourPractice"),
      });
    } catch (error: any) {
      console.error("Error starting premium session:", error);
      toast({
        title: t("error"),
        description: t("couldNotStartSession") + ": " + error.message,
        variant: "destructive",
      });
      setSessionStatus('idle');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, sessionStatus, supabase, toast, t]);

  const endSession = useCallback(async () => {
    if (!isLoggedIn || sessionStatus !== 'active') return;

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('end_premium_session');

      if (error) {
        throw error;
      }

      setActiveSession(null);
      setSessionStatus('ended');
      await fetchWeeklyTimeRemaining();

      toast({
        title: t("sessionEnded"),
        description: t("sessionEndedSuccessfully"),
      });
    } catch (error: any) {
      console.error("Error ending premium session:", error);
      toast({
        title: t("error"),
        description: t("couldNotEndSession") + ": " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeeklyTimeRemaining, isLoggedIn, sessionStatus, supabase, toast, t]);

  useEffect(() => {
    fetchWeeklyTimeRemaining();
  }, [fetchWeeklyTimeRemaining]);

  return {
    weeklyTimeRemaining,
    isLoading,
    isLoggedIn,
    sessionStatus,
    createSession,
    endSession
  };
};

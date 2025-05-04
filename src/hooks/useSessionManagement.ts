
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { SessionStatus } from "@/types/chat";

export const useSessionManagement = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSessionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWeeklyTimeRemaining(0);
        setSessionStatus('available');
        return;
      }

      // For now, simulate session data since we don't have the actual table
      // We would normally query the premium_voice_sessions table
      setWeeklyTimeRemaining(10); // Default 10 minutes
      setSessionStatus('available');

    } catch (error) {
      console.error("Unexpected error loading session data:", error);
      toast({
        title: t("error"),
        description: t("couldNotLoadSessionData"),
        variant: "destructive"
      });
      setWeeklyTimeRemaining(0);
      setSessionStatus('available');
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
      setSessionStatus('available');
    }
  }, [isLoggedIn, loadSessionData]);

  const createSession = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // This would typically be an RPC call to start_premium_voice_session
      // For now, simulate a session start
      console.log("Creating premium voice session for user:", user.id);
      
      setWeeklyTimeRemaining(prev => prev ? prev - 1 : 9);
      setSessionStatus('active');
      
      toast({
        title: t("sessionStarted"),
        description: t("enjoyYourVoicePractice")
      });
      
    } catch (error: any) {
      console.error("Error starting session:", error);
      toast({
        title: t("error"),
        description: error.message || t("couldNotStartSession"),
        variant: "destructive"
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
      
      // This would typically be an RPC call to end_premium_voice_session
      // For now, simulate a session end
      console.log("Ending premium voice session for user:", user.id);
      
      setSessionStatus('available');
      
      toast({
        title: t("sessionEnded"),
        description: t("minutesUpdated")
      });
      
    } catch (error: any) {
      console.error("Error ending session:", error);
      toast({
        title: t("error"),
        description: error.message || t("couldNotEndSession"),
        variant: "destructive"
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


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { SessionStatus } from "../types";

export const useVoiceSession = () => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setIsLoading(false);
      if (data.session) {
        checkSessionStatus();
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const createSession = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive"
        });
        return null;
      }
      
      const { data, error } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: user.id
        })
        .select()
        .single();
        
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
      setSessionStatus('cooldown');
      setCooldownTimeRemaining(24 * 60 * 60);
    } catch (error) {
      console.error("Error in endSession:", error);
    }
  };

  const formatCooldownTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return `${hours}h ${mins}m`;
  };

  return {
    sessionStatus,
    cooldownTimeRemaining,
    currentSessionId,
    isLoggedIn,
    isLoading,
    setCurrentSessionId,
    setSessionStatus,
    setCooldownTimeRemaining,
    checkSessionStatus,
    createSession,
    endSession,
    formatCooldownTime
  };
};

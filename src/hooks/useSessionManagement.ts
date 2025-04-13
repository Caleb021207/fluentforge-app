
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateRemainingWeeklyTime, 
  getCurrentWeekStart, 
  formatCooldownTime 
} from "@/utils/voiceChatUtils";
import { getUserTier, hasPremiumVoiceAccess } from "@/utils/tierUtils";

export type SessionStatus = 'available' | 'active' | 'cooldown' | 'unauthorized';

export const useSessionManagement = (t: (key: string, options?: any) => string) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<number>(1);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setIsLoading(false);
      if (data.session) {
        await getUserTierInfo(data.session.user.id);
        checkSessionStatus();
      }
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthenticated = !!session;
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated && session) {
        getUserTierInfo(session.user.id);
        checkSessionStatus();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserTierInfo = async (userId: string) => {
    try {
      const tier = await getUserTier(userId);
      setUserTier(tier);
      return tier;
    } catch (error) {
      console.error("Error getting user tier:", error);
      setUserTier(1);
      return 1;
    }
  };

  const checkSessionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSessionStatus('available');
        return;
      }
      
      // Check user's tier for access
      const tier = await getUserTierInfo(user.id);
      const hasAccess = hasPremiumVoiceAccess(tier);
      
      if (!hasAccess) {
        setSessionStatus('unauthorized');
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
        
        const remaining = await calculateRemainingWeeklyTime(user.id);
        setWeeklyTimeRemaining(remaining);
        
        if (remaining <= 0) {
          await endSession(activeSessions.id);
        }
        return;
      }
      
      const remaining = await calculateRemainingWeeklyTime(user.id);
      setWeeklyTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setSessionStatus('cooldown');
        
        const now = new Date();
        const nextMonday6AM = new Date(getCurrentWeekStart());
        nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7);
        const cooldownRemaining = Math.floor((nextMonday6AM.getTime() - now.getTime()) / 1000);
        setCooldownTimeRemaining(cooldownRemaining);
      } else {
        setSessionStatus('available');
        setCooldownTimeRemaining(null);
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

      // Check user's tier for access
      const tier = await getUserTierInfo(user.id);
      const hasAccess = hasPremiumVoiceAccess(tier);
      
      if (!hasAccess) {
        toast({
          title: t("premiumFeatureRestricted"),
          description: t("upgradeTierForAccess"),
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
      
      const remaining = await calculateRemainingWeeklyTime(user.id);
      setWeeklyTimeRemaining(remaining);
      
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        
        if (remaining <= 0) {
          setSessionStatus('cooldown');
          
          const now = new Date();
          const nextMonday6AM = new Date(getCurrentWeekStart());
          nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7);
          
          const cooldownRemaining = Math.floor((nextMonday6AM.getTime() - now.getTime()) / 1000);
          setCooldownTimeRemaining(cooldownRemaining);
        } else {
          setSessionStatus('available');
          setWeeklyTimeRemaining(remaining);
        }
      }
    } catch (error) {
      console.error("Error in endSession:", error);
    }
  };

  useEffect(() => {
    let cooldownTimerId: number | null = null;
    if (sessionStatus === 'cooldown' && cooldownTimeRemaining !== null && cooldownTimeRemaining > 0) {
      cooldownTimerId = window.setInterval(() => {
        setCooldownTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (cooldownTimerId) clearInterval(cooldownTimerId);
            checkSessionStatus();
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

  return {
    isLoggedIn,
    isLoading,
    sessionStatus,
    currentSessionId,
    weeklyTimeRemaining,
    cooldownTimeRemaining,
    userTier,
    setWeeklyTimeRemaining,
    checkSessionStatus,
    createSession,
    endSession,
    formatCooldownTime,
    getUserTierInfo
  };
};

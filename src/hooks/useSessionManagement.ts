
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { MessageCount, SessionStatus } from "@/types/chat";
import { calculateRemainingMonthlyTime } from "@/utils/voiceChatUtils";
import { useUsageLimits } from "@/hooks/useUsageLimits";

export const useSessionManagement = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState<MessageCount>({ inputs: 0, outputs: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('available');
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { t } = useLocalization();
  const { usageLimits, checkCanStartVoiceSession, trackVoiceSession } = useUsageLimits();

  // Check auth and calculate remaining time on mount
  useEffect(() => {
    const checkAuthAndTime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        
        if (user) {
          const remainingTime = await calculateRemainingMonthlyTime(user.id);
          setWeeklyTimeRemaining(remainingTime);
          
          try {
            const { error: recalcError } = await supabase.rpc('recalculate_student_metrics', { 
              target_student_id: user.id 
            });
            
            if (recalcError) {
              console.error('Error recalculating metrics:', recalcError);
              toast({
                title: t("error"),
                description: t("metricsUpdateFailed"),
                variant: "destructive",
              });
            }
          } catch (recalcError) {
            console.error('Exception recalculating metrics:', recalcError);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndTime();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        const remainingTime = await calculateRemainingMonthlyTime(session.user.id);
        setWeeklyTimeRemaining(remainingTime);
      } else {
        setWeeklyTimeRemaining(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, t]);

  const createSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create the session using the correct api_calls_tracking table structure
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: user.id,
          service: 'premium_voice',
          endpoint: 'session_start'
        });

      setSessionStatus('active');
      console.log('Created premium voice session for:', user.id);
      
      // Update the remaining time immediately after creating a session
      const remainingTime = await calculateRemainingMonthlyTime(user.id);
      setWeeklyTimeRemaining(remainingTime);

    } catch (error: any) {
      console.error('Error creating voice session:', error);
      toast({
        title: t("error"),
        description: t("failedToCreateSession"),
        variant: "warning",
      });
      setSessionStatus('available' as SessionStatus);
    }
  };

  const endSession = async (): Promise<boolean> => {
    try {
      setSessionStatus('available' as SessionStatus);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.rpc('recalculate_student_metrics', { 
        target_student_id: user.id 
      });

      if (error) {
        console.error('Error recalculating metrics:', error);
        return false;
      }

      // Update remaining time after ending session
      const remainingTime = await calculateRemainingMonthlyTime(user.id);
      setWeeklyTimeRemaining(remainingTime);

      return true;
    } catch (error: any) {
      console.error('Error ending session:', error);
      toast({
        title: t("error"),
        description: t("failedToEndSession"),
        variant: "warning",
      });
      return false;
    }
  };

  const formatCooldownTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  return {
    messageCount,
    setMessageCount,
    isLoggedIn,
    isLoading,
    sessionStatus,
    weeklyTimeRemaining,
    cooldownTimeRemaining,
    setWeeklyTimeRemaining,
    createSession,
    endSession,
    formatCooldownTime
  };
};

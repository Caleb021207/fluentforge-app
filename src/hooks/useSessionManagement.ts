
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { MessageCount, SessionStatus } from "@/types/chat";

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

  // Check authentication and initialize session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        
        if (user) {
          // Force a recalculation of metrics
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

    checkAuth();
  }, [toast, t]);

  // Create a new session
  const createSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track this as a voice practice API call
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: user.id,
          call_type: 'premium_voice'
        });

      setSessionStatus('active');
      console.log('Created premium voice session for:', user.id);
      
      // Force a recalculation of metrics
      await supabase.rpc('recalculate_student_metrics', { 
        target_student_id: user.id 
      });

    } catch (error: any) {
      console.error('Error creating voice session:', error);
      toast({
        title: t("error"),
        description: t("failedToCreateSession"),
        variant: "warning",
      });
      setSessionStatus('available');
    }
  };

  // End the current session
  const endSession = async () => {
    try {
      setSessionStatus('available');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Force a recalculation of metrics
      await supabase.rpc('recalculate_student_metrics', { 
        target_student_id: user.id 
      });

    } catch (error: any) {
      console.error('Error ending session:', error);
      toast({
        title: t("error"),
        description: t("failedToEndSession"),
        variant: "warning",
      });
    }
  };

  // Format cooldown time
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

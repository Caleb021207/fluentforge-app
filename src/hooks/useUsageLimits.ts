import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsageLimits {
  voiceMinutesLimit: number;
  voiceMinutesUsed: number;
  voiceMinutesRemaining: number;
  textMessagesUsed: number;
  certificationAttemptsUsed: number;
  certificationAttemptsLimit: number;
  isWithinTimeRestrictions: boolean;
}

interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  minutesRemaining?: number;
  minutesUsed?: number;
  minutesLimit?: number;
  allowedDays?: number[];
  startTime?: string;
  endTime?: string;
}

export const useUsageLimits = () => {
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumVoiceMinutesRemaining, setPremiumVoiceMinutesRemaining] = useState(15);
  const { toast } = useToast();

  const fetchUsageLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: limits, error } = await supabase
        .from('student_usage_limits')
        .select('*')
        .eq('student_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage limits:', error);
        return;
      }

      if (!limits) {
        // Initialize limits for new user
        await supabase.rpc('initialize_student_usage_limits', {
          target_student_id: user.id
        });
        
        // Fetch again after initialization
        const { data: newLimits } = await supabase
          .from('student_usage_limits')
          .select('*')
          .eq('student_id', user.id)
          .single();

        if (newLimits) {
          setUsageLimits({
            voiceMinutesLimit: newLimits.voice_minutes_monthly_limit,
            voiceMinutesUsed: newLimits.voice_minutes_used_current_month,
            voiceMinutesRemaining: newLimits.voice_minutes_monthly_limit - newLimits.voice_minutes_used_current_month,
            textMessagesUsed: newLimits.text_messages_used_current_month,
            certificationAttemptsUsed: newLimits.certification_attempts_used_current_semester,
            certificationAttemptsLimit: newLimits.certification_attempts_semester_limit,
            isWithinTimeRestrictions: true
          });
        }
      } else {
        setUsageLimits({
          voiceMinutesLimit: limits.voice_minutes_monthly_limit,
          voiceMinutesUsed: limits.voice_minutes_used_current_month,
          voiceMinutesRemaining: limits.voice_minutes_monthly_limit - limits.voice_minutes_used_current_month,
          textMessagesUsed: limits.text_messages_used_current_month,
          certificationAttemptsUsed: limits.certification_attempts_used_current_semester,
          certificationAttemptsLimit: limits.certification_attempts_semester_limit,
          isWithinTimeRestrictions: true
        });
      }
      
      // Set premium voice minutes
      const premiumLimit = limits.premium_voice_minutes_monthly_limit || 15;
      const premiumUsed = limits.premium_voice_minutes_used_current_month || 0;
      setPremiumVoiceMinutesRemaining(premiumLimit - premiumUsed);
      
    } catch (error) {
      console.error('Error in fetchUsageLimits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCanStartVoiceSession = async (): Promise<UsageCheckResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { allowed: false, reason: 'not_authenticated' };
      }

      const { data, error } = await supabase.rpc('can_start_voice_session', {
        target_student_id: user.id
      });

      if (error) {
        console.error('Error checking voice session:', error);
        return { allowed: false, reason: 'check_failed' };
      }

      return (data as any) as UsageCheckResult;
    } catch (error) {
      console.error('Error in checkCanStartVoiceSession:', error);
      return { allowed: false, reason: 'check_failed' };
    }
  };

  const trackVoiceSession = async (sessionId: string, minutesUsed: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Insert detailed tracking
      const { error: trackingError } = await supabase
        .from('usage_tracking')
        .insert({
          student_id: user.id,
          session_type: 'voice_practice',
          session_id: sessionId,
          minutes_used: minutesUsed,
          ended_at: new Date().toISOString()
        });

      if (trackingError) {
        console.error('Error tracking voice session:', trackingError);
        return;
      }

      // Get current usage first
      const { data: currentLimits } = await supabase
        .from('student_usage_limits')
        .select('voice_minutes_used_current_month')
        .eq('student_id', user.id)
        .single();

      const newUsage = (currentLimits?.voice_minutes_used_current_month || 0) + minutesUsed;

      // Update monthly usage
      const { error: updateError } = await supabase
        .from('student_usage_limits')
        .update({
          voice_minutes_used_current_month: newUsage,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', user.id);

      if (updateError) {
        console.error('Error updating usage limits:', updateError);
        return;
      }

      // Refresh limits
      await fetchUsageLimits();

      // Show warning if approaching limit
      const newUsed = (usageLimits?.voiceMinutesUsed || 0) + minutesUsed;
      if (newUsed >= 350 && newUsed < 400) {
        toast({
          title: "Voice Usage Warning",
          description: `You've used ${newUsed} of 400 minutes this month. Consider pacing your usage.`,
          variant: "default"
        });
      } else if (newUsed >= 400) {
        toast({
          title: "Monthly Limit Reached",
          description: "You've reached your 400-minute monthly voice practice limit.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error in trackVoiceSession:', error);
    }
  };

  const trackTextMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current usage first
      const { data: currentLimits } = await supabase
        .from('student_usage_limits')
        .select('text_messages_used_current_month')
        .eq('student_id', user.id)
        .single();

      const newMessageCount = (currentLimits?.text_messages_used_current_month || 0) + 1;

      // Update text message count
      const { error } = await supabase
        .from('student_usage_limits')
        .update({
          text_messages_used_current_month: newMessageCount,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', user.id);

      if (error) {
        console.error('Error tracking text message:', error);
        return;
      }

      // Check for high usage alert (5000+ messages)
      const newCount = (usageLimits?.textMessagesUsed || 0) + 1;
      if (newCount === 5000) {
        toast({
          title: "High Text Usage Alert",
          description: "You've sent 5,000 messages this month. Your teacher has been notified.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error in trackTextMessage:', error);
    }
  };

  const trackCertificationAttempt = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check current attempts
      const currentAttempts = usageLimits?.certificationAttemptsUsed || 0;
      const limit = usageLimits?.certificationAttemptsLimit || 3;

      if (currentAttempts >= limit) {
        toast({
          title: "Certification Limit Reached",
          description: `You've used all ${limit} certification attempts this semester.`,
          variant: "destructive"
        });
        return false;
      }

      // Get current usage first
      const { data: currentLimits } = await supabase
        .from('student_usage_limits')
        .select('certification_attempts_used_current_semester')
        .eq('student_id', user.id)
        .single();

      const newAttemptCount = (currentLimits?.certification_attempts_used_current_semester || 0) + 1;

      // Update attempt count
      const { error } = await supabase
        .from('student_usage_limits')
        .update({
          certification_attempts_used_current_semester: newAttemptCount,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', user.id);

      if (error) {
        console.error('Error tracking certification attempt:', error);
        return false;
      }

      await fetchUsageLimits();
      return true;
    } catch (error) {
      console.error('Error in trackCertificationAttempt:', error);
      return false;
    }
  };

  const checkCanStartPremiumVoiceSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.rpc('can_start_premium_voice_session', {
      target_student_id: user.id
    });

    if (error) {
      console.error('Error checking premium voice session:', error);
      throw error;
    }

    return data;
  };

  const trackPremiumVoiceSession = async (sessionId: string, minutesUsed: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('usage_tracking').insert({
      student_id: user.id,
      session_id: sessionId,
      session_type: 'premium_voice_practice',
      minutes_used: minutesUsed
    });

    await fetchUsageLimits();
  };

  useEffect(() => {
    fetchUsageLimits();
  }, []);

  return {
    usageLimits,
    isLoading,
    premiumVoiceMinutesRemaining,
    checkCanStartVoiceSession,
    trackVoiceSession,
    trackTextMessage,
    trackCertificationAttempt,
    checkCanStartPremiumVoiceSession,
    trackPremiumVoiceSession,
    refreshLimits: fetchUsageLimits
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsageLimits {
  // Account tier
  accountTier: 'standard' | 'premium';
  
  // Whisper STT limits (minute-based)
  whisperSTTMinutesLimit: number;
  whisperSTTMinutesUsed: number;
  whisperSTTMinutesRemaining: number;
  
  // Premium voice practice limits (Advanced Voice - minute-based)
  premiumVoiceMinutesLimit: number;
  premiumVoiceMinutesUsed: number;
  premiumVoiceMinutesRemaining: number;
  
  // TTS tokens (across all features - token-based)
  ttsTokensLimit: number;
  ttsTokensUsed: number;
  ttsTokensRemaining: number;
  
  // Text practice tokens (token-based)
  textPracticeTokensLimit: number;
  textPracticeTokensUsed: number;
  textPracticeTokensRemaining: number;
  
  // Certification limits
  certificationAttemptsUsed: number;
  certificationAttemptsLimit: number;
}

interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  minutesRemaining?: number;
  minutesUsed?: number;
  minutesLimit?: number;
  messagesUsed?: number;
  messagesLimit?: number;
  messagesRemaining?: number;
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

      // Fetch profile to get account_tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_tier')
        .eq('id', user.id)
        .single();
      
      const accountTier = profile?.account_tier || 'premium';

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
        // Initialize limits for new user with their tier
        await supabase.rpc('initialize_student_usage_limits_with_tier', {
          p_student_id: user.id,
          p_account_tier: accountTier
        });
        
        // Fetch again after initialization
        const { data: newLimits } = await supabase
          .from('student_usage_limits')
          .select('*')
          .eq('student_id', user.id)
          .single();

        if (newLimits) {
          const premiumLimit = newLimits.premium_voice_minutes_monthly_limit || 0;
          const premiumUsed = newLimits.premium_voice_minutes_used_current_month || 0;
          const ttsTokensLimit = newLimits.tts_tokens_monthly_limit || 0;
          const ttsTokensUsed = newLimits.tts_tokens_used_current_month || 0;
          const textPracticeTokensLimit = newLimits.text_practice_tokens_monthly_limit || 0;
          const textPracticeTokensUsed = newLimits.text_practice_tokens_used_current_month || 0;
          const whisperSTTLimit = newLimits.whisper_stt_minutes_monthly_limit || 180;
          const whisperSTTUsed = newLimits.whisper_stt_minutes_used_current_month || 0;
          
          setUsageLimits({
            accountTier,
            whisperSTTMinutesLimit: whisperSTTLimit,
            whisperSTTMinutesUsed: whisperSTTUsed,
            whisperSTTMinutesRemaining: whisperSTTLimit - whisperSTTUsed,
            premiumVoiceMinutesLimit: premiumLimit,
            premiumVoiceMinutesUsed: premiumUsed,
            premiumVoiceMinutesRemaining: premiumLimit - premiumUsed,
            ttsTokensLimit,
            ttsTokensUsed,
            ttsTokensRemaining: ttsTokensLimit - ttsTokensUsed,
            textPracticeTokensLimit,
            textPracticeTokensUsed,
            textPracticeTokensRemaining: textPracticeTokensLimit - textPracticeTokensUsed,
            certificationAttemptsUsed: newLimits.certification_attempts_used_current_semester,
            certificationAttemptsLimit: newLimits.certification_attempts_semester_limit
          });
          setPremiumVoiceMinutesRemaining(premiumLimit - premiumUsed);
        }
      } else {
        const premiumLimit = limits.premium_voice_minutes_monthly_limit || 0;
        const premiumUsed = limits.premium_voice_minutes_used_current_month || 0;
        const ttsTokensLimit = limits.tts_tokens_monthly_limit || 0;
        const ttsTokensUsed = limits.tts_tokens_used_current_month || 0;
        const textPracticeTokensLimit = limits.text_practice_tokens_monthly_limit || 0;
        const textPracticeTokensUsed = limits.text_practice_tokens_used_current_month || 0;
        const whisperSTTLimit = limits.whisper_stt_minutes_monthly_limit || 180;
        const whisperSTTUsed = limits.whisper_stt_minutes_used_current_month || 0;
        
        setUsageLimits({
          accountTier,
          whisperSTTMinutesLimit: whisperSTTLimit,
          whisperSTTMinutesUsed: whisperSTTUsed,
          whisperSTTMinutesRemaining: whisperSTTLimit - whisperSTTUsed,
          premiumVoiceMinutesLimit: premiumLimit,
          premiumVoiceMinutesUsed: premiumUsed,
          premiumVoiceMinutesRemaining: premiumLimit - premiumUsed,
          ttsTokensLimit,
          ttsTokensUsed,
          ttsTokensRemaining: ttsTokensLimit - ttsTokensUsed,
          textPracticeTokensLimit,
          textPracticeTokensUsed,
          textPracticeTokensRemaining: textPracticeTokensLimit - textPracticeTokensUsed,
          certificationAttemptsUsed: limits.certification_attempts_used_current_semester,
          certificationAttemptsLimit: limits.certification_attempts_semester_limit
        });
        setPremiumVoiceMinutesRemaining(premiumLimit - premiumUsed);
      }
      
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
      const limit = usageLimits?.whisperSTTMinutesLimit || 180;
      const newUsed = (usageLimits?.whisperSTTMinutesUsed || 0) + minutesUsed;
      const warningThreshold = Math.floor(limit * 0.85); // 85% of limit
      
      if (newUsed >= warningThreshold && newUsed < limit) {
        toast({
          title: "Whisper STT Usage Warning",
          description: `You've used ${newUsed} of ${limit} minutes this month. Consider pacing your usage.`,
          variant: "default"
        });
      } else if (newUsed >= limit) {
        toast({
          title: "Monthly Limit Reached",
          description: `You've reached your ${limit}-minute monthly Whisper STT limit.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error in trackVoiceSession:', error);
    }
  };

  const checkCanSendTextMessage = async (): Promise<UsageCheckResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          allowed: false,
          reason: "Authentication required"
        };
      }

      const { data, error } = await supabase
        .rpc('can_send_text_message', { p_student_id: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        
        if (!result.can_send) {
          toast({
            title: "Message Limit Reached",
            description: `You've reached your monthly limit of ${result.messages_limit} messages.`,
            variant: "destructive",
            duration: 5000,
          });
        }
        
        return {
          allowed: result.can_send,
          reason: result.reason,
          messagesUsed: result.messages_used,
          messagesLimit: result.messages_limit,
          messagesRemaining: result.messages_remaining
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking text message limit:', error);
      toast({
        title: "Error",
        description: "Could not verify message limits. Please try again.",
        variant: "destructive",
      });
      return {
        allowed: false,
        reason: "Could not verify limits"
      };
    }
  };

  const trackTextMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current usage first
      const { data: currentLimits } = await supabase
        .from('student_usage_limits')
        .select('text_messages_used_current_month, text_messages_monthly_limit')
        .eq('student_id', user.id)
        .single();

      const newMessageCount = (currentLimits?.text_messages_used_current_month || 0) + 1;
      const textLimit = currentLimits?.text_messages_monthly_limit || 1500;

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

      // Show warning at 80% usage
      const warningThreshold = Math.floor(textLimit * 0.8);
      if (newMessageCount === warningThreshold) {
        toast({
          title: "High Text Message Usage",
          description: `You've used ${newMessageCount} of ${textLimit} monthly messages.`,
          duration: 5000,
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
    try {
      console.log('Tracking premium voice session:', { sessionId, minutesUsed });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found for tracking premium voice session');
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.from('usage_tracking').insert({
        student_id: user.id,
        session_id: sessionId,
        session_type: 'premium_voice_practice',
        minutes_used: minutesUsed
      }).select();

      if (error) {
        console.error('Error inserting premium voice tracking:', error);
        throw error;
      }

      console.log('Premium voice session tracked successfully:', data);
      await fetchUsageLimits();
    } catch (error) {
      console.error('Error in trackPremiumVoiceSession:', error);
      toast({
        title: "Tracking Error",
        description: "Failed to track your session usage. Please contact support if this persists.",
        variant: "destructive"
      });
      throw error;
    }
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
    checkCanSendTextMessage,
    trackTextMessage,
    trackCertificationAttempt,
    checkCanStartPremiumVoiceSession,
    trackPremiumVoiceSession,
    refreshLimits: fetchUsageLimits
  };
};
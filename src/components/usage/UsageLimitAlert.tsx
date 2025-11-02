import { useEffect, useRef } from 'react';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

export const UsageLimitAlert = () => {
  const { usageLimits } = useUsageLimits();
  const { toast } = useToast();
  const { t } = useLocalization();
  const hasShownWarnings = useRef({
    ttsWarning: false,
    ttsLimit: false,
    sttWarning: false,
    sttLimit: false,
  });

  useEffect(() => {
    if (!usageLimits) return;

    // TTS token warning at 90%
    const ttsPercentUsed = (usageLimits.ttsTokensUsed / usageLimits.ttsTokensLimit) * 100;
    if (ttsPercentUsed >= 90 && ttsPercentUsed < 100 && !hasShownWarnings.current.ttsWarning) {
      hasShownWarnings.current.ttsWarning = true;
      toast({
        title: t('ttsLimitWarning') || 'TTS Limit Warning',
        description: `You have ${usageLimits.ttsTokensRemaining.toLocaleString()} TTS tokens remaining this month.`,
        variant: 'default',
      });
    }

    // TTS limit reached
    if (usageLimits.ttsTokensRemaining <= 0 && !hasShownWarnings.current.ttsLimit) {
      hasShownWarnings.current.ttsLimit = true;
      toast({
        title: t('ttsLimitReached') || 'TTS Limit Reached',
        description: 'You have reached your monthly TTS token limit. Using browser voice as fallback.',
        variant: 'destructive',
      });
    }

    // Whisper STT warning at 90%
    const sttPercentUsed = (usageLimits.whisperSTTMinutesUsed / usageLimits.whisperSTTMinutesLimit) * 100;
    if (sttPercentUsed >= 90 && sttPercentUsed < 100 && !hasShownWarnings.current.sttWarning) {
      hasShownWarnings.current.sttWarning = true;
      toast({
        title: t('sttLimitWarning') || 'Whisper STT Limit Warning',
        description: `You have ${usageLimits.whisperSTTMinutesRemaining} minutes of Whisper STT remaining this month.`,
        variant: 'default',
      });
    }

    // Whisper STT limit reached
    if (usageLimits.whisperSTTMinutesRemaining <= 0 && !hasShownWarnings.current.sttLimit) {
      hasShownWarnings.current.sttLimit = true;
      toast({
        title: t('sttLimitReached') || 'Whisper STT Limit Reached',
        description: 'You have reached your monthly Whisper STT limit. Using browser speech recognition as fallback.',
        variant: 'destructive',
      });
    }

    // Reset warnings when usage is reset (e.g., new month)
    if (usageLimits.ttsTokensRemaining > usageLimits.ttsTokensLimit * 0.1) {
      hasShownWarnings.current.ttsWarning = false;
    }
    if (usageLimits.ttsTokensRemaining > 0) {
      hasShownWarnings.current.ttsLimit = false;
    }
    if (usageLimits.whisperSTTMinutesRemaining > usageLimits.whisperSTTMinutesLimit * 0.1) {
      hasShownWarnings.current.sttWarning = false;
    }
    if (usageLimits.whisperSTTMinutesRemaining > 0) {
      hasShownWarnings.current.sttLimit = false;
    }
  }, [usageLimits, toast, t]);

  return null;
};

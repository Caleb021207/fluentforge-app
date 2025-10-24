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

    // TTS warning at 90%
    const ttsPercentUsed = (usageLimits.ttsMinutesUsed / usageLimits.ttsMinutesLimit) * 100;
    if (ttsPercentUsed >= 90 && ttsPercentUsed < 100 && !hasShownWarnings.current.ttsWarning) {
      hasShownWarnings.current.ttsWarning = true;
      toast({
        title: t('ttsLimitWarning') || 'TTS Limit Warning',
        description: `You have ${usageLimits.ttsMinutesRemaining} minutes of text-to-speech remaining this month.`,
        variant: 'default',
      });
    }

    // TTS limit reached
    if (usageLimits.ttsMinutesRemaining <= 0 && !hasShownWarnings.current.ttsLimit) {
      hasShownWarnings.current.ttsLimit = true;
      toast({
        title: t('ttsLimitReached') || 'TTS Limit Reached',
        description: 'You have reached your monthly text-to-speech limit. Using browser voice as fallback.',
        variant: 'destructive',
      });
    }

    // STT warning at 90%
    const sttPercentUsed = (usageLimits.sttMinutesUsed / usageLimits.sttMinutesLimit) * 100;
    if (sttPercentUsed >= 90 && sttPercentUsed < 100 && !hasShownWarnings.current.sttWarning) {
      hasShownWarnings.current.sttWarning = true;
      toast({
        title: t('sttLimitWarning') || 'STT Limit Warning',
        description: `You have ${usageLimits.sttMinutesRemaining} minutes of speech-to-text remaining this month.`,
        variant: 'default',
      });
    }

    // STT limit reached
    if (usageLimits.sttMinutesRemaining <= 0 && !hasShownWarnings.current.sttLimit) {
      hasShownWarnings.current.sttLimit = true;
      toast({
        title: t('sttLimitReached') || 'STT Limit Reached',
        description: 'You have reached your monthly speech-to-text limit. Voice features are now disabled.',
        variant: 'destructive',
      });
    }

    // Reset warnings when usage is reset (e.g., new month)
    if (usageLimits.ttsMinutesRemaining > usageLimits.ttsMinutesLimit * 0.1) {
      hasShownWarnings.current.ttsWarning = false;
    }
    if (usageLimits.ttsMinutesRemaining > 0) {
      hasShownWarnings.current.ttsLimit = false;
    }
    if (usageLimits.sttMinutesRemaining > usageLimits.sttMinutesLimit * 0.1) {
      hasShownWarnings.current.sttWarning = false;
    }
    if (usageLimits.sttMinutesRemaining > 0) {
      hasShownWarnings.current.sttLimit = false;
    }
  }, [usageLimits, toast, t]);

  return null;
};

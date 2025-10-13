import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudioManager";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

const PremiumVoicePractice = () => {
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatRef = useRef<RealtimeChat | null>(null);
  const timerRef = useRef<number | null>(null);
  const { premiumVoiceMinutesRemaining, checkCanStartPremiumVoiceSession, trackPremiumVoiceSession } = useUsageLimits();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      chatRef.current?.disconnect();
    };
  }, []);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'time_warning') {
      toast({
        title: t('timeWarning'),
        description: t('minutesRemainingWarning', { 
          minutes: String(event.minutes_remaining),
          plural: event.minutes_remaining > 1 ? 's' : ''
        }),
        variant: "default",
      });
    } else if (event.type === 'time_limit_reached') {
      toast({
        title: t('sessionEnded'),
        description: t('premiumSessionEndedMessage'),
        variant: "default",
      });
      endConversation();
    }
  };

  const startConversation = async () => {
    // Prevent concurrent calls
    if (isStarting || isConnected) {
      console.log('Already starting or connected, ignoring request');
      return;
    }

    setIsStarting(true);
    try {
      const canStart = await checkCanStartPremiumVoiceSession() as any;
      if (!canStart?.allowed) {
        toast({
          title: t('limitReached'),
          description: t('monthlyLimitMessage', { minutes: String(canStart?.minutes_limit || 15) }),
          variant: "destructive",
        });
        setIsStarting(false);
        return;
      }

      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking);
      await chatRef.current.init();
      
      // Generate and store session ID
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      
      setIsConnected(true);
      setElapsedSeconds(0);
      
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      toast({
        title: t('connected'),
        description: t('premiumVoiceReady'),
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const minutesUsed = Math.ceil(elapsedSeconds / 60);
    console.log('Ending premium voice conversation:', { elapsedSeconds, minutesUsed, sessionId });
    
    // Track usage with fallback mechanisms
    if (chatRef.current && minutesUsed > 0 && sessionId) {
      // Primary: Client-side tracking
      trackPremiumVoiceSession(sessionId, minutesUsed).catch(async (error) => {
        console.error('❌ Client-side tracking failed:', error);
        
        // Fallback 1: Server-side tracking via edge function
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('No session');
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-premium-voice-session`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ session_id: sessionId, minutes_used: minutesUsed })
            }
          );
          
          if (!response.ok) throw new Error('Server tracking failed');
          console.log('✅ Session tracked via server fallback');
        } catch (serverError) {
          console.error('❌ Server fallback failed:', serverError);
          
          // Fallback 2: sendBeacon for best-effort tracking
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const beaconData = new Blob(
                [JSON.stringify({ session_id: sessionId, minutes_used: minutesUsed })],
                { type: 'application/json' }
              );
              
              navigator.sendBeacon(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-premium-voice-session`,
                beaconData
              );
              console.log('📡 Beacon sent as last resort');
            }
          } catch (beaconError) {
            console.error('❌ Beacon also failed:', beaconError);
          }
          
          toast({
            title: t('error'),
            description: 'Failed to save session. Will retry automatically.',
            variant: "destructive",
          });
        }
      });
    }
    
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setSessionId(null);
    
    toast({
      title: t('sessionSaved'),
      description: t('usedMinutesMessage', { 
        minutes: String(minutesUsed),
        plural: minutesUsed !== 1 ? 's' : ''
      }),
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const minutesRemaining = premiumVoiceMinutesRemaining - Math.ceil(elapsedSeconds / 60);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('premiumVoicePractice')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('practiceConversationalEnglish')}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-sm font-medium">
            {t('minutesRemainingThisMonth', { minutes: String(premiumVoiceMinutesRemaining) })}
          </span>
        </div>
        <div className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
          {t('premiumVoiceInstructions')}
        </div>
      </div>

      {!['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'yue', 'ru', 'ar', 'hi', 'tr', 'pl'].includes(currentLanguage) && t('languageSupportDisclaimer') && (
        <Card className="p-4 mb-4 bg-primary/10 border-primary/20">
          <p className="text-sm text-center">
            {t('languageSupportDisclaimer')}
          </p>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <div className="flex flex-col items-center gap-6">
          {isConnected && (
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('minutesLeft', { minutes: String(minutesRemaining) })}
              </div>
            </div>
          )}

          <div className={`relative ${isSpeaking ? 'animate-pulse' : ''}`}>
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              {isConnected ? (
                <MicOff className="w-12 h-12 text-primary" />
              ) : (
                <Mic className="w-12 h-12 text-primary" />
              )}
            </div>
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            )}
          </div>

          {!isConnected ? (
            <Button 
              onClick={startConversation}
              size="lg"
              className="px-8"
              disabled={isStarting}
            >
              {isStarting ? 'Connecting...' : t('startPremiumSession')}
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              size="lg"
              variant="secondary"
              className="px-8"
            >
              {t('endSession')}
            </Button>
          )}

        </div>
      </Card>
    </div>
  );
};

export default PremiumVoicePractice;

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudioManager";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { getLanguagePair } from "@/utils/languageUtils";

const PremiumVoicePractice = () => {
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState<'gpt' | 'gemini'>('gpt');
  const chatRef = useRef<RealtimeChat | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Custom realtime state
  const [customSessionId, setCustomSessionId] = useState<string | null>(null);
  const [customElapsedSeconds, setCustomElapsedSeconds] = useState(0);
  const [customState, setCustomState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [customMessages, setCustomMessages] = useState<Array<{ role: string; content: string }>>([]);
  const customChatRef = useRef<any | null>(null);
  const customTimerRef = useRef<number | null>(null);
  
  const { premiumVoiceMinutesRemaining, checkCanStartPremiumVoiceSession, trackPremiumVoiceSession } = useUsageLimits();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (customTimerRef.current) {
        clearInterval(customTimerRef.current);
      }
      chatRef.current?.disconnect();
      customChatRef.current?.disconnect();
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

  const startConversation = async (selectedProvider: 'gpt' | 'gemini') => {
    // Prevent concurrent calls
    if (isStarting || isConnected) {
      console.log('Already starting or connected, ignoring request');
      return;
    }

    setIsStarting(true);
    setProvider(selectedProvider);
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

      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking, selectedProvider);
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

  const startCustomSession = async () => {
    if (isStarting || customSessionId) {
      console.log('Custom session already starting or active');
      return;
    }

    setIsStarting(true);
    try {
      const { CustomRealtimeManager } = await import("@/utils/CustomRealtimeManager");
      const { native } = getLanguagePair(currentLanguage);
      
      const manager = new CustomRealtimeManager(
        'english',
        native.toLowerCase(),
        (state) => setCustomState(state),
        (message) => {
          setCustomMessages(prev => [...prev, message]);
        },
        (error) => {
          toast({
            title: t("error"),
            description: error,
            variant: "destructive",
          });
        }
      );

      await manager.initialize();
      customChatRef.current = manager;

      const newSessionId = crypto.randomUUID();
      setCustomSessionId(newSessionId);
      setCustomElapsedSeconds(0);

      customTimerRef.current = window.setInterval(() => {
        setCustomElapsedSeconds(prev => prev + 1);
      }, 1000);

      // Start first listening session
      await manager.startListening();

      toast({
        title: "Connected",
        description: "Custom realtime session started",
      });
    } catch (error) {
      console.error('Error starting custom session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start custom session",
        variant: "destructive",
      });
      setCustomSessionId(null);
    } finally {
      setIsStarting(false);
    }
  };

  const endCustomSession = async () => {
    if (customTimerRef.current) {
      clearInterval(customTimerRef.current);
      customTimerRef.current = null;
    }

    const minutesUsed = Math.ceil(customElapsedSeconds / 60);
    console.log('Ending custom realtime session:', { customElapsedSeconds, minutesUsed, customSessionId });

    if (customChatRef.current && minutesUsed > 0 && customSessionId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('usage_tracking').insert({
            student_id: user.id,
            session_type: 'custom_realtime_practice',
            session_id: customSessionId,
            started_at: new Date(Date.now() - customElapsedSeconds * 1000).toISOString(),
            ended_at: new Date().toISOString(),
            minutes_used: minutesUsed,
            messages_count: customMessages.length,
          });
        }
      } catch (error) {
        console.error('Error tracking custom usage:', error);
      }
    }

    customChatRef.current?.disconnect();
    setCustomSessionId(null);
    setCustomElapsedSeconds(0);
    setCustomState('idle');
    setCustomMessages([]);

    toast({
      title: "Session Saved",
      description: `Used ${minutesUsed} minute${minutesUsed !== 1 ? 's' : ''} of custom realtime`,
    });
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

  // Auto-end session when time runs out
  useEffect(() => {
    if (isConnected && minutesRemaining <= 0) {
      console.log('Time limit reached, auto-ending session');
      endConversation();
    }
  }, [minutesRemaining, isConnected]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">GPT-4o Realtime</h3>
              <p className="text-sm text-muted-foreground">OpenAI's latest voice model</p>
            </div>

            {isConnected && provider === 'gpt' && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('minutesLeft', { minutes: String(minutesRemaining) })}
                </div>
              </div>
            )}

            <div className={`relative ${isSpeaking && provider === 'gpt' ? 'animate-pulse' : ''}`}>
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                {isConnected && provider === 'gpt' ? (
                  <MicOff className="w-12 h-12 text-primary" />
                ) : (
                  <Mic className="w-12 h-12 text-primary" />
                )}
              </div>
              {isSpeaking && provider === 'gpt' && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              )}
            </div>

            {!isConnected || provider !== 'gpt' ? (
              <Button 
                onClick={() => startConversation('gpt')}
                size="lg"
                className="px-8"
                disabled={isStarting || (isConnected && provider !== 'gpt') || premiumVoiceMinutesRemaining <= 0}
              >
                {isStarting && provider === 'gpt' ? 'Connecting...' : 'Start GPT Session'}
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                size="lg"
                variant="secondary"
                className="px-8"
                disabled={minutesRemaining <= 0}
              >
                {t('endSession')}
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 border-2 border-blue-500/30">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Custom Realtime AI</h3>
              <p className="text-sm text-muted-foreground">Whisper + GPT-4o-mini + Azure</p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded">FALLBACK</span>
            </div>

            {customSessionId && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {formatTime(customElapsedSeconds)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customMessages.length / 2} exchanges
                </div>
                <div className="text-xs text-blue-500 mt-2">
                  {customState}
                </div>
              </div>
            )}

            <div className={`relative ${customState === 'listening' ? 'animate-pulse' : ''}`}>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                customState === 'listening' ? 'bg-blue-500/20' :
                customState === 'processing' ? 'bg-yellow-500/20' :
                customState === 'speaking' ? 'bg-green-500/20' :
                'bg-primary/20'
              }`}>
                {customSessionId ? (
                  <MicOff className={`w-12 h-12 ${
                    customState === 'listening' ? 'text-blue-500' :
                    customState === 'processing' ? 'text-yellow-500' :
                    customState === 'speaking' ? 'text-green-500' :
                    'text-primary'
                  }`} />
                ) : (
                  <Mic className="w-12 h-12 text-blue-500" />
                )}
              </div>
              {customState === 'listening' && (
                <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
              )}
            </div>

            {!customSessionId ? (
              <Button 
                onClick={startCustomSession}
                size="lg"
                className="px-8 bg-blue-500 hover:bg-blue-600"
                disabled={isStarting || premiumVoiceMinutesRemaining <= 0}
              >
                {isStarting ? 'Connecting...' : 'Start Custom Session'}
              </Button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={endCustomSession}
                  size="lg"
                  variant="secondary"
                  className="px-8"
                >
                  End Session
                </Button>
                {customState === 'idle' && (
                  <Button 
                    onClick={async () => {
                      if (customChatRef.current) {
                        await customChatRef.current.startListening();
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="px-4"
                  >
                    Continue Speaking
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PremiumVoicePractice;

import { useState, useEffect, useRef } from "react";
import { InteractiveCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudioManager";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { getLanguagePair } from "@/utils/languageUtils";
import { useGamification } from "@/hooks/useGamification";
import LevelUpModal from "@/components/gamification/LevelUpModal";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PremiumVoicePractice = () => {
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState<'gpt' | 'gemini'>('gpt');
  const [selectedMode, setSelectedMode] = useState<'gpt' | 'custom'>('gpt');
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
  const { awardXP, showLevelUpModal, setShowLevelUpModal, levelUpData, progression } = useGamification();
  const sessionStartTimeRef = useRef<number | null>(null);

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
    // Prevent concurrent calls - check both session states
    if (isStarting || isConnected || customSessionId) {
      console.log('Already starting or another session is active, ignoring request');
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
    // Prevent concurrent calls - check both session states
    if (isStarting || customSessionId || isConnected) {
      console.log('Custom session already starting or another session is active');
      return;
    }

    setIsStarting(true);
    try {
      const { CustomRealtimeManager } = await import("@/utils/CustomRealtimeManager");
      const { native } = getLanguagePair(currentLanguage);
      
      const manager = new CustomRealtimeManager(
        'english',
        native.toLowerCase(),
        currentLanguage,
        'intermediate', // Default to intermediate level
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

      // Clear conversation history for fresh session
      manager.clearHistory();

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

    // Award XP for custom realtime session
    if (minutesUsed > 0 && customMessages.length > 0) {
      await awardXP('realtime_ai');
    }

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
    
    // Award XP for completing voice session
    if (minutesUsed > 0) {
      await awardXP('premium_voice');
    }
    
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

  // Helper function to determine language support
  const getLanguageSupport = (lang: string) => {
    const gptOptimalLanguages = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'yue', 'ru', 'ar', 'hi', 'tr', 'pl', 'pt', 'nl'];
    
    return {
      gptSupported: gptOptimalLanguages.includes(lang),
      customSupported: true, // Custom AI supports all platform languages
      recommendGpt: gptOptimalLanguages.includes(lang),
      recommendCustom: !gptOptimalLanguages.includes(lang)
    };
  };

  const languageSupport = getLanguageSupport(currentLanguage);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">{t('premiumVoicePractice')}</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            {t('practiceConversationalEnglish')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {t('minutesRemainingThisMonth', { minutes: String(premiumVoiceMinutesRemaining) })}
            </span>
          </div>
          <div className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
            {t('premiumVoiceInstructions')}
          </div>
        </motion.div>

        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-md mx-auto"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Select Practice Mode
            </label>
            <Select 
              value={selectedMode} 
              onValueChange={(value: 'gpt' | 'custom') => {
                if (!isConnected && !customSessionId) {
                  setSelectedMode(value);
                }
              }}
              disabled={isConnected || customSessionId !== null}
            >
              <SelectTrigger className="w-full h-14 text-lg border-2 hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="gpt" className="text-lg py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    GPT-4o Realtime
                  </div>
                </SelectItem>
                <SelectItem value="custom" className="text-lg py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Custom Realtime AI
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Language support information */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <InteractiveCard className="overflow-hidden border-primary/30 shadow-2xl bg-gradient-to-br from-card/50 via-card to-card/50">
            <div className={`p-6 space-y-3 ${selectedMode === 'gpt' ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent' : 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent'}`}>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${selectedMode === 'gpt' ? 'text-primary' : 'text-accent'}`} />
                {selectedMode === 'gpt' ? 'GPT-4o Realtime' : 'Custom Realtime AI'}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedMode === 'gpt' ? t('gptLanguageSupport') : t('customLanguageSupport')}
              </p>
              {selectedMode === 'custom' && (
                <p className="text-sm text-muted-foreground max-w-md">
                  {t('customRealtimeDisclaimer')}
                </p>
              )}
            </div>
          </InteractiveCard>
        </motion.div>

        {/* Single session interface based on selected mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ duration: 0.3 }}>
            {selectedMode === 'gpt' ? (
              <InteractiveCard className="p-8 glass border-primary/30 hover:border-primary/50 transition-all shadow-xl overflow-hidden bg-gradient-to-br from-card/50 via-card to-card/50">
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-2xl font-bold gradient-text">GPT-4o Realtime</h3>
                    <p className="text-sm text-muted-foreground">{t('openaiLatestVoiceModel')}</p>
                  </div>

                  {isConnected && provider === 'gpt' && (
                    <motion.div 
                      className="text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <div className="text-4xl font-bold text-primary mb-2">
                        {formatTime(elapsedSeconds)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('minutesLeft', { minutes: String(minutesRemaining) })}
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    className={`relative ${isSpeaking && provider === 'gpt' ? 'animate-pulse' : ''}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg">
                      {isConnected && provider === 'gpt' ? (
                        <MicOff className="w-14 h-14 text-primary" />
                      ) : (
                        <Mic className="w-14 h-14 text-primary" />
                      )}
                    </div>
                    {isSpeaking && provider === 'gpt' && (
                      <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    )}
                  </motion.div>

                  {!isConnected || provider !== 'gpt' ? (
                    <Button 
                      onClick={() => startConversation('gpt')}
                      size="lg"
                      className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                      disabled={isStarting || (isConnected && provider !== 'gpt') || premiumVoiceMinutesRemaining <= 0}
                    >
                      {isStarting && provider === 'gpt' ? t('connecting') : t('startGptSession')}
                    </Button>
                  ) : (
                    <Button 
                      onClick={endConversation}
                      size="lg"
                      variant="secondary"
                      className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                      disabled={minutesRemaining <= 0}
                    >
                      {t('endSession')}
                    </Button>
                  )}
                </div>
              </InteractiveCard>
            ) : (
              <InteractiveCard className="p-8 glass border-accent/30 hover:border-accent/50 transition-all shadow-xl overflow-hidden bg-gradient-to-br from-card/50 via-card to-card/50">
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold gradient-text">Custom Realtime AI</h3>
                    <motion.div 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-foreground">
                        {t('multilingualSupport')}
                      </span>
                    </motion.div>
                  </div>

                  {customSessionId && (
                    <motion.div 
                      className="text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <div className="text-4xl font-bold text-accent mb-2">
                        {formatTime(customElapsedSeconds)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customMessages.length / 2} {t('exchanges')}
                      </div>
                      <div className="text-xs text-accent mt-2 font-medium">
                        {t(`state${customState.charAt(0).toUpperCase() + customState.slice(1)}` as any)}
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    className={`relative ${customState === 'listening' ? 'animate-pulse' : ''}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg ${
                      customState === 'listening' ? 'bg-gradient-to-br from-accent/30 to-accent/10' :
                      customState === 'processing' ? 'bg-gradient-to-br from-primary/30 to-primary/10' :
                      customState === 'speaking' ? 'bg-gradient-to-br from-green-500/30 to-green-500/10' :
                      'bg-gradient-to-br from-primary/30 to-primary/10'
                    }`}>
                      {customSessionId ? (
                        <MicOff className={`w-14 h-14 ${
                          customState === 'listening' ? 'text-accent' :
                          customState === 'processing' ? 'text-primary' :
                          customState === 'speaking' ? 'text-green-500' :
                          'text-primary'
                        }`} />
                      ) : (
                        <Mic className="w-14 h-14 text-accent" />
                      )}
                    </div>
                    {customState === 'listening' && (
                      <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                    )}
                  </motion.div>

                  {!customSessionId ? (
                    <Button 
                      onClick={startCustomSession}
                      size="lg"
                      className="px-10 py-6 text-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg hover:shadow-xl transition-all"
                      disabled={isStarting}
                    >
                      {isStarting ? t('connecting') : t('startCustomSession')}
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <Button 
                        onClick={endCustomSession}
                        size="lg"
                        variant="secondary"
                        className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
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
                          className="px-6 hover:bg-accent/10 transition-all"
                        >
                          Continue Speaking
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </InteractiveCard>
            )}
          </motion.div>
        </motion.div>

        {showLevelUpModal && levelUpData && (
          <LevelUpModal
            open={showLevelUpModal}
            onClose={() => setShowLevelUpModal(false)}
            oldLevel={levelUpData.oldLevel}
            newLevel={levelUpData.newLevel}
            totalXP={progression?.total_xp || 0}
          />
        )}
      </div>
    </div>
  );
};

export default PremiumVoicePractice;

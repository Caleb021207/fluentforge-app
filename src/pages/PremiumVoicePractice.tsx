import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudioManager";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useLocalization } from "@/context/LocalizationContext";

const PremiumVoicePractice = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
    
    if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, text: last.text + event.delta }
          ];
        }
        return [...prev, { role: 'assistant', text: event.delta }];
      });
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setTranscript(prev => [...prev, { role: 'user', text: event.transcript }]);
    } else if (event.type === 'time_warning') {
      toast({
        title: t('premiumVoiceChat.timeWarning'),
        description: t('premiumVoiceChat.minutesRemainingWarning', { 
          minutes: String(event.minutes_remaining),
          plural: event.minutes_remaining > 1 ? 's' : ''
        }),
        variant: "default",
      });
    } else if (event.type === 'time_limit_reached') {
      toast({
        title: t('premiumVoiceChat.sessionEnded'),
        description: t('premiumVoiceChat.premiumSessionEndedMessage'),
        variant: "default",
      });
      endConversation();
    }
  };

  const startConversation = async () => {
    try {
      const canStart = await checkCanStartPremiumVoiceSession() as any;
      if (!canStart?.allowed) {
        toast({
          title: t('premiumVoiceChat.limitReached'),
          description: t('premiumVoiceChat.monthlyLimitMessage', { minutes: String(canStart?.minutes_limit || 15) }),
          variant: "destructive",
        });
        return;
      }

      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking);
      await chatRef.current.init();
      setIsConnected(true);
      setElapsedSeconds(0);
      
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      toast({
        title: t('premiumVoiceChat.connected'),
        description: t('premiumVoiceChat.premiumVoiceReady'),
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: t('premiumVoiceChat.error'),
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const minutesUsed = Math.ceil(elapsedSeconds / 60);
    
    // Track usage before disconnecting
    if (chatRef.current && minutesUsed > 0) {
      try {
        const sessionId = crypto.randomUUID();
        await trackPremiumVoiceSession(sessionId, minutesUsed);
      } catch (error) {
        console.error('Error tracking session:', error);
      }
    }
    
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    
    toast({
      title: t('premiumVoiceChat.sessionSaved'),
      description: t('premiumVoiceChat.usedMinutesMessage', { 
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">{t('premiumVoiceChat.premiumVoicePractice')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('premiumVoiceChat.practiceConversationalEnglish')}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-sm font-medium">
            {t('premiumVoiceChat.minutesRemainingThisMonth', { minutes: String(premiumVoiceMinutesRemaining) })}
          </span>
        </div>
        <div className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
          {t('premiumVoiceChat.premiumVoiceInstructions')}
        </div>
      </div>

      <Card className="p-8 mb-6">
        <div className="flex flex-col items-center gap-6">
          {isConnected && (
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('premiumVoiceChat.minutesLeft', { minutes: String(minutesRemaining) })}
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
            >
              {t('premiumVoiceChat.startPremiumSession')}
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              size="lg"
              variant="secondary"
              className="px-8"
            >
              {t('premiumVoiceChat.endSession')}
            </Button>
          )}

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('premiumVoiceChat.poweredByGPT4oRealtime')}
          </div>
        </div>
      </Card>

      {transcript.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('premiumVoiceChat.conversation')}</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcript.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  item.role === 'user'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-secondary mr-8'
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1 font-medium">
                  {item.role === 'user' ? t('premiumVoiceChat.you') : t('premiumVoiceChat.aiTutor')}
                </div>
                <div className="text-sm">{item.text}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PremiumVoicePractice;

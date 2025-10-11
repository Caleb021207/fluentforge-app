import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudioManager";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useLocalization } from "@/context/LocalizationContext";
import { secureStorage } from "@/utils/security/dataEncryption";

const PremiumVoicePractice = () => {
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const chatRef = useRef<RealtimeChat | null>(null);
  const timerRef = useRef<number | null>(null);
  const { premiumVoiceMinutesRemaining, checkCanStartPremiumVoiceSession } = useUsageLimits();

  // Get language preferences
  const nativeLanguage = currentLanguage;
  const targetLanguage = secureStorage.getItem("targetLanguage") || (currentLanguage === "english" ? "spanish" : "english");

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
        title: "Time Warning",
        description: `${event.minutes_remaining} minute${event.minutes_remaining > 1 ? 's' : ''} remaining`,
        variant: "default",
      });
    } else if (event.type === 'time_limit_reached') {
      toast({
        title: "Session Ended",
        description: "Your 15-minute premium session has ended",
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
          title: "Limit Reached",
          description: `You've used all ${canStart?.minutes_limit || 15} minutes this month. Resets on the 1st.`,
          variant: "destructive",
        });
        return;
      }

      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking, nativeLanguage, targetLanguage);
      await chatRef.current.init();
      setIsConnected(true);
      setElapsedSeconds(0);
      
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Connected",
        description: "Premium voice practice is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    
    const minutesUsed = Math.ceil(elapsedSeconds / 60);
    toast({
      title: "Session Saved",
      description: `Used ${minutesUsed} minute${minutesUsed !== 1 ? 's' : ''} this session`,
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
          <h1 className="text-4xl font-bold">{t("premiumVoice.unlimitedVoicePractice")}</h1>
        </div>
        <p className="text-muted-foreground">
          {t("premiumVoice.practiceConversational", { targetLanguage })}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-sm font-medium">
            {premiumVoiceMinutesRemaining} {t("premiumVoice.minutesRemaining")}
          </span>
        </div>
      </div>

      <Card className="p-6 mb-6 bg-muted/50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("premiumVoice.howToUse")}</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. {t("premiumVoice.step1")}</li>
              <li>2. {t("premiumVoice.step2")}</li>
              <li>3. {t("premiumVoice.step3")}</li>
              <li>4. {t("premiumVoice.step4", { targetLanguage })}</li>
              <li>5. {t("premiumVoice.step5")}</li>
              <li>6. {t("premiumVoice.step6")}</li>
              <li>7. {t("premiumVoice.step7")}</li>
            </ol>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t("premiumVoice.tips")}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {t("premiumVoice.tip1")}</li>
                <li>• {t("premiumVoice.tip2")}</li>
                <li>• {t("premiumVoice.tip3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 mb-6">
        <div className="flex flex-col items-center gap-6">
          {isConnected && (
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-sm text-muted-foreground">
                {minutesRemaining} minutes left
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
              Start Premium Session
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              size="lg"
              variant="secondary"
              className="px-8"
            >
              End Session
            </Button>
          )}

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t("premiumVoice.poweredBy")}
          </div>
        </div>
      </Card>

      {transcript.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("premiumVoice.conversation")}</h2>
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
                  {item.role === 'user' ? 'You' : 'AI Tutor'}
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

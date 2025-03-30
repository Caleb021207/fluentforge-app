
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { checkHasVoiceAccess, updateVoiceMinutesUsed, getRemainingVoiceMinutes } from '@/utils/usageTracker';
import { useLocalization } from '@/context/LocalizationContext';
import { requireAuth } from '@/utils/authUtils';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define SpeechRecognition for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Define Window for TypeScript
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Transcript {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceChat: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, currentLanguage } = useLocalization();
  
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const hasVoiceAccess = await checkHasVoiceAccess(user.id);
          setHasAccess(hasVoiceAccess);
          
          if (hasVoiceAccess) {
            const minutes = await getRemainingVoiceMinutes(user.id);
            setRemainingMinutes(minutes);
          }
        } catch (error) {
          console.error('Error checking voice access:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkAccess();
  }, [user]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setTranscripts(prev => [...prev, { text: transcript, isUser: true, timestamp: new Date() }]);
        respondToSpeech(transcript);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        stopTimer();
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerSeconds >= 300) { // 5 minutes = 300 seconds
      handleStopListening();
      toast({
        title: t("timeExpired"),
        description: t("voiceChatTimeLimit"),
      });
    }
  }, [timerSeconds, t, toast]);

  const startTimer = () => {
    setTimerSeconds(0);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: t("notSupported"),
        description: t("browserNotSupport"),
        variant: "destructive",
      });
      return;
    }
    
    if (remainingMinutes <= 0 && hasAccess) {
      toast({
        title: t("noRemainingTime"),
        description: t("timeAllowanceExceeded"),
        variant: "destructive",
      });
      return;
    }
    
    // Set language for speech recognition
    recognitionRef.current.lang = currentLanguage === 'english' ? 'es-ES' : 'en-US';
    
    try {
      recognitionRef.current.start();
      startTimer();
      setIsListening(true);
      
      // Add initial bot message
      const welcomeMessage = currentLanguage === 'english' 
        ? '¡Hola! ¿Cómo puedo ayudarte hoy?' 
        : 'Hello! How can I help you today?';
      
      setTranscripts([{ text: welcomeMessage, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: t("error"),
        description: t("microphoneAccessFailed"),
        variant: "destructive",
      });
    }
  };

  const handleStopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Calculate minutes used (rounded up to nearest minute)
      if (user && timerSeconds > 0) {
        const minutesUsed = Math.ceil(timerSeconds / 60);
        await updateVoiceMinutesUsed(user.id, minutesUsed);
        
        // Update remaining minutes
        if (hasAccess) {
          const remainingMins = await getRemainingVoiceMinutes(user.id);
          setRemainingMinutes(remainingMins);
        }
      }
      
      stopTimer();
    }
  };

  const respondToSpeech = (text: string) => {
    let response: string;
    
    if (currentLanguage === 'english') {
      // User speaks in Spanish, bot responds in Spanish
      if (text.toLowerCase().includes('hola') || text.toLowerCase().includes('buenos días')) {
        response = '¡Hola! ¿Cómo estás hoy?';
      } else if (text.toLowerCase().includes('como estas') || text.toLowerCase().includes('cómo estás')) {
        response = 'Estoy bien, gracias por preguntar. ¿Y tú?';
      } else if (text.toLowerCase().includes('me llamo')) {
        response = '¡Mucho gusto! Es un placer conocerte.';
      } else if (text.toLowerCase().includes('gracias')) {
        response = 'De nada. ¿Hay algo más en lo que pueda ayudarte?';
      } else if (text.toLowerCase().includes('adios') || text.toLowerCase().includes('adiós')) {
        response = '¡Adiós! Que tengas un buen día.';
      } else {
        response = 'Interesante. Cuéntame más sobre eso.';
      }
    } else {
      // User speaks in English, bot responds in English
      if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
        response = 'Hello! How are you today?';
      } else if (text.toLowerCase().includes('how are you')) {
        response = 'I\'m doing well, thank you for asking. How about you?';
      } else if (text.toLowerCase().includes('my name is')) {
        response = 'Nice to meet you! It\'s a pleasure to make your acquaintance.';
      } else if (text.toLowerCase().includes('thank you')) {
        response = 'You\'re welcome. Is there anything else I can help you with?';
      } else if (text.toLowerCase().includes('goodbye') || text.toLowerCase().includes('bye')) {
        response = 'Goodbye! Have a great day.';
      } else {
        response = 'That\'s interesting. Tell me more about that.';
      }
    }
    
    // Add bot response to transcripts
    setTimeout(() => {
      setTranscripts(prev => [...prev, { text: response, isUser: false, timestamp: new Date() }]);
      
      // Speak the response
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = currentLanguage === 'english' ? 'es-ES' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-6">{t("voiceChat")}</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lingua-primary"></div>
        </div>
      ) : (
        <>
          {hasAccess && (
            <Alert className="mb-6">
              <Volume2 className="h-4 w-4" />
              <AlertTitle>{t("voiceAllowance")}</AlertTitle>
              <AlertDescription>
                {t("remainingTime")}: {remainingMinutes} {t("minutes")}
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentLanguage === 'english' ? 'Spanish Voice Practice' : 'English Voice Practice'}</CardTitle>
              <CardDescription>
                {currentLanguage === 'english' 
                  ? 'Practice your Spanish speaking skills with this voice chat feature.'
                  : 'Practice your English speaking skills with this voice chat feature.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button 
                  onClick={isListening ? handleStopListening : handleStartListening}
                  variant={isListening ? "destructive" : "default"}
                  className="w-full md:w-auto"
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      {t("stopVoiceChat")}
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      {t("startVoiceChat")}
                    </>
                  )}
                </Button>
                
                {isListening && (
                  <div className="text-lg font-semibold">
                    {formatTime(timerSeconds)} / 5:00
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                {transcripts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Mic className="h-12 w-12 mb-4" />
                    <p>{t("startSpeaking")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcripts.map((transcript, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg max-w-[80%] ${
                          transcript.isUser 
                            ? 'bg-lingua-primary text-white ml-auto' 
                            : 'bg-gray-200 mr-auto'
                        }`}
                      >
                        <p>{transcript.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {transcript.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                {currentLanguage === 'english'
                  ? 'This voice chat uses your browser\'s speech recognition and synthesis capabilities.'
                  : 'Este chat de voz utiliza las capacidades de reconocimiento y síntesis de voz de tu navegador.'}
              </p>
            </CardFooter>
          </Card>
          
          {!hasAccess && (
            <Alert className="mb-6" variant="warning">
              <AlertTitle>{t("limitedFunctionality")}</AlertTitle>
              <AlertDescription>
                {t("joinClassForFullAccess")}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default requireAuth(VoiceChat);

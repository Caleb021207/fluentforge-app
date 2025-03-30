
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useClassroom } from '@/context/ClassroomContext';
import { useAuth } from '@/context/AuthContext';
import { updateVoiceMinutesUsed, getRemainingVoiceMinutes, checkHasVoiceAccess } from '@/utils/usageTracker';
import { AlertCircle, Clock, Mic, MicOff, Play, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLocalization } from '@/context/LocalizationContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceChat = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [hasVoiceAccess, setHasVoiceAccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isStudent, hasClassroom } = useClassroom();
  const { t } = useLocalization();

  useEffect(() => {
    if (user) {
      checkAccess();
    }
  }, [user, hasClassroom]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopListening();
            toast({
              title: "Time's up!",
              description: "Your 5-minute voice chat session has ended.",
              variant: "default",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  const checkAccess = async () => {
    if (!user) return;
    
    const minutes = await getRemainingVoiceMinutes(user.id);
    setRemainingMinutes(minutes);
    
    const access = await checkHasVoiceAccess(user.id);
    setHasVoiceAccess(access);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use voice features",
        variant: "destructive",
      });
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: t("speechRecognitionNotSupported"),
        description: "Please try a different browser like Chrome",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast({
        title: t("microphoneAccessRequired"),
        description: "Please allow microphone access in your browser settings",
        variant: "destructive",
      });
      return;
    }

    // For students with classroom access, check remaining minutes
    if (isStudent && hasClassroom) {
      if (remainingMinutes <= 0) {
        toast({
          title: "Daily Limit Reached",
          description: "You've used your 5 minutes of voice chat for today",
          variant: "destructive",
        });
        return;
      }
      
      // Reset timer to 5 minutes or remaining time if less
      const timeInSeconds = Math.min(300, remainingMinutes * 60);
      setTimeRemaining(timeInSeconds);
      setTimerActive(true);
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES'; // Assuming Spanish is the target language

    recognition.onstart = () => {
      setListening(true);
      startTimeRef.current = new Date();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + ' ' + transcript);
        } else {
          interimTranscript += transcript;
        }
      }
      // Update display with interim results
      document.getElementById('interim')!.innerHTML = interimTranscript;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: t("microphoneAccessRequired"),
          description: "Please allow microphone access in your browser settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: t("speechRecognitionError"),
          description: event.error,
          variant: "destructive",
        });
      }
      stopListening();
    };

    recognition.onend = () => {
      if (listening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setTimerActive(false);
      
      // Calculate minutes used
      if (startTimeRef.current && isStudent && hasClassroom) {
        const endTime = new Date();
        const minutesUsed = (endTime.getTime() - startTimeRef.current.getTime()) / 60000;
        
        if (user && minutesUsed > 0) {
          const updatedStats = await updateVoiceMinutesUsed(user.id, minutesUsed);
          if (updatedStats) {
            setRemainingMinutes(Math.max(0, 5 - updatedStats.voice_minutes_used));
          }
        }
      }
      
      // Reset timer ref
      startTimeRef.current = null;
      
      // Wait for final results to be processed
      setTimeout(() => {
        document.getElementById('interim')!.innerHTML = '';
        if (transcript.trim()) {
          generateResponse();
        }
      }, 1000);
    }
  };

  const generateResponse = async () => {
    setIsLoading(true);
    try {
      // Simple mock response generation for now
      setTimeout(() => {
        const responses = [
          "¡Muy bien! ¿Cómo estás hoy?",
          "Interesante. ¿Puedes decirme más sobre eso?",
          "Gracias por compartir. ¿Tienes alguna pregunta para mí?",
          "Estoy de acuerdo. ¿Qué piensas hacer al respecto?",
          "Entiendo. ¿Quieres practicar algún tema específico?",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setResponse(randomResponse);
        
        // Generate speech
        const utterance = new SpeechSynthesisUtterance(randomResponse);
        utterance.lang = 'es-ES';
        speechSynthesis.speak(utterance);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: t("failedToGetResponse"),
        description: "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setTranscript('');
    setResponse('');
    setAudioSrc(null);
  };

  const playAudio = () => {
    if (response) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  // Calculate the progress bar value
  const progressValue = ((300 - timeRemaining) / 300) * 100;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("freePracticeWithVoice")}</h1>
        <p className="text-muted-foreground">
          {isStudent && hasClassroom && hasVoiceAccess 
            ? t("unlimitedVoicePractice") 
            : "Practice your speaking skills with browser-based voice recognition"}
        </p>
      </div>

      {isStudent && hasClassroom && hasVoiceAccess && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time Remaining:</span>
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Daily limit: {remainingMinutes.toFixed(1)} minutes remaining
                </div>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle>{t("practiceWithVoiceChat")}</CardTitle>
            <CardDescription>
              {t("practiceLanguageTips")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-2">•</span>
                {t("askQuestionsAboutTopics")}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-2">•</span>
                {t("practiceEverydayPhrases")}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-2">•</span>
                {t("describeImagesOrScenes")}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 mr-2">•</span>
                {t("practiceVocabularyForSpecificTopics")}
              </li>
            </ul>

            <div className="space-y-2">
              <h3 className="font-medium">{t("conversationStarters")}</h3>
              <div className="rounded-md border p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium">{t("inYourTargetLanguage")}</p>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm">¿Hola, cómo estás hoy?</p>
                    <p className="text-sm">¿Cuáles son tus pasatiempos favoritos?</p>
                    <p className="text-sm">¿Puedes recomendarme un libro interesante?</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">{t("inYourNativeLanguage")}</p>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm">Hello, how are you today?</p>
                    <p className="text-sm">What are your favorite hobbies?</p>
                    <p className="text-sm">Can you recommend an interesting book?</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("youSaid")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4 min-h-[150px] relative">
              {transcript ? (
                <p>{transcript}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {listening ? t("speaking") : t("clickToStartVoice")}
                </p>
              )}
              <div id="interim" className="text-muted-foreground italic"></div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {!listening ? (
              <Button onClick={startListening} disabled={isLoading}>
                <Mic className="mr-2 h-4 w-4" />
                {t("startSpeaking")}
              </Button>
            ) : (
              <Button onClick={stopListening} variant="destructive">
                <MicOff className="mr-2 h-4 w-4" />
                {t("stopListening")}
              </Button>
            )}
            <Button variant="outline" onClick={clearConversation}>
              Clear
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("aiResponse")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4 min-h-[150px] relative">
              {isLoading ? (
                <div className="flex justify-center items-center h-[150px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
                </div>
              ) : response ? (
                <p>{response}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  AI response will appear here
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={playAudio} 
              disabled={!response || isLoading}
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              {t("playAgain")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {isStudent && !hasVoiceAccess && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upgrade your experience</AlertTitle>
          <AlertDescription>
            Join a classroom to access premium features like 5 minutes of daily voice chat with our 
            high-quality AI voice. Ask your teacher for a classroom code and add it in your dashboard.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VoiceChat;

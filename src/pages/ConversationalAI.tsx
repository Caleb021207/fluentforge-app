import { useState, useEffect, useRef } from "react";
import { Bot, User, Mic, MicOff, Headphones, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

type CEFRLevel = "A1" | "A2" | "B1" | "B2";

const ConversationalAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>("B1");
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const silenceThresholdRef = useRef<number>(2000); // 2 seconds of silence

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
        
        // Reset silence detection on audio data
        silenceStartRef.current = null;
        
        // Start silence detection
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        silenceStartRef.current = Date.now();
        silenceTimerRef.current = setTimeout(() => {
          if (isRecording) {
            console.log("Silence detected, stopping recording automatically");
            stopRecording();
          }
        }, silenceThresholdRef.current);
      });

      mediaRecorderRef.current.addEventListener('stop', async () => {
        processVoiceRecording();
      });

      // Setup audio analyzer to detect silence
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioSource.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Check audio level periodically to detect silence
      const checkSilence = () => {
        if (!isRecording) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        
        const average = sum / bufferLength;
        
        // If very low audio level and we weren't already counting silence
        if (average < 5) {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = Date.now();
          } else if (Date.now() - silenceStartRef.current > silenceThresholdRef.current) {
            console.log("Extended silence detected, stopping recording");
            stopRecording();
            return;
          }
        } else {
          // Reset silence counter on louder audio
          silenceStartRef.current = null;
        }
        
        // Continue checking while recording
        if (isRecording) {
          requestAnimationFrame(checkSilence);
        }
      };
      
      requestAnimationFrame(checkSilence);

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setTimeRemaining(600); // 10 minutes in seconds
      startTimer();
      
      toast({
        title: t("voiceChatStarted"),
        description: t("speakingNow"),
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: t("microphoneAccessRequired"),
        description: t("allowMicAccess"),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      silenceStartRef.current = null;

      // Stop all tracks on the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (isRecording) {
            stopRecording();
            toast({
              title: t("timeLimit"),
              description: t("dailyLimitReached"),
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const processVoiceRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      toast({
        title: t("error"),
        description: t("noAudioRecorded"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessingVoice(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove data URL prefix
        
        // Store user voice message
        const userMessage: ChatMessage = {
          role: "user",
          content: t("voiceMessage"),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Call Supabase function to process audio
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { 
            audio: base64Data,
            userLanguage: currentLanguage,
            conversationHistory,
            cefrLevel
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data.transcript) {
          // Update user message with transcript
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1].content = data.transcript;
            }
            return newMessages;
          });
          
          // Process the transcript with our conversation-ai function
          const { data: aiData, error: aiError } = await supabase.functions.invoke('conversation-ai', {
            body: {
              message: data.transcript,
              userLanguage: currentLanguage,
              cefrLevel: cefrLevel,
              conversationHistory: conversationHistory
            }
          });
          
          if (aiError) throw aiError;
          
          // Add AI response
          if (aiData.content) {
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: aiData.content,
              translation: aiData.translation,
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            
            // Update conversation history
            if (aiData.updatedHistory) {
              setConversationHistory(aiData.updatedHistory);
            }
            
            // Generate and play audio response
            try {
              const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
                body: { 
                  text: aiData.content,
                  userLanguage: currentLanguage
                }
              });
              
              if (ttsError) {
                console.error('Error generating speech:', ttsError);
                throw ttsError;
              } else if (ttsData.audioContent && audioRef.current) {
                const audioSrc = `data:audio/mp3;base64,${ttsData.audioContent}`;
                audioRef.current.src = audioSrc;
                await audioRef.current.play().catch(playError => {
                  console.error('Error playing audio:', playError);
                  toast({
                    title: t("error"),
                    description: t("audioPlaybackError"),
                    variant: "destructive",
                  });
                });
              }
            } catch (ttsError) {
              console.error('Error with text-to-speech:', ttsError);
              toast({
                title: t("warning"),
                description: t("audioGenerationFailed"),
                variant: "warning",
              });
            }
          }
        }
      };
    } catch (error) {
      console.error('Error processing voice:', error);
      toast({
        title: t("error"),
        description: t("errorProcessingVoice"),
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    toast({
      title: t("success"),
      description: "Conversation history has been cleared",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("standardVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Have a natural conversation with our AI tutor! Practice your language skills in a relaxed setting with contextual responses and helpful corrections.`
            : currentLanguage === "spanish"
              ? `¡Mantén una conversación natural con nuestro tutor de IA! Practica tus habilidades lingüísticas en un entorno relajado con respuestas contextuales y correcciones útiles.`
              : `Tenha uma conversa natural com nosso tutor de IA! Pratique suas habilidades linguísticas em um ambiente descontraído com respostas contextuais e correções úteis.`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: This conversational AI focuses on natural conversation instead of grammar correction, adapting to your language level."
              : currentLanguage === "spanish"
                ? "Nota: Esta IA conversacional se centra en la conversación natural en lugar de la corrección gramatical, adaptándose a tu nivel de idioma."
                : "Nota: Esta IA conversacional se concentra na conversa natural em vez da correção gramatical, adaptando-se ao seu nível de idioma."}
          </p>
        </div>
      </div>

      <Card className="mb-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            {t("standardVoiceChat")}
          </h3>
          <div className="flex space-x-2">
            {messages.length > 0 && (
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
              >
                {t("clearConversation")}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-grow space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart4 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{t("selectCEFRLevel")}</span>
              </div>
              
              <Select
                value={cefrLevel}
                onValueChange={(value: string) => setCefrLevel(value as CEFRLevel)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("selectCEFRLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">{t("beginner")} (A1)</SelectItem>
                  <SelectItem value="A2">{t("elementary")} (A2)</SelectItem>
                  <SelectItem value="B1">{t("intermediate")} (B1)</SelectItem>
                  <SelectItem value="B2">{t("upperIntermediate")} (B2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-3 items-center">
              <Button 
                onClick={handleVoiceRecording}
                variant={isRecording ? "destructive" : "default"}
                className={isRecording ? "bg-red-500" : "bg-lingua-primary"}
                disabled={isProcessingVoice}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    {t("stopRecording")}
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    {t("startVoiceChat")}
                  </>
                )}
              </Button>
              
              {timeRemaining !== null && (
                <div className="text-sm bg-amber-50 px-4 py-2 rounded-full text-amber-800 flex items-center">
                  <Headphones className="h-4 w-4 mr-2" />
                  <span>{formatTime(timeRemaining)}</span>
                  <span className="ml-2">{t("dailyRemaining")}</span>
                </div>
              )}
            </div>
          </div>
          
          {isRecording && (
            <p className="text-sm text-gray-500 mt-4 animate-pulse flex items-center">
              <Mic className="h-4 w-4 mr-2 text-red-500" />
              {t("recordingActive")}
            </p>
          )}
        </div>
        
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto p-2">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Headphones className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("startVoiceChatting")}</p>
              <p className="text-sm mt-2">
                {t("tapMicToStart")}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-lingua-primary text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-1 shrink-0" />
                      <p>{message.content}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start">
                        <Bot className="h-4 w-4 mr-2 mt-1 shrink-0" />
                        <p>{message.content}</p>
                      </div>
                      {message.translation && (
                        <p className="text-sm mt-2 text-gray-500 pl-6">
                          {message.translation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isProcessingVoice && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={conversationEndRef} />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t("standardVoiceInfo")}</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="bg-green-100 text-green-800 px-1 rounded text-xs">✓</span>
              {t("openAIVoiceModel")}
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-100 text-green-800 px-1 rounded text-xs">✓</span>
              {t("tenMinutesDaily")}
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-100 text-amber-800 px-1 rounded text-xs">!</span>
              {t("upgradePremium")}
            </li>
          </ul>
        </div>
      </Card>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default ConversationalAI;

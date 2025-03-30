
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { getAgentIdForLanguage } from "@/components/certifications/utils/elevenLabsUtils";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const PremiumVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [usingMidTier, setUsingMidTier] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentUserInput, setCurrentUserInput] = useState<string>("");
  const [currentAiResponse, setCurrentAiResponse] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  
  const getAgentId = () => {
    return getAgentIdForLanguage(currentLanguage);
  };

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        setCurrentAiResponse(message.content);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
      setUsingFallback(true);
    },
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      }
    };

    initMicrophone();
  }, [toast, t]);

  useEffect(() => {
    let timerId: number | null = null;
    
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setVoiceChatTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit5MinReached"),
              });
              setUsingFallback(true);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isConversationActive(), voiceChatTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startConversation = async () => {
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (usingMidTier) {
        // Start mid-tier recording with browser APIs
        setIsRecording(true);
        startMidTierRecording();
        return;
      }
      
      if (usingFallback) {
        // Start fallback recording with browser APIs
        setIsRecording(true);
        startFallbackRecording();
        return;
      }
      
      const selectedAgentId = getAgentId();
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      if (isConversationActive()) {
        endConversation();
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const sessionId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      
      console.log(`Successfully started conversation session: ${sessionId}`);
      setIsRecording(true);
      setVoiceChatTimeRemaining(300); // 5 minutes
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
      setUsingFallback(true);
    }
  };

  const endConversation = async () => {
    if (usingMidTier || usingFallback) {
      stopRecording();
      setIsRecording(false);
      return;
    }
    
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      setIsRecording(false);
      setVoiceChatTimeRemaining(null);
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  // MediaRecorder for voice recording
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startMidTierRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];
          
          try {
            // First, transcribe the audio
            const { data: transcription, error: transcriptionError } = await supabase.functions.invoke(
              'transcribe-audio',
              { body: { audio: base64Audio } }
            );
            
            if (transcriptionError) {
              throw new Error(transcriptionError.message);
            }
            
            if (!transcription || !transcription.text) {
              throw new Error('Failed to transcribe audio');
            }
            
            const userText = transcription.text.trim();
            setCurrentUserInput(userText);
            
            // Now, send the transcription to the chatbot
            const { data: chatResponse, error: chatError } = await supabase.functions.invoke(
              'chat-with-tutor',
              { 
                body: { 
                  message: userText,
                  userLanguage: currentLanguage 
                } 
              }
            );
            
            if (chatError) {
              throw new Error(chatError.message);
            }
            
            const aiResponseText = chatResponse.content;
            setCurrentAiResponse(aiResponseText);
            
            // Now, generate advanced speech from the AI response using GPT-4o-mini TTS
            // This will use the more advanced GPT-4o-mini TTS capability which is better than basic TTS
            try {
              const { data: apiKeyData } = await supabase.functions.invoke('get-api-key', {
                body: { service: 'openai' }
              });
              
              const openaiApiKey = apiKeyData?.key;
              
              if (!openaiApiKey) {
                throw new Error('Failed to retrieve OpenAI API key');
              }

              const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'tts-1-hd', // Using the high-definition TTS model
                  input: aiResponseText,
                  voice: 'nova', // Using a more natural-sounding voice
                  response_format: 'mp3',
                }),
              });
              
              if (!response.ok) {
                throw new Error(`OpenAI API error: ${await response.text()}`);
              }
              
              // Convert audio buffer to base64 for playback
              const arrayBuffer = await response.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              let binary = '';
              uint8Array.forEach((byte) => {
                binary += String.fromCharCode(byte);
              });
              const base64 = btoa(binary);
              
              setAudioUrl(`data:audio/mp3;base64,${base64}`);
              
              // Play the audio
              if (audioRef.current) {
                audioRef.current.src = `data:audio/mp3;base64,${base64}`;
                audioRef.current.play();
              }
            } catch (ttsError) {
              console.error('Error with GPT-4o TTS:', ttsError);
              // Fallback to standard TTS if advanced TTS fails
              const { data: speechData, error: speechError } = await supabase.functions.invoke(
                'text-to-speech',
                { 
                  body: { 
                    text: aiResponseText,
                    voice: 'alloy' 
                  } 
                }
              );
              
              if (speechError) {
                throw new Error(speechError.message);
              }
              
              // Play the audio
              if (speechData && speechData.audioContent) {
                const audio = new Audio(`data:audio/mp3;base64,${speechData.audioContent}`);
                setAudioUrl(`data:audio/mp3;base64,${speechData.audioContent}`);
                audio.play();
              }
            }
            
          } catch (error) {
            console.error('Error in mid-tier processing:', error);
            toast({
              title: t("error"),
              description: error instanceof Error ? error.message : 'An error occurred',
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        };
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: t("listeningNow"),
        description: t("startSpeaking"),
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : 'Failed to start recording',
        variant: "destructive",
      });
    }
  };

  const startFallbackRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];
          
          try {
            // First, transcribe the audio
            const { data: transcription, error: transcriptionError } = await supabase.functions.invoke(
              'transcribe-audio',
              { body: { audio: base64Audio } }
            );
            
            if (transcriptionError) {
              throw new Error(transcriptionError.message);
            }
            
            if (!transcription || !transcription.text) {
              throw new Error('Failed to transcribe audio');
            }
            
            const userText = transcription.text.trim();
            setCurrentUserInput(userText);
            
            // Now, send the transcription to the chatbot
            const { data: chatResponse, error: chatError } = await supabase.functions.invoke(
              'chat-with-tutor',
              { 
                body: { 
                  message: userText,
                  userLanguage: currentLanguage 
                } 
              }
            );
            
            if (chatError) {
              throw new Error(chatError.message);
            }
            
            const aiResponseText = chatResponse.content;
            setCurrentAiResponse(aiResponseText);
            
            // Now, generate speech from the AI response
            const { data: speechData, error: speechError } = await supabase.functions.invoke(
              'text-to-speech',
              { 
                body: { 
                  text: aiResponseText,
                  voice: 'alloy' 
                } 
              }
            );
            
            if (speechError) {
              throw new Error(speechError.message);
            }
            
            // Play the audio
            if (speechData && speechData.audioContent) {
              const audio = new Audio(`data:audio/mp3;base64,${speechData.audioContent}`);
              setAudioUrl(`data:audio/mp3;base64,${speechData.audioContent}`);
              audio.play();
            }
          } catch (error) {
            console.error('Error in fallback processing:', error);
            toast({
              title: t("error"),
              description: error instanceof Error ? error.message : 'An error occurred',
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        };
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: t("listeningNow"),
        description: t("startSpeaking"),
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : 'Failed to start recording',
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return { practice: "Spanish", native: "English" };
    } else if (currentLanguage === "spanish") {
      return { practice: "English", native: "Spanish" };
    } else if (currentLanguage === "portuguese") {
      return { practice: "English", native: "Portuguese" };
    }
    return { practice: "Spanish", native: "English" };
  };

  const switchToMidTier = () => {
    if (isConversationActive()) {
      endConversation();
    }
    setUsingFallback(false);
    setUsingMidTier(true);
    toast({
      title: "Mid-Tier Voice Enabled",
      description: currentLanguage === "english" 
        ? "Using OpenAI's HD TTS voice model. Record one message at a time." 
        : currentLanguage === "spanish"
          ? "Usando el modelo de voz HD TTS de OpenAI. Graba un mensaje a la vez."
          : "Usando o modelo de voz HD TTS da OpenAI. Grave uma mensagem de cada vez.",
    });
  };

  const switchToPremium = () => {
    setUsingFallback(false);
    setUsingMidTier(false);
    toast({
      title: "Premium Voice Enabled",
      description: currentLanguage === "english" 
        ? "Using ElevenLabs realistic voice technology." 
        : currentLanguage === "spanish"
          ? "Usando la tecnología de voz realista de ElevenLabs."
          : "Usando a tecnologia de voz realista da ElevenLabs.",
    });
  };

  const switchToFallback = () => {
    if (isConversationActive()) {
      endConversation();
    }
    setUsingFallback(true);
    setUsingMidTier(false);
    toast({
      title: "Basic Voice Enabled",
      description: currentLanguage === "english" 
        ? "Using basic TTS voice model. Record one message at a time." 
        : currentLanguage === "spanish"
          ? "Usando el modelo de voz TTS básico. Graba un mensaje a la vez."
          : "Usando o modelo de voz TTS básico. Grave uma mensagem de cada vez.",
    });
  };

  const { practice, native } = getLanguagePair();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("premiumVoiceChat")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Have natural voice conversations with our AI tutor to practice your ${practice}! The AI will help correct your grammar, vocabulary, and pronunciation.`
            : currentLanguage === "spanish"
              ? `¡Mantén conversaciones de voz naturales con nuestro tutor de IA premium para practicar tu ${practice}! La IA te ayudará a corregir tu gramática, vocabulario y pronunciación.`
              : `Tenha conversas de voz naturais com nosso tutor de IA premium para praticar seu ${practice}! A IA irá ajudá-lo a corrigir sua gramática, vocabulário e pronúncia.`}
        </p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button 
            onClick={switchToPremium} 
            variant={!usingFallback && !usingMidTier ? "default" : "outline"}
            className={!usingFallback && !usingMidTier ? "bg-lingua-primary hover:bg-lingua-primary/90" : ""}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {currentLanguage === "english" 
              ? "Premium Voice" 
              : currentLanguage === "spanish"
                ? "Voz Premium"
                : "Voz Premium"}
          </Button>
          
          <Button 
            onClick={switchToMidTier} 
            variant={usingMidTier ? "default" : "outline"}
            className={usingMidTier ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {t("midTierVoice")}
          </Button>
          
          <Button 
            onClick={switchToFallback} 
            variant={usingFallback ? "default" : "outline"}
            className={usingFallback ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            <Headphones className="h-4 w-4 mr-2" />
            {t("basicVoice")}
          </Button>
        </div>
        
        <div className={`border rounded-md p-3 mb-4 ${
          usingMidTier 
            ? "bg-indigo-50 border-indigo-200" 
            : usingFallback 
              ? "bg-amber-50 border-amber-200" 
              : "bg-blue-50 border-blue-200"
        }`}>
          <p className={`text-sm ${
            usingMidTier 
              ? "text-indigo-800" 
              : usingFallback 
                ? "text-amber-800" 
                : "text-blue-800"
          }`}>
            {usingMidTier 
              ? t("usingMidTierVoice")
              : usingFallback 
                ? t("usingFallbackMode")
                : (currentLanguage === "english" 
                    ? "Premium voice conversations use ElevenLabs realistic voice technology. There is a 5-minute conversational limit per session."
                    : currentLanguage === "spanish"
                      ? "Las conversaciones de voz premium utilizan la tecnología de voz realista de ElevenLabs. Hay un límite de conversación de 5 minutos por sesión."
                      : "As conversas de voz premium usam a tecnologia de voz realista da ElevenLabs. Há um limite de conversação de 5 minutos por sessão.")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={startConversation}
            variant={isRecording ? "destructive" : "default"}
            className={isRecording ? "" : "bg-lingua-primary hover:bg-lingua-primary/90"}
            disabled={isProcessing}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                {t("stopVoiceChat")}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {usingMidTier || usingFallback ? t("startSpeaking") : t("startVoiceChat")}
              </>
            )}
          </Button>
          
          {voiceChatTimeRemaining !== null && !usingFallback && !usingMidTier && (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Headphones className="h-4 w-4" />
              <span>{formatTime(voiceChatTimeRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      <Card className="mb-6 p-6">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lingua-primary mb-4"></div>
            <p className="text-gray-600">{t("processing")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {currentUserInput && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">{t("youSaid")}</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p>{currentUserInput}</p>
                </div>
              </div>
            )}
            
            {currentAiResponse && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-700">{t("aiResponse")}</h3>
                  {audioUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1 text-lingua-primary"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.play();
                        }
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                      {t("playAgain")}
                    </Button>
                  )}
                </div>
                <div className="bg-lingua-primary/10 p-4 rounded-lg">
                  <p>{currentAiResponse}</p>
                </div>
              </div>
            )}
            
            {!currentUserInput && !currentAiResponse && (
              <div className="text-center py-8 text-gray-500">
                <Volume2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t("startChatting")}</p>
                <p className="text-sm mt-2">
                  {microphoneAccess 
                    ? usingMidTier || usingFallback
                      ? t("clickToStartVoice") 
                      : t("clickToStartVoice")
                    : t("allowMicAccess")}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Hidden audio element for playing generated speech */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
      
      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-3">
          {t("premiumVoiceChatBenefits")}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Volume2 className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>
              {currentLanguage === "english"
                ? "Natural, human-like voice interactions using advanced AI technology"
                : currentLanguage === "spanish"
                  ? "Interacciones de voz naturales y humanas utilizando tecnología avanzada de IA"
                  : "Interações de voz naturais e humanas usando tecnologia avançada de IA"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Headphones className="h-5 w-5 text-lingua-primary mt-0.5" />
            <span>
              {currentLanguage === "english"
                ? "Accurate accent and pronunciation for immersive learning"
                : currentLanguage === "spanish"
                  ? "Acento y pronunciación precisos para un aprendizaje inmersivo"
                  : "Sotaque e pronúncia precisos para aprendizado imersivo"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PremiumVoiceChat;


import { useState, useEffect, useRef } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const VoiceChat = () => {
  const { currentLanguage, t } = useLocalization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const resetTranscriptAndAudio = () => {
    setCurrentTranscript("");
    setAudioUrl(null);
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const clearConversation = () => {
    setMessages([]);
    resetTranscriptAndAudio();
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecognition();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    resetTranscriptAndAudio();

    // Check if the browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Set recognition language based on current UI language
      if (currentLanguage === "spanish") {
        recognition.lang = "es-ES";
      } else if (currentLanguage === "portuguese") {
        recognition.lang = "pt-BR";
      } else if (currentLanguage === "korean") {
        recognition.lang = "ko-KR";
      } else if (currentLanguage === "arabic") {
        recognition.lang = "ar-SA";
      } else {
        recognition.lang = "en-US";
      }

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: t("listeningNow"),
          description: "",
        });
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setCurrentTranscript(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Only update for interim results if they exist
        if (interimTranscript !== "") {
          setCurrentTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        toast({
          title: t("speechRecognitionError"),
          description: event.error,
          variant: "destructive",
        });
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (currentTranscript) {
          const userMessage: Message = {
            role: "user",
            content: currentTranscript,
          };
          setMessages((prev) => [...prev, userMessage]);
          
          // Send for AI response
          getAIResponse(currentTranscript);
        }
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: t("error"),
        description: t("speechRecognitionError"),
        variant: "destructive",
      });
    }
  };

  const getAIResponse = async (transcript: string) => {
    setIsLoading(true);
    try {
      // Call Supabase Edge Function for AI response
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: transcript,
          userLanguage: currentLanguage,
          responseFormat: "concise" // Request a more concise response suitable for TTS
        }
      });

      if (error) throw error;

      // Add AI response to messages
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Generate speech from AI response
      generateSpeech(data.content);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSpeech = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: "alloy" }
      });

      if (error) throw error;

      // Create audio URL from the base64-encoded audio data
      const audioData = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        uint8Array[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          toast({
            title: t("error"),
            description: t("audioPlaybackError"),
            variant: "destructive",
          });
        });
      }
    } catch (error) {
      console.error("Failed to generate speech:", error);
      toast({
        title: t("error"),
        description: t("failedToGenerateSpeech"),
        variant: "destructive",
      });
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        toast({
          title: t("error"),
          description: t("audioPlaybackError"),
          variant: "destructive",
        });
      });
    }
  };

  useEffect(() => {
    // Cleanup audio URLs when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioUrl]);

  const getPageDescription = () => {
    if (currentLanguage === "english") {
      return "Practice speaking and listening skills with our voice chat feature. The AI will listen to your Spanish pronunciation and respond in a natural way, helping you improve your conversational skills.";
    } else if (currentLanguage === "spanish") {
      return "Practica tus habilidades de hablar y escuchar con nuestra función de chat de voz. La IA escuchará tu pronunciación en inglés y responderá de manera natural, ayudándote a mejorar tus habilidades de conversación.";
    } else if (currentLanguage === "portuguese") {
      return "Pratique suas habilidades de fala e audição com nosso recurso de chat de voz. A IA ouvirá sua pronúncia em inglês e responderá de forma natural, ajudando você a melhorar suas habilidades de conversação.";
    } else if (currentLanguage === "korean") {
      return "음성 채팅 기능으로 말하기와 듣기 능력을 연습하세요. AI는 귀하의 영어 발음을 듣고 자연스럽게 응답하여 대화 능력을 향상시키는 데 도움을 줍니다.";
    } else if (currentLanguage === "arabic") {
      return "مارس مهارات التحدث والاستماع باستخدام ميزة الدردشة الصوتية. سيستمع الذكاء الاصطناعي إلى نطقك للغة الإنجليزية ويستجيب بطريقة طبيعية، مما يساعدك على تحسين مهارات المحادثة لديك.";
    } else {
      return "Practice speaking and listening skills with our voice chat feature.";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {getPageDescription()}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: This is the standard voice practice feature. For premium voice features with natural voice quality, try our Premium Voice Chat." 
              : currentLanguage === "spanish"
                ? "Nota: Esta es la función de práctica de voz estándar. Para funciones de voz premium con calidad de voz natural, prueba nuestro Chat de Voz Premium."
                : currentLanguage === "portuguese"
                  ? "Nota: Este é o recurso padrão de prática de voz. Para recursos de voz premium com qualidade de voz natural, experimente nosso Chat de Voz Premium."
                  : currentLanguage === "korean"
                    ? "참고: 이것은 표준 음성 연습 기능입니다. 자연스러운 음성 품질의 프리미엄 음성 기능을 원하시면 프리미엄 음성 채팅을 사용해 보세요."
                    : currentLanguage === "arabic"
                      ? "ملاحظة: هذه هي ميزة ممارسة الصوت القياسية. للحصول على ميزات صوتية متميزة ذات جودة صوت طبيعية، جرب الدردشة الصوتية المتميزة."
                      : "Note: This is the standard voice practice feature. For premium voice features with natural voice quality, try our Premium Voice Chat."}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("youSaid")}</h2>
          <div className="min-h-[100px] mb-4 bg-gray-50 rounded-lg p-4">
            {isRecording ? (
              <div className="flex items-center text-amber-600">
                <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse mr-2"></div>
                <p>{currentTranscript || t("listeningNow")}</p>
              </div>
            ) : (
              <p className="text-gray-500">
                {currentTranscript || 
                  (currentLanguage === "arabic" 
                    ? "اضغط على زر الميكروفون لبدء التحدث..."
                    : "Press the microphone button to start speaking...")}
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "default"}
              className={isRecording ? "bg-red-500" : "bg-lingua-primary"}
              size="lg"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  {t("stopListening")}
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  {t("startSpeaking")}
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("aiResponse")}</h2>
          <div className="min-h-[100px] mb-4 bg-gray-50 rounded-lg p-4">
            {isLoading ? (
              <div className="flex space-x-2 justify-center items-center h-full">
                <div className="w-2 h-2 bg-lingua-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-lingua-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-lingua-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              messages.length > 0 && messages[messages.length - 1].role === "assistant" ? (
                <p>{messages[messages.length - 1].content}</p>
              ) : (
                <p className="text-gray-500">
                  {currentLanguage === "arabic" 
                    ? "ستظهر ردود الذكاء الاصطناعي هنا..."
                    : "AI responses will appear here..."}
                </p>
              )
            )}
          </div>
          {audioUrl && (
            <div className="flex justify-center">
              <Button onClick={playAudio} className="bg-lingua-primary">
                <Volume2 className="h-5 w-5 mr-2" />
                {t("playAgain")}
              </Button>
              <audio ref={audioRef} src={audioUrl} />
            </div>
          )}
        </Card>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{t("conversationHistory")}</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-[300px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">
              {currentLanguage === "arabic" 
                ? "ستظهر محادثتك هنا..."
                : "Your conversation will appear here..."}
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-lingua-primary/10 ml-12"
                    : "bg-gray-100 mr-12"
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === "user" 
                    ? (currentLanguage === "arabic" ? "أنت:" : "You:") 
                    : (currentLanguage === "arabic" ? "المعلم:" : "Tutor:")}
                </p>
                <p>{message.content}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={clearConversation}
            className="text-red-500 border-red-300 hover:bg-red-50"
            disabled={messages.length === 0}
          >
            <Trash className="h-4 w-4 mr-2" />
            {t("clearConversation")}
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        <h3 className="font-semibold mb-3">{t("practiceWithVoiceChat")}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {t("practiceLanguageTips")}
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>{t("askQuestionsAboutTopics")}</li>
          <li>{t("practiceEverydayPhrases")}</li>
          <li>{t("describeImagesOrScenes")}</li>
          <li>{t("practiceVocabularyForSpecificTopics")}</li>
        </ul>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <p className="flex items-center">
          <Volume2 className="h-4 w-4 mr-2" />
          {t("aiModelInfo")}
        </p>
      </div>
    </div>
  );
};

export default VoiceChat;

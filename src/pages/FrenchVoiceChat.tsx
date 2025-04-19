
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";
import FrenchChatPane from "@/components/french-voice/FrenchChatPane";
import FrenchVoiceControls from "@/components/french-voice/FrenchVoiceControls";
import { playTTS } from "@/utils/ttsUtils";

const FrenchVoiceChat = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages, addMessage, clearMessages } = useVoiceChatMessages();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: t("speechRecognitionNotSupported"),
        description: t("tryTextChatInstead"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => {
        setIsRecording(false);
        if (recognizedText) {
          processUserInput(recognizedText);
        }
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(transcript);
      };
      
      recognition.onerror = (event: Event) => {
        console.error("Speech recognition error", (event as any).error);
        setIsRecording(false);
        toast({
          title: t("speechRecognitionError"),
          description: (event as any).error,
          variant: "destructive",
        });
      };
      
      recognition.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      toast({
        title: t("speechRecognitionError"),
        description: t("microphoneAccessRequired"),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processUserInput = async (text: string) => {
    if (!text.trim()) return;
    
    addMessage('user', text);
    setRecognizedText("");
    setIsProcessing(true);
    
    try {
      // Simple response patterns for French practice
      let response = "";
      const lowerInput = text.toLowerCase();
      
      if (lowerInput.includes("bonjour") || lowerInput.includes("salut")) {
        response = "Bonjour! Comment allez-vous aujourd'hui?";
      } else if (lowerInput.includes("merci")) {
        response = "Je vous en prie! C'est un plaisir de vous aider.";
      } else if (lowerInput.includes("au revoir")) {
        response = "Au revoir! À bientôt!";
      } else {
        response = "Continuons à pratiquer le français. Pouvez-vous me parler de vos intérêts?";
      }
      
      addMessage('assistant', response);
      await playTTS({
        text: response,
        language: 'fr-FR',
        onError: (error) => {
          console.error('TTS error:', error);
          toast({
            title: t("error"),
            description: t("audioPlaybackError"),
            variant: "destructive",
          });
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplayLast = () => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
      playTTS({
        text: lastAssistantMessage.content,
        language: 'fr-FR',
        onError: (error) => {
          console.error('TTS error:', error);
          toast({
            title: t("error"),
            description: t("audioPlaybackError"),
            variant: "destructive",
          });
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <AuthRequiredPrompt />;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t("frenchVoicePractice")}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("practiceWithVoiceChat")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FrenchChatPane messages={messages} />
                
                <Separator className="my-4" />
                
                {recognizedText && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      {t("youSaid")}:
                    </p>
                    <p>{recognizedText}</p>
                  </div>
                )}
                
                <FrenchVoiceControls
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onReplayLast={handleReplayLast}
                  hasMessages={messages.some(m => m.role === 'assistant')}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("useThisTool")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-lingua-primary mr-2">•</span>
                    {t("askQuestions")}
                  </li>
                  <li className="flex items-start">
                    <span className="text-lingua-primary mr-2">•</span>
                    {t("practiceCommonPhrases")}
                  </li>
                  <li className="flex items-start">
                    <span className="text-lingua-primary mr-2">•</span>
                    {t("describeWhatYouSee")}
                  </li>
                  <li className="flex items-start">
                    <span className="text-lingua-primary mr-2">•</span>
                    {t("practiceVocabularyForSpecific")}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrenchVoiceChat;

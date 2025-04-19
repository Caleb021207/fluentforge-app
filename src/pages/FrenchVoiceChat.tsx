
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, MessageSquare, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Separator } from "@/components/ui/separator";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { getSpeechSynthesisLanguageCode } from "@/utils/languageUtils";
import { useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";

type ConversationPaneProps = {
  messages: any[];
};

const ConversationPane = ({ messages }: ConversationPaneProps) => {
  const { t } = useLocalization();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center p-4">
        <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500">{t("emptyConversationPrompt")}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="space-y-4 overflow-y-auto max-h-[300px] p-4"
    >
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-lingua-primary text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

type ConversationStartersProps = {
  onStarterClick: (starter: string) => void;
};

const ConversationStarters = ({ onStarterClick }: ConversationStartersProps) => {
  const { t } = useLocalization();
  
  const starters = [
    { key: "phrase1", native: true },
    { key: "phrase2", native: true },
    { key: "phrase3", native: true },
    { key: "phrase4", native: false },
    { key: "phrase5", native: false },
    { key: "phrase6", native: false },
  ];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("conversationStarters")}</CardTitle>
        <p className="text-sm text-gray-500">{t("tryThesePhrases")}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {starters.map((starter) => (
            <Button
              key={starter.key}
              variant="outline"
              className="justify-start h-auto py-2 text-sm"
              onClick={() => onStarterClick(t(starter.key))}
            >
              {t(starter.key)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const FrenchVoiceChat = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSignedIn, isLoading } = useAuthGuard();
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages, addMessage, clearMessages } = useVoiceChatMessages();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

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
      
      // Set French recognition language for French voice chat
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
      
      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        toast({
          title: t("speechRecognitionError"),
          description: event.error,
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
  
  const simulateAIResponse = async (userInput: string) => {
    setIsProcessing(true);
    
    try {
      // This is a simulated response for French language learning
      // In a real implementation, this would call an actual API
      
      // Simple pattern matching for common French phrases
      let response = "";
      const lowerInput = userInput.toLowerCase();
      
      // Some basic response patterns for French practice
      if (lowerInput.includes("bonjour") || lowerInput.includes("hello")) {
        response = "Bonjour! Comment allez-vous aujourd'hui? (Hello! How are you today?)";
      } else if (lowerInput.includes("comment") && (lowerInput.includes("allez") || lowerInput.includes("va"))) {
        response = "Je vais très bien, merci! Et vous? (I'm doing very well, thank you! And you?)";
      } else if (lowerInput.includes("merci") || lowerInput.includes("thank")) {
        response = "De rien! Je suis content de pouvoir vous aider. (You're welcome! I'm happy to help you.)";
      } else if (lowerInput.includes("parle") && lowerInput.includes("français")) {
        response = "Oui, nous pratiquons le français ensemble maintenant. Comment puis-je vous aider? (Yes, we are practicing French together now. How can I help you?)";
      } else if (lowerInput.includes("weather") || lowerInput.includes("temps")) {
        response = "Parlons du temps! En français, on dit 'Il fait beau' quand il y a du soleil. Comment est le temps chez vous? (Let's talk about the weather! In French, we say 'Il fait beau' when it's sunny. How's the weather where you are?)";
      } else {
        response = "Je vous comprends. Continuons à pratiquer le français ensemble. Pouvez-vous me parler de vos intérêts? (I understand you. Let's continue practicing French together. Can you tell me about your interests?)";
      }
      
      // Delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAiResponseText(response);
      return response;
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: t("failedToGetResponse"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    if (!synthRef.current.speaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR'; // French voice
      utterance.rate = 0.9; // Slightly slower for learning
      
      synthRef.current.speak(utterance);
    }
  };
  
  const processUserInput = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    addMessage('user', text);
    setRecognizedText("");
    
    // Get AI response
    const response = await simulateAIResponse(text);
    if (response) {
      addMessage('assistant', response);
      speakResponse(response);
    }
  };
  
  const handleStarterClick = (starter: string) => {
    setRecognizedText(starter);
    processUserInput(starter);
  };
  
  const handleClearConversation = () => {
    clearMessages();
    toast({
      title: t("conversationHistoryCleared"),
    });
  };
  
  const handleReplayLastResponse = () => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
      speakResponse(lastAssistantMessage.content);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-10 w-10 text-lingua-primary animate-spin mb-4" />
          <p>{t("loadingYourSession")}</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthRequiredPrompt />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {t("frenchVoicePractice")}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("practiceWithVoiceChat")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversationPane messages={messages} />
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  {recognizedText && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">
                        {t("youSaid")}:
                      </p>
                      <p>{recognizedText}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          {t("stopListening")}
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          {t("startSpeaking")}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleReplayLastResponse}
                      disabled={!messages.some(m => m.role === 'assistant')}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t("playAgain")}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleClearConversation}
                      disabled={messages.length === 0}
                    >
                      {t("clearConversation")}
                    </Button>
                  </div>
                </div>
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
            
            <ConversationStarters onStarterClick={handleStarterClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrenchVoiceChat;

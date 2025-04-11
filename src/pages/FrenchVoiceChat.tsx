
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, MessageSquare, Clock } from "lucide-react";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import PracticeHeader from "@/components/practice/PracticeHeader";
import PracticeGuide from "@/components/practice/PracticeGuide";
import ChatContainer from "@/components/practice/ChatContainer";
import ChatMessage from "@/components/practice/ChatMessage";
import { VoiceMessage, useVoiceChatMessages } from "@/hooks/useVoiceChatMessages";

const FrenchVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const [timer, setTimer] = useState<number | null>(null);
  
  useEffect(() => {
    // Set target language to French in localStorage
    localStorage.setItem("targetLanguage", "french");
  }, []);
  
  const {
    microphoneAccess,
    voiceChatTimeRemaining,
    isConversationActive,
    startVoiceConversation,
    endVoiceConversation,
    conversation
  } = useVoiceChat();

  const { messages, clearMessages, addMessage } = useVoiceChatMessages();
  
  useEffect(() => {
    // Start a timer when recording begins
    if (isRecording) {
      setTimer(300); // 5 minutes in seconds
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            handleStopListening();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isRecording]);
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartListening = async () => {
    try {
      if (!microphoneAccess) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          toast({
            title: t("microphoneAccessRequired"),
            description: t("allowMicrophoneAccess"),
            variant: "destructive",
          });
          return;
        }
      }

      // If already recording, stop it
      if (isRecording) {
        handleStopListening();
        return;
      }
      
      // Start a new conversation
      setIsRecording(true);
      
      // Add initial message
      addMessage("assistant", "Bonjour ! Je suis là pour vous aider à pratiquer le français. Qu'aimeriez-vous aborder aujourd'hui ?", 
        "Hello! I'm here to help you practice French. What would you like to talk about today?");
      
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      toast({
        title: t("speechRecognitionError"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }
  };

  const handleStopListening = () => {
    setIsRecording(false);
    setTimer(null);
  };

  const handleClearConversation = () => {
    clearMessages();
    toast({
      title: t("success"),
      description: t("conversationHistoryCleared"),
    });
  };

  const getPlaceholderText = () => {
    if (isRecording) {
      return t("listeningNow");
    }
    return t("startSpeaking");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to conversation
    addMessage("user", input);
    
    // Clear input
    setInput("");
    
    // TODO: Process input and get AI response
    // This would be replaced with actual API call in a real implementation
    setTimeout(() => {
      addMessage("assistant", "Je comprends ce que vous dites. Comment puis-je vous aider avec votre français ?", 
        "I understand what you're saying. How can I help you with your French?");
    }, 1000);
  };

  // Conversation starters for French
  const frenchConversationStarters = [
    { french: "Bonjour, comment allez-vous aujourd'hui ?", english: "Hello, how are you today?" },
    { french: "Quel temps fait-il chez vous ?", english: "What's the weather like where you are?" },
    { french: "Pouvez-vous recommander un bon restaurant ?", english: "Can you recommend a good restaurant?" },
    { french: "Quels sont vos passe-temps et centres d'intérêt ?", english: "What are your hobbies and interests?" },
    { french: "Parlez-moi de votre livre ou film préféré.", english: "Tell me about your favorite book or movie." },
    { french: "Qu'avez-vous fait le week-end dernier ?", english: "What did you do last weekend?" },
    { french: "Quels sont vos projets pour demain ?", english: "What are your plans for tomorrow?" },
    { french: "Comment dit-on... en anglais ?", english: "How do you say... in English?" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 mb-10">
      <PracticeHeader targetLanguage="french" />
      
      <div className="flex justify-center mb-8">
        <Button
          onClick={handleStartListening}
          disabled={!microphoneAccess}
          className={`gap-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
          size="lg"
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              {t("stopListening")}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              {t("startSpeaking")}
            </>
          )}
        </Button>
        
        {timer !== null && (
          <div className="ml-4 flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatTime(timer)}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-4 p-6">
            <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  translation={message.role === "assistant" ? "Translation will appear here when speaking French" : undefined}
                />
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholderText()}
                className="w-full p-3 border rounded-md pr-28"
                disabled={isRecording}
              />
              <Button 
                type="submit" 
                className="absolute right-1 top-1 h-[calc(100%-8px)]"
                disabled={!input.trim() || isRecording}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </Card>
          
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-medium">{t("conversationHistory")}</h2>
            <Button variant="outline" size="sm" onClick={handleClearConversation}>
              {t("clearConversation")}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mb-6">
            {t("aiModelInfo")}
          </div>
        </div>
        
        <div className="space-y-6">
          <PracticeGuide targetLanguage="french" />
          
          <Card>
            <div className="p-4">
              <h3 className="font-medium mb-3">{t("conversationStarters")}</h3>
              <p className="text-sm text-gray-600 mb-3">{t("tryThesePhrases")}</p>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">{t("inYourTargetLanguage")}:</h4>
                <ul className="space-y-2 text-sm">
                  {frenchConversationStarters.slice(0, 4).map((starter, i) => (
                    <li key={i} className="pl-2 border-l-2 border-lingua-primary">
                      {starter.french}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">{t("inYourNativeLanguage")}:</h4>
                <ul className="space-y-2 text-sm">
                  {frenchConversationStarters.slice(0, 4).map((starter, i) => (
                    <li key={i} className="pl-2 border-l-2 border-gray-300">
                      {starter.english}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
          
          <div className="text-xs text-gray-500 italic">
            {t("browserBasedTTS")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrenchVoiceChat;

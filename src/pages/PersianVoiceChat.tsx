
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { Link } from "react-router-dom";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

const PersianVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  
  const { toast } = useToast();
  const { t } = useLocalization();

  // Right-to-left support
  const rtlStyle = { direction: 'rtl', textAlign: 'right' as const };

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  useEffect(() => {
    // Initialize the audio and media recorder
    const setupMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.onstart = () => {
          setAudioChunks([]);
          setRecording(true);
        };
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setAudioChunks(prev => [...prev, e.data]);
          }
        };
        
        recorder.onstop = async () => {
          setRecording(false);
          if (audioChunks.length === 0) return;
          
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await processAudio(audioBlob);
        };
        
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error setting up media recorder:", error);
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
      }
    };
    
    setupMediaRecorder();
    
    return () => {
      // Clean up
      if (mediaRecorder && recording) {
        mediaRecorder.stop();
      }
    };
  }, [toast, t, audioChunks]);

  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      // Convert Blob to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        if (!base64Audio) {
          throw new Error("Failed to convert audio to base64");
        }
        
        // Call Supabase edge function to transcribe
        const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
          'transcribe-audio', 
          {
            body: { audio: base64Audio },
          }
        );
        
        if (transcriptionError) {
          throw transcriptionError;
        }
        
        if (!transcriptionData.text) {
          throw new Error("No transcription returned");
        }
        
        setTranscript(transcriptionData.text);
        await handleSendTranscript(transcriptionData.text);
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsLoading(false);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    }
  };

  const toggleRecording = () => {
    if (!mediaRecorder) {
      toast({
        title: t("error"),
        description: t("microphoneAccessRequired"),
        variant: "destructive",
      });
      return;
    }
    
    if (recording) {
      mediaRecorder.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setGptResponse("");
      setTranslation("");
      mediaRecorder.start();
      setIsListening(true);
    }
  };

  const handleSendTranscript = async (text: string) => {
    setIsLoading(true);
    
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      // Calling the specialized chat-with-gpt function (or we could create a chat-with-persian-tutor function)
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: 'persian',
          conversationHistory: apiConversationHistory,
          cefrLevel: 'B1'
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      const translationText = data.translation || "";
      
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: content,
        translation: translationText,
        timestamp: new Date()
      };
      
      setGptResponse(content);
      setTranslation(translationText);
      setConversationHistory(prev => [...prev, aiMessage]);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);
      
      // Use OpenAI's TTS-1 to generate speech
      await speakWithTTS(content);
    } catch (error) {
      console.error('Error getting GPT response:', error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakWithTTS = async (text: string) => {
    setIsSpeaking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: 'alloy' // You can use: alloy, echo, fable, onyx, nova, shimmer
        }
      });

      if (error) throw error;
      
      if (!data.audioContent) {
        throw new Error("No audio content received");
      }
      
      // Create and play the audio
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      
      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.onloadedmetadata = () => {
          audioRef.current?.play();
        };
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
        };
        
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e);
          setIsSpeaking(false);
          toast({
            title: t("error"),
            description: t("speechSynthesisError"),
            variant: "destructive",
          });
        };
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
      toast({
        title: t("error"),
        description: t("speechSynthesisError"),
        variant: "destructive",
      });
    }
  };

  const playAgain = () => {
    if (gptResponse) {
      speakWithTTS(gptResponse);
    }
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("success"),
      description: t("conversationHistoryCleared"),
    });
  };

  // Persian conversation starters
  const persianPhrases = [
    "سلام، حالت چطوره؟",
    "من در حال یادگیری انگلیسی هستم.",
    "می‌توانی به من کمک کنی؟",
    "اسم من چیست؟",
    "اهل کجا هستی؟",
    "دوست دارم با تو صحبت کنم.",
    "فردا چه برنامه‌ای داری؟",
    "من می‌خواهم به آمریکا سفر کنم."
  ];
  
  // English translations for the Persian phrases
  const englishPhrases = [
    "Hello, how are you?",
    "I am learning English.",
    "Can you help me?",
    "What is my name?",
    "Where are you from?",
    "I would like to talk with you.",
    "What plans do you have for tomorrow?",
    "I want to travel to America."
  ];

  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8" style={rtlStyle}>
        <div className="flex items-center mb-4">
          <Link to="/" className="ml-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-lingua-text">
            {t("persianVoiceAssistant")}
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          {t("persianVoiceDescription")}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm font-normal">
            {t("notSupportedByEleven")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500" style={rtlStyle}>
                <span className="font-medium">{t("practiceLevel")}: B1</span> - {t("cefrB1Description")}
              </p>
            </div>

            <Button
              onClick={toggleRecording}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              disabled={isLoading || isSpeaking}
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 ml-2" />
                  {t("stopListening")}
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 ml-2" />
                  {t("startSpeaking")}
                </>
              )}
            </Button>
          </div>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse" style={rtlStyle}>
              {t("listeningNow")}...
            </div>
          )}

          {transcript && (
            <div className="mb-6" style={rtlStyle}>
              <h3 className="font-medium mb-2">{t("youSaid")}:</h3>
              <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
                {transcript}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center my-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {gptResponse && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2" style={rtlStyle}>
                <h3 className="font-medium">{t("aiResponse")}:</h3>
                <Button 
                  onClick={playAgain} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4" />
                  {isSpeaking ? t("speaking") : t("playAgain")}
                </Button>
              </div>
              <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
                {gptResponse}
                
                {translation && (
                  <>
                    <div className="border-t border-gray-300 my-3"></div>
                    <div className="text-sm text-gray-600" style={rtlStyle}>
                      <strong>{t("translation")}:</strong> {translation}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
        
        {conversationHistory.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4" style={rtlStyle}>
              <h3 className="font-medium">
                {t("conversationHistory")}
              </h3>
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
              >
                {t("clearConversation")}
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    style={rtlStyle}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-100 text-gray-800' 
                          : 'bg-green-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.translation && (
                        <p className="text-xs mt-2 text-gray-600 border-t border-gray-200 pt-2">
                          <span className="font-medium">{t("translation")}:</span> {message.translation}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            </ScrollArea>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-medium mb-4" style={rtlStyle}>{t("conversationStarters")}</h3>
          <p className="text-sm text-gray-600 mb-4" style={rtlStyle}>
            {t("tryThesePhrases")}
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-lingua-primary" style={rtlStyle}>
                {t("inYourTargetLanguage")}: (English)
              </h4>
              <ul className="space-y-2">
                {englishPhrases.map((phrase, index) => (
                  <li 
                    key={`target-${index}`} 
                    className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => handlePhraseClick(phrase)}
                  >
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-lingua-primary" style={rtlStyle}>
                {t("inYourNativeLanguage")}: (فارسی)
              </h4>
              <ul className="space-y-2">
                {persianPhrases.map((phrase, index) => (
                  <li 
                    key={`native-${index}`} 
                    className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer rtl"
                    onClick={() => handlePhraseClick(phrase)}
                    style={rtlStyle}
                  >
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium mb-2" style={rtlStyle}>{t("practiceWithVoiceChat")}</h3>
          <p className="text-sm text-gray-600 mb-3" style={rtlStyle}>
            {t("practiceLanguageTips")}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1" style={rtlStyle}>
            <li>{t("askQuestionsAboutTopics")}</li>
            <li>{t("practiceEverydayPhrases")}</li>
            <li>{t("describeImagesOrScenes")}</li>
            <li>{t("practiceVocabularyForSpecificTopics")}</li>
          </ul>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default PersianVoiceChat;

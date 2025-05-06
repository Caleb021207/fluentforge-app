
import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair, getSpeechSynthesisLanguageCode } from "@/utils/languageUtils";
import { playTTS } from "@/utils/ttsUtils";
import ChatMessage from "@/components/practice/ChatMessage";
import { useSpeechRecognition, RecognitionState } from "@/hooks/useSpeechRecognition";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

const VoiceChat = () => {
  // Core state
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const cefrLevel = 'B1';
  
  // Refs
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const { practice: targetLanguage } = getLanguagePair(currentLanguage);
  const targetLanguageCode = getSpeechSynthesisLanguageCode(targetLanguage.toLowerCase());

  // Initialize speech recognition with our new custom hook
  const {
    isAvailable,
    state: recognitionState,
    startRecognition,
    stopRecognition,
    getTranscript,
    clearTranscript
  } = useSpeechRecognition({
    language: targetLanguageCode,
    onResult: (newTranscript) => {
      setTranscript(newTranscript);
    },
    onError: (error) => {
      toast({
        title: t("speechRecognitionError"),
        description: error,
        variant: "destructive",
      });
    },
    onSilence: () => {
      const currentTranscript = getTranscript();
      if (currentTranscript.trim()) {
        handleSendTranscript(currentTranscript);
        stopRecognition();
      }
    },
    silenceTimeout: 10000 // 10 seconds
  });

  // Scroll to bottom when conversation history updates
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  // Check for speech recognition availability on mount
  useEffect(() => {
    if (!isAvailable) {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }
  }, [isAvailable, toast, t]);

  const toggleListening = () => {
    if (recognitionState === RecognitionState.LISTENING || 
        recognitionState === RecognitionState.PROCESSING) {
      stopRecognition();
    } else {
      // Clear previous responses when starting new recording
      setGptResponse("");
      setTranslation("");
      
      const success = startRecognition();
      if (!success) {
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
      }
    }
  };

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    stopRecognition();
    setIsLoading(true);
    
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText && currentLanguage === "hindi") {
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got Hindi translation:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
        }
      }
      
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
      
      speakWithMetaMMS(content);
      clearTranscript();
      setTranscript("");
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

  const speakWithMetaMMS = useCallback((text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithMetaMMS');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..."`);
    
    const { practice } = getLanguagePair(currentLanguage);
    const practiceLanguage = practice.toLowerCase();
    
    setIsSpeaking(true);
    
    // Force the use of Meta MMS for supported languages
    const useMetaMms = true;
    
    playTTS({
      text: text,
      language: practiceLanguage,
      isTargetLanguage: true,
      useMetaMms: useMetaMms,
      onStart: () => {
        console.log("TTS started with Meta MMS");
        setIsSpeaking(true);
      },
      onEnd: () => {
        console.log("TTS ended");
        setIsSpeaking(false);
      },
      onError: (error) => {
        console.error("TTS error:", error);
        setIsSpeaking(false);
        toast({
          title: t("error"),
          description: t("failedToGenerateSpeech"),
          variant: "destructive",
        });
      }
    });
  }, [currentLanguage, toast, t]);

  const playAgain = useCallback(() => {
    if (gptResponse) {
      speakWithMetaMMS(gptResponse);
    }
  }, [gptResponse, speakWithMetaMMS]);

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", 
                        "phrase5", "phrase6", "phrase7", "phrase8"];
    
    const nativeLanguagePhrases = phraseKeys.map(key => t(key));
    const targetLanguagePhrases = phraseKeys.map(key => {
      // For target language phrases, we use English versions by default
      // or try to get from translations
      return t(key, { lng: 'english' }) || key;
    });
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setTranscript("");
    clearTranscript();
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  const { practice, native } = getLanguagePair(currentLanguage);
  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  // Calculate stable class names based on state rather than dynamic conditions
  const isActivelyListening = recognitionState === RecognitionState.LISTENING;
  
  // Stable class names
  const listeningStatusClass = isActivelyListening 
    ? "text-sm text-lingua-accent animate-pulse mb-4 transition-opacity duration-300" 
    : "text-sm text-lingua-accent mb-4 opacity-0 transition-opacity duration-300 hidden";
  
  const transcriptWrapperClass = transcript.trim() 
    ? "mb-6 transition-opacity duration-300" 
    : "mb-6 opacity-0 pointer-events-none h-0";
  
  const sendButtonClass = transcript.trim() 
    ? "opacity-100 transition-opacity duration-300" 
    : "opacity-0 transition-opacity duration-300";

  // Button states
  const isButtonDisabled = isLoading || isSpeaking;
  const showSendButton = transcript.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("practiceDescription")}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>{t("aiModelInfo")}</strong>
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">
                  {t("practiceLevel")}
                </span> - 
                {t("cefrB1Description")}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleListening}
                variant={isActivelyListening ? "destructive" : "default"}
                size="lg"
                disabled={isButtonDisabled}
                className="transition-colors duration-300"
              >
                {isActivelyListening ? (
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
              
              {showSendButton && (
                <Button
                  onClick={() => handleSendTranscript(transcript)}
                  variant="default"
                  size="lg"
                  disabled={isButtonDisabled}
                  className={sendButtonClass}
                >
                  <Send className="h-5 w-5 mr-2" />
                  {t("send")}
                </Button>
              )}
            </div>
          </div>
          
          <div className={listeningStatusClass}>
            {t("listeningNow")}...
          </div>

          <div className={transcriptWrapperClass}>
            <h3 className="font-medium mb-2">
              {t("youSaid")}:
            </h3>
            <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
              {transcript}
            </div>
          </div>

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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">
                  {t("aiResponse")}:
                </h3>
                <Button 
                  onClick={playAgain} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 transition-colors duration-300"
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4" />
                  {isSpeaking 
                    ? t("speaking") 
                    : t("playAgain")}
                </Button>
              </div>
              <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
                {gptResponse}
                
                {/* Always show translation if translation exists */}
                {((translation && translation.trim() !== "")) && (
                  <>
                    <div className="border-t border-gray-300 my-3"></div>
                    <div className="text-sm text-gray-600">
                      <strong>
                        {t("translation")}:
                      </strong> {translation || t("translationNotAvailable")}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
        
        {conversationHistory.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {t("conversationHistory")}
              </h3>
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
                className="transition-colors duration-300"
              >
                {t("clearConversation")}
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    translation={message.translation}
                    onPlayAudio={() => speakWithMetaMMS(message.content)}
                  />
                ))}
                <div ref={conversationEndRef} />
              </div>
            </ScrollArea>
          </Card>
        )}
        
        <Card className="p-6">
          <h3 className="font-medium mb-4">
            {t("conversationStarters")}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t("tryThesePhrases")}
          </p>
          
          <div className="space-y-6">
            {/* Native language phrases */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                {native}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nativeLanguagePhrases.map((phrase, index) => (
                  <Button 
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3 transition-colors duration-300"
                    onClick={() => handlePhraseClick(phrase)}
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Target language phrases */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                {practice}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {targetLanguagePhrases.map((phrase, index) => (
                  <Button 
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3 font-normal transition-colors duration-300"
                    onClick={() => handlePhraseClick(phrase)}
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceChat;

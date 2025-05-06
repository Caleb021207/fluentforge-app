import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { 
  getLanguagePair, 
  getSpeechSynthesisLanguageCode, 
} from "@/utils/languageUtils";
import englishTranslations from "@/translations/english";
import haitianTranslations from "@/translations/haitian";
import spanishTranslations from "@/translations/spanish";
import ChatMessage from "@/components/practice/ChatMessage";
import { playTTS, isTTSSupported } from "@/utils/ttsUtils";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const cefrLevel = 'B1';
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const { practice: targetLanguage } = getLanguagePair(currentLanguage);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      // Get the target language the user is practicing (not their UI language)
      const { practice } = getLanguagePair(currentLanguage);
      
      // Use the practice/target language for speech recognition
      let recognitionLanguage = getSpeechSynthesisLanguageCode(practice.toLowerCase());
      
      console.log(`Setting speech recognition to target language: ${practice} (${recognitionLanguage})`);
      
      recognitionRef.current.lang = recognitionLanguage;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        
        resetSilenceDetection();
        
        setTranscript(latestTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: t("error"),
          description: `${t("speechRecognitionError")}: ${event.error}`,
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
          }
        } else {
          setIsListening(false);
        }
      };
    } else {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }

    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const handleVoicesChanged = () => {
        console.log("Voices available:", synthRef.current?.getVoices().length);
      };
      
      synthRef.current.onvoiceschanged = handleVoicesChanged;
      
      if (synthRef.current.getVoices().length > 0) {
        handleVoicesChanged();
      }
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel();
      }
      clearSilenceDetection();
    };
  }, [currentLanguage, toast, t]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening) {
        console.log("10 seconds of silence detected, automatically sending message");
        handleSendTranscript(transcript);
        
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        setIsListening(false);
      }
    }, 10000);
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
          setGptResponse("");
          setTranslation("");
          resetSilenceDetection();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          toast({
            title: t("error"),
            description: t("microphoneAccessRequired"),
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    clearSilenceDetection();
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
          requestTranslation: true // Explicitly request translation
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

  const speakWithMetaMMS = (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithMetaMMS');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..."`);
    
    const { practice } = getLanguagePair(currentLanguage);
    const practiceLanguage = practice.toLowerCase();
    
    setIsSpeaking(true);
    
    // Force the use of Meta MMS for Haitian and Igbo
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
  };

  const playAgain = () => {
    if (gptResponse) {
      speakWithMetaMMS(gptResponse);
    }
  };

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    let nativeLanguagePhrases;
    let targetLanguagePhrases;
    
    if (currentLanguage === "haitian") {
      nativeLanguagePhrases = phraseKeys.map(key => haitianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "english") {
      nativeLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
    } else {
      nativeLanguagePhrases = phraseKeys.map(key => t(key));
      targetLanguagePhrases = phraseKeys.map(key => {
        const englishPhrase = englishTranslations[key];
        return englishPhrase || key;
      });
    }
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  const handlePhraseClick = (phrase: string) => {
    handleSendTranscript(phrase);
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setApiConversationHistory([]);
    setTranscript("");
    setGptResponse("");
    setTranslation("");
    toast({
      title: t("Success"),
      description: t("conversationHistoryCleared"),
    });
  };

  const { practice, native } = getLanguagePair(currentLanguage);
  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-foreground mb-4">
          {t("practiceDescription")}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          <strong>{t("aiModelInfo")}</strong>
        </p>
        
        {/* Show appropriate TTS info message based on language */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-md p-3 mb-4">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            {t("browserBasedTTS")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">
                  {t("practiceLevel")}
                </span> - 
                {t("cefrB1Description")}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                disabled={isLoading || isSpeaking}
              >
                {isListening ? (
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
              
              {isListening && transcript && (
                <Button
                  onClick={() => handleSendTranscript(transcript)}
                  variant="default"
                  size="lg"
                  disabled={isLoading || isSpeaking || !transcript.trim()}
                >
                  <Send className="h-5 w-5 mr-2" />
                  {t("send")}
                </Button>
              )}
            </div>
          </div>
          
          {isListening && (
            <div className="text-sm text-muted-foreground animate-pulse mb-4">
              {t("listeningNow")}...
            </div>
          )}

          {transcript && (
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-foreground">
                {t("youSaid")}:
              </h3>
              <div className="bg-muted rounded-lg p-4 text-foreground">
                {transcript}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center my-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {gptResponse && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-foreground">
                  {t("aiResponse")}:
                </h3>
                <Button 
                  onClick={playAgain} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4" />
                  {isSpeaking 
                    ? t("speaking") 
                    : t("playAgain")}
                </Button>
              </div>
              <div className="bg-palavox-primary/10 dark:bg-palavox-primary/20 rounded-lg p-4 text-foreground">
                {gptResponse}
                
                {/* Always show translation if translation exists */}
                {((translation && translation.trim() !== "")) && (
                  <>
                    <div className="border-t border-border my-3"></div>
                    <div className="text-sm text-muted-foreground">
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
              <h3 className="font-medium text-foreground">
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
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    translation={message.translation}
                    onPlayAudio={(text) => speakWithMetaMMS(text)}
                  />
                ))}
                <div ref={conversationEndRef} />
              </div>
            </ScrollArea>
          </Card>
        )}
        
        <Card className="p-6">
          <h3 className="font-medium mb-4 text-foreground">
            {t("conversationStarters")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("tryThesePhrases")}
          </p>
          
          <div className="space-y-6">
            {/* Native language phrases */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                {native}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nativeLanguagePhrases.map((phrase, index) => (
                  <Button 
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => handlePhraseClick(phrase)}
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Target language phrases */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                {practice}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {targetLanguagePhrases.map((phrase, index) => (
                  <Button 
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3 font-normal"
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

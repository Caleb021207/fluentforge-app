
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send } from "lucide-react";
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
import VoiceChatContainer from "@/components/voice-chat/VoiceChatContainer";
import ChatMessage from "@/components/practice/ChatMessage";
import { playTTS } from "@/utils/tts";

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
  const { native, practice } = getLanguagePair(currentLanguage);

  console.log("Language configuration:", { currentLanguage, native, practice });

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
  }, [currentLanguage, toast, t, practice]); // Added practice as dependency

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
      // Make it clear which language we're practicing (the target language)
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: text,
          userLanguage: native || currentLanguage,
          targetLanguage: practice || 'english',
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      console.log("Chat response:", data);
      
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
            console.log("Got translation:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }

      // Verify the response is in the correct language
      const responseLanguageMismatch = await verifyResponseLanguage(content, practice);
      if (responseLanguageMismatch) {
        console.warn("Response language mismatch detected. Expected:", practice, "Response:", content.substring(0, 100));
        
        // Log the error but still use the response, as automatic detection is not 100% reliable
        // In the future, this could be used to request a new response
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
      
      // Use target language for TTS (which is the practice language)
      speakWithAzureTTS(content);
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

  // Helper function to try to verify if the response language matches what was requested
  const verifyResponseLanguage = async (text: string, expectedLanguage: string): Promise<boolean> => {
    try {
      // Simple verification using language scripts for certain languages
      switch (expectedLanguage.toLowerCase()) {
        case 'hindi':
          return !/[\u0900-\u097F]/.test(text); // Check for Devanagari script
        case 'arabic':
          return !/[\u0600-\u06FF]/.test(text); // Check for Arabic script
        case 'japanese':
          return !/[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/.test(text); // Check for Japanese scripts
        case 'korean':
          return !/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text); // Check for Hangul
        case 'russian':
        case 'ukrainian':
          return !/[\u0400-\u04FF]/.test(text); // Check for Cyrillic script
        case 'thai':
          return !/[\u0E00-\u0E7F]/.test(text); // Check for Thai script
        case 'mandarin':
        case 'cantonese':
          return !/[\u4E00-\u9FFF]/.test(text); // Check for Chinese characters
        default:
          // For other languages, we'd need a more complex solution
          // but for now, just return false (no mismatch detected)
          return false;
      }
    } catch (e) {
      console.error("Error verifying response language:", e);
      return false; // Assume no mismatch if verification fails
    }
  };

  const speakWithAzureTTS = (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithAzureTTS');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..." in language: ${practice.toLowerCase()}`);
    
    setIsSpeaking(true);
    
    playTTS({
      text: text,
      language: practice.toLowerCase(),
      isTargetLanguage: true,
      useMetaMms: false, // Use Azure as primary TTS provider
      onStart: () => {
        console.log("TTS started with Azure");
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
      speakWithAzureTTS(gptResponse);
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
              <p className="text-sm mt-1">
                <span className="font-medium">
                  {t("currentLanguage")}: {native}
                </span> | 
                <span className="font-medium ml-2">
                  {t("practiceLanguage")}: {practice}
                </span>
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

          {(conversationHistory.length > 0 || isLoading) && (
            <VoiceChatContainer 
              messages={conversationHistory}
              isLoading={isLoading}
              targetLanguage={practice.toLowerCase()}
              onPlayAudio={speakWithAzureTTS}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default VoiceChat;

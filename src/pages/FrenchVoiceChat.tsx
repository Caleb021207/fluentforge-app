
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import englishTranslations from "@/translations/english";
import frenchTranslations from "@/translations/french";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

const FrenchVoiceChat = () => {
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
  
  // Always use French as the practice language for this component
  const practice = "French";
  const native = currentLanguage === "english" ? "English" : getLanguageDisplayName(currentLanguage);

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
      
      // Set the language code for French
      recognitionRef.current.lang = 'fr-FR';
      console.log(`Setting speech recognition language to: fr-FR for French`);
      
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
  }, [currentLanguage, t, toast]);

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
          targetLanguage: 'french', // Always use French for this component
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
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
      
      speakWithBrowserSynthesis(content);
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

  const speakWithBrowserSynthesis = (text: string) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      toast({
        title: t("error"),
        description: t("speechSynthesisNotSupported"),
        variant: "destructive",
      });
      return;
    }
    
    synthRef.current.cancel();
    
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    // Set language to French
    utteranceRef.current.lang = 'fr-FR';
    console.log(`Setting speech synthesis language to: fr-FR for French`);
    
    const voices = synthRef.current.getVoices();
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    
    // Find a French voice
    const voice = voices.find(v => v.lang.startsWith('fr'));
    if (voice) {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
      utteranceRef.current.voice = voice;
    } else {
      console.warn(`No matching voice found for language: French`);
    }
    
    utteranceRef.current.onstart = () => {
      console.log("Speech synthesis started");
      setIsSpeaking(true);
    };
    
    utteranceRef.current.onend = () => {
      console.log("Speech synthesis ended");
      setIsSpeaking(false);
    };
    
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      toast({
        title: t("error"),
        description: t("speechSynthesisError"),
        variant: "destructive",
      });
    };
    
    synthRef.current.speak(utteranceRef.current);
  };

  const playAgain = () => {
    if (gptResponse) {
      speakWithBrowserSynthesis(gptResponse);
    }
  };

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    let nativeLanguagePhrases;
    let targetLanguagePhrases;
    
    // Get French phrases for target language
    targetLanguagePhrases = phraseKeys.map(key => frenchTranslations[key]);
    
    // Get native language phrases (English or user's language)
    if (currentLanguage === "english") {
      nativeLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else {
      nativeLanguagePhrases = phraseKeys.map(key => t(key));
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

  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

  const getPracticeDescription = () => {
    if (currentLanguage === "english") {
      return `Practice your French speaking skills with our voice chat. Click the microphone button and start speaking in French. The AI will respond to you in French and help you practice.`;
    } else if (currentLanguage === "french") {
      return "Pratiquez votre anglais avec notre chat vocal. Cliquez sur le bouton du microphone et commencez à parler en anglais. L'IA vous répondra en anglais et vous aidera à vous entraîner.";
    } else {
      // For other languages, use their translations if available, or default to English
      return `${t("practiceWithVoiceChat")}`;
    }
  };

  const getBrowserTTSNote = () => {
    if (currentLanguage === "english") {
      return "Note: This uses browser-based text-to-speech. For premium voice quality with ElevenLabs, try our Premium Voice Chat.";
    } else if (currentLanguage === "french") {
      return "Remarque : Ce système utilise la synthèse vocale basée sur le navigateur. Pour une qualité vocale premium avec ElevenLabs, essayez notre Chat Vocal Premium.";
    } else {
      return t("browserBasedTTS") || "Note: This uses browser-based text-to-speech.";
    }
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "english") {
      return "We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "french") {
      return "Nous utilisons GPT-4o-mini d'OpenAI pour la compréhension et la génération du langage naturel, avec la synthèse vocale intégrée au navigateur pour les réponses vocales.";
    } else {
      return t("aiModelInfo") || "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
    }
  };

  const getPracticeTipsText = () => {
    if (currentLanguage === "english") {
      return "Use this tool to improve your speaking and listening skills. Here are some tips:";
    } else if (currentLanguage === "french") {
      return "Utilisez cet outil pour améliorer vos compétences en expression orale et en compréhension. Voici quelques conseils :";
    } else {
      return t("useThisTool") || "Use this tool to improve your speaking and listening skills. Here are some tips:";
    }
  };

  const getAIModelLabelText = () => {
    if (currentLanguage === "english") {
      return "AI Model:";
    } else if (currentLanguage === "french") {
      return "Modèle d'IA :";
    } else {
      return "AI Model:";
    }
  };

  const getPracticeLevelText = () => {
    if (currentLanguage === "english") {
      return "Practice Level";
    } else if (currentLanguage === "french") {
      return "Niveau de pratique";
    } else {
      return t("practiceLevel") || "Practice Level";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {currentLanguage === "french" ? "Pratique vocale gratuite" : t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {getPracticeDescription()}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>{getAIModelLabelText()}</strong> {getAIModelInfoText()}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {getBrowserTTSNote()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{getPracticeLevelText()}: B1</span> - {t("cefrB1Description")}
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
                    {currentLanguage === "french" ? "Arrêter d'écouter" : t("stopListening")}
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    {currentLanguage === "french" ? "Commencer à parler" : t("startSpeaking")}
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
                  {currentLanguage === "french" ? "Envoyer" : t("send")}
                </Button>
              )}
            </div>
          </div>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse mb-4">
              {currentLanguage === "french" ? "Écoute en cours..." : t("listeningNow")}...
            </div>
          )}

          {transcript && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">{currentLanguage === "french" ? "Vous avez dit" : t("youSaid")}:</h3>
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{currentLanguage === "french" ? "Réponse de l'IA" : t("aiResponse")}:</h3>
                <Button 
                  onClick={playAgain} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4" />
                  {isSpeaking ? (currentLanguage === "french" ? "En train de parler" : t("speaking")) : 
                               (currentLanguage === "french" ? "Rejouer" : t("playAgain"))}
                </Button>
              </div>
              <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
                {gptResponse}
                
                {translation && translation.trim() !== "" && (
                  <>
                    <div className="border-t border-gray-300 my-3"></div>
                    <div className="text-sm text-gray-600">
                      <strong>{currentLanguage === "french" ? "Traduction" : t("translation")}:</strong> {translation}
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
                {currentLanguage === "french" ? "Historique de la conversation" : t("conversationHistory")}
              </h3>
              <Button 
                onClick={clearConversation}
                variant="outline" 
                size="sm"
              >
                {currentLanguage === "french" ? "Effacer la conversation" : t("clearConversation")}
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-100 text-gray-800' 
                          : 'bg-green-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.translation && message.translation.trim() !== "" && (
                        <p className="text-xs mt-2 text-gray-600 border-t border-gray-200 pt-2">
                          <span className="font-medium">{currentLanguage === "french" ? "Traduction" : t("translation")}:</span> {message.translation}
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
          <h3 className="font-medium mb-4">
            {currentLanguage === "french" ? "Suggestions de conversation" : t("conversationStarters")}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {currentLanguage === "french" ? "Essayez ces phrases pour commencer une conversation :" : t("tryThesePhrases")}
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-lingua-primary">
                {currentLanguage === "french" ? "Dans votre langue cible" : t("inYourTargetLanguage")}: (French)
              </h4>
              <ul className="space-y-2">
                {targetLanguagePhrases.map((phrase, index) => (
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
              <h4 className="text-sm font-medium mb-2 text-lingua-primary">
                {currentLanguage === "french" ? "Dans votre langue maternelle" : t("inYourNativeLanguage")}: ({native})
              </h4>
              <ul className="space-y-2">
                {nativeLanguagePhrases.map((phrase, index) => (
                  <li 
                    key={`native-${index}`} 
                    className="text-sm p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => handlePhraseClick(phrase)}
                  >
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium mb-2">
            {currentLanguage === "french" ? "Pratiquer avec le chat vocal" : t("practiceWithVoiceChat")}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {getPracticeTipsText()}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>{currentLanguage === "french" ? "Posez des questions sur des sujets quotidiens" : t("askQuestions")}</li>
            <li>{currentLanguage === "french" ? "Pratiquez des phrases et expressions courantes" : t("practiceCommonPhrases")}</li>
            <li>{currentLanguage === "french" ? "Décrivez ce que vous voyez autour de vous" : t("describeWhatYouSee")}</li>
            <li>{currentLanguage === "french" ? "Pratiquez le vocabulaire pour des sujets spécifiques comme les voyages ou la nourriture" : t("practiceVocabularyForSpecific")}</li>
          </ul>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default FrenchVoiceChat;

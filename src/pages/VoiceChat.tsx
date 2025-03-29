import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import englishTranslations from "@/translations/english";
import spanishTranslations from "@/translations/spanish";
import portugueseTranslations from "@/translations/portuguese";

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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

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
      
      recognitionRef.current.lang = currentLanguage === "english" ? "es-ES" : "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleSendTranscript(transcript);
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
        setIsListening(false);
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
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentLanguage, toast, t]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
          setGptResponse("");
          setTranslation("");
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
          conversationHistory: apiConversationHistory
        }
      });

      if (error) throw error;
      
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: data.reply,
        translation: data.translation,
        timestamp: new Date()
      };
      
      setGptResponse(data.reply);
      setTranslation(data.translation || "");
      setConversationHistory(prev => [...prev, aiMessage]);
      
      setApiConversationHistory(data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: data.reply + (data.translation ? "\nTranslation: " + data.translation : "") }
      ]);
      
      speakWithBrowserSynthesis(data.reply);
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
    
    utteranceRef.current.lang = currentLanguage === "english" ? "es" : "en-US";
    
    const voices = synthRef.current.getVoices();
    const targetLang = currentLanguage === "english" ? "es" : "en";
    
    const voice = voices.find(v => v.lang.startsWith(targetLang) && v.localService);
    if (voice) {
      utteranceRef.current.voice = voice;
    }
    
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
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

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    const nativeLanguagePhrases = phraseKeys.map(key => t(key));
    
    let targetLanguagePhrases;
    
    if (currentLanguage === "english") {
      targetLanguagePhrases = phraseKeys.map(key => {
        const spanishPhrase = spanishTranslations[key];
        return spanishPhrase || key;
      });
    } else {
      targetLanguagePhrases = phraseKeys.map(key => {
        const englishPhrase = englishTranslations[key];
        return englishPhrase || key;
      });
    }
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  const { practice, native } = getLanguagePair();
  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

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
      description: "Conversation history has been cleared",
    });
  };

  const getPracticeDescription = () => {
    if (currentLanguage === "english") {
      return `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}. The AI will respond to you in ${practice} and help you practice.`;
    } else if (currentLanguage === "spanish") {
      return `Practica tus habilidades de habla en ${practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${practice}. La IA te responderá y te ayudará a practicar.`;
    } else if (currentLanguage === "portuguese") {
      return `Pratique suas habilidades de fala em ${practice} com nosso chat de voz. Clique no botón do microfone e comece a falar em ${practice}. A IA responderá a você e o ajudará a praticar.`;
    }
    return `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}.`;
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "english") {
      return "AI Model: We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "spanish") {
      return "Modelo de IA: Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
    } else if (currentLanguage === "portuguese") {
      return "Modelo de IA: Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
    }
    return "AI Model: Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
  };

  const getPracticeTipsText = () => {
    if (currentLanguage === "english") {
      return "Use this tool to improve your speaking and listening skills. Here are some tips:";
    } else if (currentLanguage === "spanish") {
      return "Utiliza esta herramienta para mejorar tus habilidades de habla y escucha. Aquí hay algunos consejos:";
    } else if (currentLanguage === "portuguese") {
      return "Use esta ferramenta para melhorar suas habilidades de fala e escuta. Aqui estão algumas dicas:";
    }
    return t("practiceLanguageTips");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("unlimitedVoicePractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {getPracticeDescription()}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>{currentLanguage === "english" ? "AI Model:" : currentLanguage === "spanish" ? "Modelo de IA:" : "Modelo de IA:"}</strong> {getAIModelInfoText()}
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card className="mb-6 p-6">
            <div className="flex flex-col items-center mb-6">
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="mb-4"
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
              
              {isListening && (
                <div className="text-sm text-gray-500 animate-pulse">
                  {t("listeningNow")}...
                </div>
              )}
            </div>

            {transcript && (
              <div className="mb-6">
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
                <div className="flex justify-between items-center mb-2">
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
                      <div className="text-sm text-gray-600">
                        <strong>{t("translation")}:</strong> {translation}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
          
          {conversationHistory.length > 0 && (
            <Card className="mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  {currentLanguage === "english" ? "Conversation History" : 
                   currentLanguage === "spanish" ? "Historial de Conversación" : 
                   "Histórico de Conversa"}
                </h3>
                <Button 
                  onClick={clearConversation}
                  variant="outline" 
                  size="sm"
                >
                  {currentLanguage === "english" ? "Clear Conversation" : 
                   currentLanguage === "spanish" ? "Borrar Conversación" : 
                   "Limpar Conversa"}
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
                        {message.translation && (
                          <p className="text-xs mt-2 text-gray-600 border-t border-gray-200 pt-2">
                            <span className="font-medium">
                              {currentLanguage === "english" ? "Translation:" : 
                               currentLanguage === "spanish" ? "Traducción:" : 
                               "Tradução:"}
                            </span> {message.translation}
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
        </div>

        <div className="md:col-span-2">
          <Card className="mb-6 p-6 sticky top-4">
            <h3 className="font-medium mb-4">{t("conversationStarters")}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t("tryThesePhrases")}
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2 text-lingua-primary">
                  {t("inYourTargetLanguage")} ({practice})
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
                  {t("inYourNativeLanguage")} ({native})
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
            <h3 className="font-medium mb-2">{t("practiceWithVoiceChat")}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {getPracticeTipsText()}
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>{t("askQuestionsAboutTopics")}</li>
              <li>{t("practiceEverydayPhrases")}</li>
              <li>{t("describeImagesOrScenes")}</li>
              <li>{t("practiceVocabularyForSpecificTopics")}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceChat;

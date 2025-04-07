import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import englishTranslations from "@/translations/english";
import spanishTranslations from "@/translations/spanish";
import portugueseTranslations from "@/translations/portuguese";
import mandarinTranslations from "@/translations/mandarin";
import vietnameseTranslations from "@/translations/vietnamese";
import frenchTranslations from "@/translations/french";
import japaneseTranslations from "@/translations/japanese";
import russianTranslations from "@/translations/russian";
import ukrainianTranslations from "@/translations/ukrainian";
import hindiTranslations from "@/translations/hindi";
import indonesianTranslations from "@/translations/indonesian";

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
      
      recognitionRef.current.lang = currentLanguage === "english" ? "es-ES" : 
                                   currentLanguage === "japanese" ? "en-US" : "en-US";
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
    
    utteranceRef.current.lang = currentLanguage === "english" ? "es-ES" : 
                               currentLanguage === "japanese" ? "en-US" : "en-US";
    
    const voices = synthRef.current.getVoices();
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    
    const targetLang = currentLanguage === "english" ? "es" : "en";
    
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
      utteranceRef.current.voice = voice;
    } else {
      console.warn(`No matching voice found for language: ${targetLang}`);
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

  const getPracticeDescription = () => {
    if (currentLanguage === "english") {
      return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}. The AI will respond to you in ${getLanguagePair(currentLanguage).practice} and help you practice.`;
    } else if (currentLanguage === "spanish") {
      return `Practica tus habilidades de habla en ${getLanguagePair(currentLanguage).practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${getLanguagePair(currentLanguage).practice}. La IA te responderá y te ayudará a practicar.`;
    } else if (currentLanguage === "portuguese") {
      return `Pratique suas habilidades de fala em ${getLanguagePair(currentLanguage).practice} con nosso chat de voz. Clique no botón do microfone e comece a falar em ${getLanguagePair(currentLanguage).practice}. A IA responderá a você e o ajudará a praticar.`;
    } else if (currentLanguage === "korean") {
      return `저희 음성 채팅으로 ${getLanguagePair(currentLanguage).practice} 말하기 능력을 연습하세요. 마이크 버튼을 클릭하고 ${getLanguagePair(currentLanguage).practice}로 말하기 시작하세요. AI는 ${getLanguagePair(currentLanguage).practice}로 응답하고 연습을 도와드릴 것입니다.`;
    } else if (currentLanguage === "arabic") {
      return `مارس مهارات التحدث باللغة ${getLanguagePair(currentLanguage).practice} من خلال الدردشة الصوتية. انقر على زر الميكروفون وابدأ بالتحدث باللغة ${getLanguagePair(currentLanguage).practice}. سيرد الذكاء الاصطناعي عليك باللغة ${getLanguagePair(currentLanguage).practice} ويساعدك على التدريب.`;
    } else if (currentLanguage === "mandarin") {
      return `使用我们的语音聊天练习您的${getLanguagePair(currentLanguage).practice}口语技能。点击麦克风按钮，开始用${getLanguagePair(currentLanguage).practice}说话。AI将用${getLanguagePair(currentLanguage).practice}回应您并帮助您练习。`;
    } else if (currentLanguage === "vietnamese") {
      return `Luyện tập kỹ năng nói tiếng ${getLanguagePair(currentLanguage).practice} với trò chuyện giọng nói của chúng tôi. Nhấp vào nút micrô và bắt đầu nói bằng tiếng ${getLanguagePair(currentLanguage).practice}. AI sẽ phản hồi bạn bằng tiếng ${getLanguagePair(currentLanguage).practice} và giúp bạn luyện tập.`;
    } else if (currentLanguage === "french") {
      return `Pratiquez vos compétences orales en ${getLanguagePair(currentLanguage).practice} avec notre chat vocal. Cliquez sur le bouton du microphone et commencez à parler en ${getLanguagePair(currentLanguage).practice}. L'IA vous répondra en ${getLanguagePair(currentLanguage).practice} et vous aidera à vous entraîner.`;
    } else if (currentLanguage === "japanese") {
      return `音声チャットで${getLanguagePair(currentLanguage).practice}の会話スキルを練習しましょう。マイクボタンをクリックして${getLanguagePair(currentLanguage).practice}で話し始めてください。AIは${getLanguagePair(currentLanguage).practice}で返答し、あなたの練習をサポートします。`;
    } else if (currentLanguage === "russian") {
      return `Практикуйте свои разговорные навыки на английском языке с помощью нашего голосового чата. Нажмите на кнопку микрофона и начните говорить на английском. ИИ ответит вам на английском и поможет вам практиковаться.`;
    } else if (currentLanguage === "ukrainian") {
      return `Практикуйте свої навички розмови англійською за допомогою нашого голосового чату. Натисніть на кнопку мікрофона та почніть говорити англійською. Штучний інтелект відповість вам англійською та допоможе практикуватися.`;
    } else if (currentLanguage === "hindi") {
      return `हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:`;
    } else if (currentLanguage === "indonesian") {
      return `Latih kemampuan berbicara ${getLanguagePair(currentLanguage).practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${getLanguagePair(currentLanguage).practice}. AI akan merespons Anda dalam bahasa ${getLanguagePair(currentLanguage).practice} dan membantu Anda berlatih.`;
    }
    return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}.`;
  };

  const { practice, native } = getLanguagePair(currentLanguage);
  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();

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
            <div className="text-sm text-gray-500 animate-pulse mb-4">
              {t("listeningNow")}...
            </div>
          )}

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
                
                {/* Always show translation for Hindi users or if translation exists */}
                {((translation && translation.trim() !== "") || currentLanguage === "hindi") && (
                  <>
                    <div className="border-t border-gray-300 my-3"></div>
                    <div className="text-sm text-gray-600">
                      <strong>{t("translation")}:</strong> {translation || "अनुवाद उपलब्ध नहीं है"}
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
              >
                {t("clearConversation")}
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
                      {/* Always show translation for Hindi users when it's an AI message */}
                      {((message.translation && message.translation.trim() !== "") || 
                       (message.role === 'assistant' && currentLanguage === "hindi")) && (
                        <p className="text-xs mt-2 text-gray-600 border-t border-gray-200 pt-2">
                          <span className="font-medium">{t("translation")}:</span> {message.translation || "अनुवाद उपलब्ध नहीं है"}
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
          <h3 className="font-medium mb-4">{t("conversationStarters")}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t("tryThesePhrases")}
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-lingua-primary">
                {t("inYourTargetLanguage")}: ({practice})
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
                {t("inYourNativeLanguage")}: ({native})
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
            <li>{t("askQuestions")}</li>
            <li>{t("practiceCommonPhrases")}</li>
            <li>{t("describeWhatYouSee")}</li>
            <li>{t("practiceVocabularyForSpecific")}</li>
          </ul>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceChat;

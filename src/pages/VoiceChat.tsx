
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
import mandarinTranslations from "@/translations/mandarin";
import vietnameseTranslations from "@/translations/vietnamese";

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
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel
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
      
      speakWithBrowserSynthesis(content);
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
    
    utteranceRef.current.lang = currentLanguage === "english" ? "es-ES" : "en-US";
    
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

  const getLanguagePair = () => {
    if (currentLanguage === "english") {
      return { practice: "Spanish", native: "English" };
    } else if (currentLanguage === "spanish") {
      return { practice: "English", native: "Spanish" };
    } else if (currentLanguage === "portuguese") {
      return { practice: "English", native: "Portuguese" };
    } else if (currentLanguage === "korean") {
      return { practice: "English", native: "Korean" };
    } else if (currentLanguage === "arabic") {
      return { practice: "English", native: "Arabic" };
    } else if (currentLanguage === "mandarin") {
      return { practice: "English", native: "Mandarin" };
    } else if (currentLanguage === "vietnamese") {
      return { practice: "English", native: "Vietnamese" };
    }
    return { practice: "English", native: "Vietnamese" };
  };

  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    
    let nativeLanguagePhrases;
    let targetLanguagePhrases;
    
    if (currentLanguage === "english") {
      nativeLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
    } else if (currentLanguage === "spanish") {
      nativeLanguagePhrases = phraseKeys.map(key => spanishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "portuguese") {
      nativeLanguagePhrases = phraseKeys.map(key => portugueseTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "mandarin") {
      nativeLanguagePhrases = phraseKeys.map(key => mandarinTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "vietnamese") {
      nativeLanguagePhrases = phraseKeys.map(key => vietnameseTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
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
      description: "Conversation history has been cleared",
    });
  };

  const getCEFRLevelDescription = () => {
    if (currentLanguage === "mandarin") {
      return "中级 - 能够讨论熟悉的话题";
    } else if (currentLanguage === "vietnamese") {
      return "Trung cấp - Có thể thảo luận về các chủ đề quen thuộc";
    }
    return t("cefrB1Description") || "Intermediate - Can discuss familiar topics";
  };

  const getPracticeDescription = () => {
    if (currentLanguage === "english") {
      return `Practice your ${getLanguagePair().practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair().practice}. The AI will respond to you in ${getLanguagePair().practice} and help you practice.`;
    } else if (currentLanguage === "spanish") {
      return `Practica tus habilidades de habla en ${getLanguagePair().practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${getLanguagePair().practice}. La IA te responderá y te ayudará a practicar.`;
    } else if (currentLanguage === "portuguese") {
      return `Pratique suas habilidades de fala em ${getLanguagePair().practice} com nosso chat de voz. Clique no botón do microfone e comece a falar em ${getLanguagePair().practice}. A IA responderá a você e o ajudará a praticar.`;
    } else if (currentLanguage === "korean") {
      return `저희 음성 채팅으로 ${getLanguagePair().practice} 말하기 능력을 연습하세요. 마이크 버튼을 클릭하고 ${getLanguagePair().practice}로 말하기 시작하세요. AI가 ${getLanguagePair().practice}로 응답하고 연습을 도와드릴 것입니다.`;
    } else if (currentLanguage === "arabic") {
      return `مارس مهارات التحدث باللغة ${getLanguagePair().practice} من خلال الدردشة الصوتية. انقر على زر الميكروفون وابدأ بالتحدث باللغة ${getLanguagePair().practice}. سيرد الذكاء الاصطناعي عليك باللغة ${getLanguagePair().practice} ويساعدك على التدريب.`;
    } else if (currentLanguage === "mandarin") {
      return `使用我们的语音聊天练习您的${getLanguagePair().practice}口语技能。点击麦克风按钮，开始用${getLanguagePair().practice}说话。AI将用${getLanguagePair().practice}回应您并帮助您练习。`;
    } else if (currentLanguage === "vietnamese") {
      return `Luyện tập kỹ năng nói tiếng ${getLanguagePair().practice} với trò chuyện giọng nói của chúng tôi. Nhấp vào nút micrô và bắt đầu nói bằng tiếng ${getLanguagePair().practice}. AI sẽ phản hồi bạn bằng tiếng ${getLanguagePair().practice} và giúp bạn luyện tập.`;
    }
    return `Practice your ${getLanguagePair().practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair().practice}.`;
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "english") {
      return "AI Model: We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "spanish") {
      return "Modelo de IA: Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
    } else if (currentLanguage === "portuguese") {
      return "Modelo de IA: Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
    } else if (currentLanguage === "korean") {
      return "AI 모델: 자연어 이해 및 생성을 위해 OpenAI의 GPT-4o-mini를 사용하고, 음성 응답을 위해 브라우저의 내장 음성 합성을 사용합니다.";
    } else if (currentLanguage === "arabic") {
      return "نموذج الذكاء الاصطناعي: نستخدم GPT-4o-mini من OpenAI لفهم وإنشاء اللغة الطبيعية، مع استخدام خاصية تحويل النص إلى كلام المدمجة في المتصفح للردود الصوتية.";
    } else if (currentLanguage === "mandarin") {
      return "AI模型：我们使用OpenAI的GPT-4o-mini进行自然语言理解和生成，并使用浏览器内置的语音合成功能进行语音回应。";
    } else if (currentLanguage === "vietnamese") {
      return "Mô hình AI: Chúng tôi sử dụng GPT-4o-mini của OpenAI để hiểu và tạo ngôn ngữ tự nhiên, với tính năng Tổng hợp Giọng nói tích hợp trong trình duyệt cho các phản hồi bằng giọng nói.";
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
    } else if (currentLanguage === "arabic") {
      return "استخدم هذه الأداة لتحسين مهارات التحدث والاستماع. إليك بعض النصائح:";
    } else if (currentLanguage === "mandarin") {
      return "使用此工具提高口语和听力技能。以下是一些提示：";
    } else if (currentLanguage === "vietnamese") {
      return "Sử dụng công cụ này để cải thiện kỹ năng nói và nghe của bạn. Dưới đây là một số mẹo:";
    }
    return t("practiceLanguageTips");
  };

  const getBrowserTTSNote = () => {
    if (currentLanguage === "arabic") {
      return "ملاحظة: هذا يستخدم تحويل النص إلى كلام المستند إلى المتصفح. للحصول على جودة صوت متميزة مع ElevenLabs، جرب الدردشة الصوتية المتميزة.";
    } else if (currentLanguage === "korean") {
      return t("browserBasedTTS");
    } else if (currentLanguage === "english") {
      return "Note: This uses browser-based text-to-speech. For premium voice quality with ElevenLabs, try our Premium Voice Chat.";
    } else if (currentLanguage === "spanish") {
      return "Nota: Esto utiliza la síntesis de voz basada en el navegador. Para una calidad de voz premium con ElevenLabs, prueba nuestro Chat de Voz Premium.";
    } else if (currentLanguage === "portuguese") {
      return "Nota: Isso usa síntese de fala baseada no navegador. Para qualidade de voz premium com ElevenLabs, experimente nosso Chat de Voz Premium.";
    } else if (currentLanguage === "mandarin") {
      return "注意：这使用基于浏览器的文本转语音。如需获得ElevenLabs的高级语音质量，请尝试高级语音聊天。";
    } else if (currentLanguage === "vietnamese") {
      return "Lưu ý: Tính năng này sử dụng chuyển văn bản thành giọng nói dựa trên trình duyệt. Để có chất lượng giọng nói cao cấp với ElevenLabs, hãy thử Trò chuyện bằng giọng nói cao cấp của chúng tôi.";
    }
    return t("browserBasedTTS");
  };

  const getPracticeLevelText = () => {
    if (currentLanguage === "mandarin") {
      return "练习水平";
    } else if (currentLanguage === "vietnamese") {
      return "Cấp độ thực hành";
    }
    return t("practiceLevel") || "Practice Level";
  };

  const { practice, native } = getLanguagePair();
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
          <strong>{currentLanguage === "english" ? "AI Model:" : currentLanguage === "spanish" ? "Modelo de IA:" : currentLanguage === "portuguese" ? "Modelo de IA:" : currentLanguage === "korean" ? "AI 모델:" : currentLanguage === "arabic" ? "نموذج الذكاء الاصطناعي:" : currentLanguage === "vietnamese" ? "Mô hình AI:" : "AI模型："}</strong> {getAIModelInfoText()}
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
                <span className="font-medium">{getPracticeLevelText()}: B1</span> - {getCEFRLevelDescription()}
              </p>
            </div>

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
          </div>
          
          {isListening && (
            <div className="text-sm text-gray-500 animate-pulse">
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

export default VoiceChat;


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
import polishTranslations from "@/translations/polish";
import romanianTranslations from "@/translations/romanian";
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
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithBrowserSynthesis');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..."`);
    
    const { practice } = getLanguagePair(currentLanguage);
    const practiceLanguage = practice.toLowerCase();
    
    setIsSpeaking(true);
    
    playTTS({
      text: text,
      language: practiceLanguage,
      onStart: () => {
        console.log("TTS started");
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
      speakWithBrowserSynthesis(gptResponse);
    }
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
    } else if (currentLanguage === "french") {
      nativeLanguagePhrases = phraseKeys.map(key => frenchTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "japanese") {
      nativeLanguagePhrases = phraseKeys.map(key => japaneseTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "russian") {
      nativeLanguagePhrases = phraseKeys.map(key => russianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "ukrainian") {
      nativeLanguagePhrases = phraseKeys.map(key => ukrainianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "hindi") {
      nativeLanguagePhrases = phraseKeys.map(key => hindiTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "indonesian") {
      nativeLanguagePhrases = phraseKeys.map(key => indonesianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "polish") {
      nativeLanguagePhrases = phraseKeys.map(key => polishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "romanian") {
      nativeLanguagePhrases = phraseKeys.map(key => romanianTranslations[key]);
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
      description: t("conversationHistoryCleared"),
    });
  };

  const getAIModelLabelText = () => {
    if (currentLanguage === "pashto") {
      return t("aiModelLabel");
    } else if (currentLanguage === "swahili") {
      return t("aiModelLabel");
    }
    
    switch (currentLanguage) {
      case "english":
        return "AI Model:";
      case "spanish":
        return "Modelo de IA:";
      case "portuguese":
        return "Modelo de IA:";
      case "korean":
        return "AI 모델:";
      case "arabic":
        return "نموذج الذكاء الاصطناعي:";
      case "mandarin":
        return "AI模型：";
      case "vietnamese":
        return "Mô hình AI:";
      case "french":
        return "Modèle d'IA :";
      case "japanese":
        return "AIモデル：";
      case "russian":
        return "Модель ИИ:";
      case "ukrainian":
        return "Модель ШІ:";
      case "hindi":
        return "AI मॉडल:";
      case "indonesian":
        return "Model AI:";
      case "polish":
        return "Model Praktyki:";
      case "romanian":
        return "Model AI:";
      default:
        return "AI Model:";
    }
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "pashto") {
      return t("aiModelInfoText");
    } else if (currentLanguage === "swahili") {
      return t("aiModelInfoText");
    }
    
    if (currentLanguage === "english") {
      return "We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "spanish") {
      return "Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
    } else if (currentLanguage === "portuguese") {
      return "Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
    } else if (currentLanguage === "korean") {
      return "자연어 이해 및 생성을 위해 OpenAI의 GPT-4o-mini를 사용하��, 음성 응답을 �����해 브라우저의 내장 음성 합성을 사용합니다.";
    } else if (currentLanguage === "arabic") {
      return "نستخدم GPT-4o-mini من OpenAI لفهم وإنشاء اللغة الطبيعية، مع استخدام خاصية تحويل النص إلى كلام المدمجة في المتصفح للردود الصوتية.";
    } else if (currentLanguage === "mandarin") {
      return "我们使用OpenAI的GPT-4o-mini进行自然语言理解和生成，并使用浏览器内置的语音合成功能进行语音回应。";
    } else if (currentLanguage === "vietnamese") {
      return "Chúng tôi sử dụng GPT-4o-mini của OpenAI để hiểu và tạo ngôn ngữ tự nhiên, với tính năng Tổng hợp Giọng nói tích hợp trong trình duyệt cho các phản hồi bằng giọng nói.";
    } else if (currentLanguage === "french") {
      return "Nous utilisons GPT-4o-mini d'OpenAI pour la compréhension et la gnération du langage naturel, avec la synthèse vocale intégrée au navigateur pour les réponses vocales.";
    } else if (currentLanguage === "japanese") {
      return "自然言語理解と生成にはOpenAIのGPT-4o-miniを使用し、音声応答にはブラウザ内蔵の音声合成を使用しています。";
    } else if (currentLanguage === "russian") {
      return "Мы используем GPT-4o-mini от OpenAI для понимания и генерации природної мови, с синтезом речи на основе браузера для голосовых відповідей.";
    } else if (currentLanguage === "ukrainian") {
      return "Ми використовуємо GPT-4o Mini від OpenAI для розуміння та генерації природної мови, з використанням вбудованого в браузер синтезу мовлення для голосових відповідей.";
    } else if (currentLanguage === "hindi") {
      return "हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:";
    } else if (currentLanguage === "indonesian") {
      return "Latih kemampuan berbicara ${getLanguagePair(currentLanguage).practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${getLanguagePair(currentLanguage).practice}. AI akan merespons Anda dalam bahasa ${getLanguagePair(currentLanguage).practice} dan membantu Anda berlatih.";
    } else if (currentLanguage === "polish") {
      return "Używamy modelu GPT-4o-mini od OpenAI do rozumienia i generowania języka naturalnego, z wbudowaną w przeglądarkę syntezą mowy dla odpowiedzi głosowych.";
    } else if (currentLanguage === "romanian") {
      return "Folosim OpenAI GPT-4o-mini pentru procesarea limbajului, cu sinteza vocală integrată în browser.";
    }
    return "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
  };

  const getBrowserTTSNote = () => {
    if (currentLanguage === "pashto") {
      return t("browserBasedTTS");
    } else if (currentLanguage === "arabic") {
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
    } else if (currentLanguage === "french") {
      return "Remarque : Ce système utilise la synthèse vocale basée sur le navigateur. Pour une qualité vocale premium avec ElevenLabs, essayez notre Chat Vocal Premium.";
    } else if (currentLanguage === "japanese") {
      return "注意：これはブラウザベースの音声合成を使用しています。ElevenLabsによるプレミアム音声品質については、プレミアム音声チャットをお試しください。";
    } else if (currentLanguage === "russian") {
      return "Примечание: Эта система использует синтез речи на основе браузера. Для премильного качества голоса от ElevenLabs, попробуйте наш премиум голосовой чат.";
    } else if (currentLanguage === "hindi") {
      return "नोट: यह ब्राउज़र-आधारित टेक्स्ट-टू-स्पीच का उपयोग करता है। ElevenLabs के साथ प्रीमियम आवाज़ की गुणवत्ता के लिए, हमारे प्रीमियम वॉइस चैट का प्रयास करें।";
    } else if (currentLanguage === "indonesian") {
      return "Catatan: Ini menggunakan text-to-speech berbasis browser. Untuk kualitas suara premium dengan ElevenLabs, coba Obrolan Suara Premium kami.";
    } else if (currentLanguage === "polish") {
      return "Uwaga: Ta funkcja używa syntezę mowy opartą na przeglądarce. Aby uzyskać lepszą jakość głosu z ElevenLabs, wypróbuj nasz Premium Voice Chat.";
    } else if (currentLanguage === "romanian") {
      return "Notă: Această funcție folosește sinteza vocală bazată pe browser. Pentru o calitate vocală premium cu ElevenLabs, încercați Chat-ul nostru vocal premium.";
    }
    return t("browserBasedTTS") || "Note: This uses browser-based text-to-speech.";
  };

  // Get the existing getPracticeDescription function but modify it for Swahili
  const getPracticeDescription = () => {
    if (currentLanguage === "swahili") {
      return t("practiceDescription");
    } else if (currentLanguage === "pashto") {
      return t("practiceDescription");
    } else if (currentLanguage === "english") {
      return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}. The AI will respond to you in ${getLanguagePair(currentLanguage).practice} and help you practice.`;
    } else if (currentLanguage === "spanish") {
      return `Practica tus habilidades de habla en ${getLanguagePair(currentLanguage).practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${getLanguagePair(currentLanguage).practice}. La IA te responderá y te ayudará a practicar.`;
    } else if (currentLanguage === "portuguese") {
      return `Pratique suas habilidades de fala em ${getLanguagePair(currentLanguage).practice} con nosso chat de voz. Clique no botón do microfone e comece a falar em ${getLanguagePair(currentLanguage).practice}. A IA responderá a você e o ajudará a praticar.`;
    } else if (currentLanguage === "korean") {
      return `저희 음성 채팅으로 ${getLanguagePair(currentLanguage).practice} 말하기 능력을 연습하��요. 마이크 버튼을 클릭하고 ${getLanguagePair(currentLanguage).practice}로 말하기 시작하세요. AI는 ${getLanguagePair(currentLanguage).practice}로 응답하고 연습을 도와드릴 것입니다.`;
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
      return `Практикуйте свої навички розмови англійською за допомогою нашого голосового чату. Натисніть на кнопку мікрофона та почніть говорити англійською. Штучний інтелект відповість вам англійською та допомоге практикуватися.`;
    } else if (currentLanguage === "hindi") {
      return `हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:`;
    } else if (currentLanguage === "indonesian") {
      return `Latih kemampuan berbicara ${getLanguagePair(currentLanguage).practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${getLanguagePair(currentLanguage).practice}. AI akan merespons Anda dalam bahasa ${getLanguagePair(currentLanguage).practice} dan membantu Anda berlatih.`;
    } else if (currentLanguage === "polish") {
      return `Ćwicz swoje umiejętności mówienia po angielsku z naszym czatem głosowym. Kliknij przycisk mikrofonu i zacznij mówić po angielsku. AI odpowie ci po angielsku i pomoże ci ćwiczyć.`;
    } else if (currentLanguage === "romanian") {
      return `Exersează-ți abilitățile de vorbire în engleză cu ajutorul chatului nostru vocal. Apasă pe butonul microfonului și începe să vorbești.`;
    }
    return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}.`;
  };

  const getPracticeLevelText = () => {
    if (currentLanguage === "pashto") {
      return t("practiceLevel");
    } else if (currentLanguage === "mandarin") {
      return "练习水平";
    } else if (currentLanguage === "vietnamese") {
      return "Cấp độ thực hành";
    } else if (currentLanguage === "french") {
      return "Niveau de pratique";
    } else if (currentLanguage === "japanese") {
      return "練習レベル";
    } else if (currentLanguage === "russian") {
      return "Уровень практики";
    } else if (currentLanguage === "hindi") {
      return "अभ्यास स्तर";
    } else if (currentLanguage === "indonesian") {
      return "Tingkat Latihan";
    } else if (currentLanguage === "polish") {
      return "Poziom praktyki";
    } else if (currentLanguage === "romanian") {
      return "Nivel de practică";
    }
    return t("practiceLevel") || "Practice Level";
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
    } else if (currentLanguage === "french") {
      return "Utilisez cet outil pour améliorer vos compétences en expression orale et en compréhension. Voici quelques conseils :";
    } else if (currentLanguage === "japanese") {
      return "このツールを使用してスピーキングとリスニングのスキルを向上させましょう。いくつかのヒント：";
    } else if (currentLanguage === "russian") {
      return "Используйте этот инструмент для улучшения разговорных и слуховых навыков. Вот несколько советов:";
    } else if (currentLanguage === "hindi") {
      return "अपने बोलने और सुनने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:";
    } else if (currentLanguage === "indonesian") {
      return "Gunakan alat ini untuk meningkatkan keterampilan berbicara dan mendengarkan Anda. Berikut beberapa tips:";
    } else if (currentLanguage === "polish") {
      return "Użyj tego narzędzia, aby poprawić swoje umiejętności mówienia. Oto kilka wskazówek:";
    } else if (currentLanguage === "romanian") {
      return "Folosește acest instrument pentru a-ți îmbunătăți abilitățile de vorbire și ascultare. Iată câteva sfaturi:";
    }
    return t("useThisTool") || "Use this tool to improve your speaking and listening skills. Here are some tips:";
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
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    translation={message.translation}
                    onPlayAudio={(text) => speakWithBrowserSynthesis(text)}
                  />
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
              <h4 className="text-sm font-medium text-gray-700">
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

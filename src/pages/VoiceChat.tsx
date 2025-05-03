
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
import turkishTranslations from "@/translations/turkish";
import farsiTranslations from "@/translations/farsi";
import urduTranslations from "@/translations/urdu";
import bengaliTranslations from "@/translations/bengali";
import somaliTranslations from "@/translations/somali";
import igboTranslations from "@/translations/igbo";
import amharicTranslations from "@/translations/amharic";
import yorubaTranslations from "@/translations/yoruba";
import malayalamTranslations from "@/translations/malayalam";
import haitianTranslations from "@/translations/haitian";
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
    } else if (currentLanguage === "turkish") {
      nativeLanguagePhrases = phraseKeys.map(key => turkishTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "farsi") {
      nativeLanguagePhrases = phraseKeys.map(key => farsiTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "urdu") {
      nativeLanguagePhrases = phraseKeys.map(key => urduTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "bengali") {
      nativeLanguagePhrases = phraseKeys.map(key => bengaliTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "somali") {
      nativeLanguagePhrases = phraseKeys.map(key => somaliTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "igbo") {
      nativeLanguagePhrases = phraseKeys.map(key => igboTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "haitian") {
      nativeLanguagePhrases = phraseKeys.map(key => haitianTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "amharic") {
      nativeLanguagePhrases = phraseKeys.map(key => amharicTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "yoruba") {
      nativeLanguagePhrases = phraseKeys.map(key => yorubaTranslations[key]);
      targetLanguagePhrases = phraseKeys.map(key => englishTranslations[key]);
    } else if (currentLanguage === "malayalam") {
      nativeLanguagePhrases = phraseKeys.map(key => malayalamTranslations[key]);
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
    if (["pashto", "swahili", "farsi", "urdu", "bengali", "somali", "igbo", 
         "amharic", "yoruba", "malayalam"].includes(currentLanguage)) {
      return t("aiModelLabel");
    } else if (currentLanguage === "farsi") {
      return "مدل هوش مصنوعی:";
    } else if (currentLanguage === "arabic") {
      return "نموذج الذكاء الاصطناعي:";
    } else if (currentLanguage === "mandarin") {
      return "AI模型：";
    } else if (currentLanguage === "vietnamese") {
      return "Mô hình AI:";
    } else if (currentLanguage === "french") {
      return "Modèle d'IA :";
    } else if (currentLanguage === "japanese") {
      return "AIモデル：";
    } else if (currentLanguage === "russian") {
      return "Модель ИИ:";
    } else if (currentLanguage === "ukrainian") {
      return "Модель ШІ:";
    } else if (currentLanguage === "hindi") {
      return "AI मॉडल:";
    } else if (currentLanguage === "indonesian") {
      return "Model AI:";
    } else if (currentLanguage === "polish") {
      return "Model AI:";
    } else if (currentLanguage === "romanian") {
      return "Model AI:";
    } else if (currentLanguage === "turkish") {
      return "Yapay Zekâ Modeli:";
    } else if (currentLanguage === "bengali") {
      return "AI মডেল:";
    } else if (currentLanguage === "somali") {
      return "Modelka AI:";
    } else if (currentLanguage === "igbo") {
      return "Ụdị AI:";
    } else if (currentLanguage === "amharic") {
      return "የAI ሞዴል:";
    } else if (currentLanguage === "yoruba") {
      return "Àwọn àwòrán AI:";
    } else if (currentLanguage === "malayalam") {
      return "AI മോഡൽ:";
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
        return "Model AI:";
      case "romanian":
        return "Model AI:";
      case "turkish":
        return "Yapay Zekâ Modeli:";
      default:
        return "AI Model:";
    }
  };

  const getAIModelInfoText = () => {
    if (["pashto", "swahili", "farsi", "urdu", "bengali", "somali", "igbo", 
         "amharic", "yoruba", "malayalam"].includes(currentLanguage)) {
      return t("aiModelUsing");
    }
    
    return "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
  };

  const getBrowserTTSNote = () => {
    if (["pashto", "swahili", "farsi", "urdu", "bengali", "somali", "igbo", 
         "korean", "amharic", "yoruba", "malayalam"].includes(currentLanguage)) {
      return t("browserBasedTTS");
    } else if (currentLanguage === "arabic") {
      return "ملاحظة: هذا يستخدم تحويل النص إلى كلام المستند إلى المتصفح. للحصول على جودة صوت متميزة مع ElevenLabs، جرب الدردشة الصوتية المتميزة.";
    }
    
    return t("browserBasedTTS") || "Note: This uses browser-based text-to-speech.";
  };

  const getPracticeDescription = () => {
    if (["swahili", "pashto", "farsi", "urdu", "bengali", "somali", "igbo", 
         "amharic", "yoruba", "malayalam"].includes(currentLanguage)) {
      return t("practiceYourSpeaking");
    } else if (currentLanguage === "english") {
      return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}. The AI will respond to you in ${getLanguagePair(currentLanguage).practice} and help you practice.`;
    }
    
    return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}.`;
  };

  const getPracticeLevelText = () => {
    if (["pashto", "swahili", "farsi", "urdu", "bengali", "somali", "igbo", 
         "amharic", "yoruba", "malayalam"].includes(currentLanguage)) {
      return t("practiceLevel");
    } else if (currentLanguage === "mandarin") {
      return "练习水平";
    } 
    
    return t("practiceLevel") || "Practice Level";
  };

  const getPracticeTipsText = () => {
    if (currentLanguage === "english") {
      return "Use this tool to improve your speaking and listening skills. Here are some tips:";
    } else if (currentLanguage === "spanish") {
      return "Utiliza esta herramienta para mejorar tus habilidades de habla y escucha. Aquí hay algunos consejos:";
    } else if (["somali", "igbo", "amharic", "yoruba", "malayalam"].includes(currentLanguage)) {
      return t("useThisTool") || "Use this tool to improve your speaking and listening skills. Here are some tips:";
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

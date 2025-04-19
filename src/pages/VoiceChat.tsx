import { useState, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { ConversationStarters } from "@/components/voice-chat/ConversationStarters";
import { ConversationHistory } from "@/components/voice-chat/ConversationHistory";
import { VoiceChatControls } from "@/components/voice-chat/VoiceChatControls";

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

const VoiceChat = () => {
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: string; content: string}[]>([]);
  const cefrLevel = 'B1';
  
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const { isListening, transcript, toggleListening, setTranscript, clearSilenceDetection } = useSpeechRecognition();
  const { isSpeaking, speakText } = useSpeechSynthesis();

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
      
      speakText(content);
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

  const getPracticeDescription = () => {
    const { practice } = getLanguagePair(currentLanguage);
    
    if (currentLanguage === "english" && practice.toLowerCase() === "french") {
      return `Practice your French speaking skills with our voice chat. Click the microphone button and start speaking in French. The AI will respond to you in French and help you practice.`;
    }
    
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
      return `Мы используем GPT-4o-mini от OpenAI для понимания и генерации природної мови, с синтезом речи на основе браузера для голосовых відповідей.`;
    } else if (currentLanguage === "ukrainian") {
      return `Ми використовуємо GPT-4o Mini від OpenAI для розуміння та генерації природної мови, з використанням вбудованого в браузер синтезу мовлення для голосових відповідей.`;
    } else if (currentLanguage === "hindi") {
      return `हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:`;
    } else if (currentLanguage === "indonesian") {
      return `Latih kemampuan berbicara ${getLanguagePair(currentLanguage).practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${getLanguagePair(currentLanguage).practice}. AI akan merespons Anda dalam bahasa ${getLanguagePair(currentLanguage).practice} dan membantu Anda berlatih.`;
    }
    return `Practice your ${getLanguagePair(currentLanguage).practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair(currentLanguage).practice}.`;
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "english") {
      return "We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "spanish") {
      return "Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
    } else if (currentLanguage === "portuguese") {
      return "Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
    } else if (currentLanguage === "korean") {
      return "자연어 이해 및 생성을 위해 OpenAI의 GPT-4o-mini를 사용하고, 음성 응답을 위해 브라우저의 내장 음성 합성을 사용합니다.";
    } else if (currentLanguage === "arabic") {
      return "نستخدم GPT-4o-mini من OpenAI لفهم وإنشاء اللغة الطبيعية، مع استخدام خاصية تحويل النص إلى كلام المدمجة في المتصفح للردود الصوتية.";
    } else if (currentLanguage === "mandarin") {
      return "我们使用OpenAI的GPT-4o-mini进行自然语言理解和生成，并使用浏览器内置的语音合成功能进行语音回应。";
    } else if (currentLanguage === "vietnamese") {
      return "Chúng tôi sử dụng GPT-4o-mini của OpenAI để hiểu và tạo ngôn ngữ tự nhiên, với tính năng Tổng hợp Giọng nói tích hợp trong trình duyệt cho các phản hồi bằng giọng n��i.";
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
    }
    return "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
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

            <VoiceChatControls
              isListening={isListening}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              transcript={transcript}
              onToggleListening={toggleListening}
              onSendTranscript={() => handleSendTranscript(transcript)}
            />
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
                  onClick={() => speakText(gptResponse)} 
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
        
        <ConversationHistory
          messages={conversationHistory}
          onClear={clearConversation}
          onPlayAudio={speakText}
        />
        
        <ConversationStarters onPhraseClick={handleSendTranscript} />
      </div>
    </div>
  );
};

export default VoiceChat;

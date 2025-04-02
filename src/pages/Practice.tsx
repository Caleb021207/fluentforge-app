import { useState, useEffect } from "react";
import { MessageCircle, Send, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useConversation } from "@11labs/react";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const Practice = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  const targetLanguage = currentLanguage === "english" ? "Spanish" : "English";
  
  const getAgentId = () => {
    return getAgentIdForLanguage(currentLanguage);
  };

  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === "llm_response") {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      }
    };

    initMicrophone();
  }, [toast, t]);

  useEffect(() => {
    let timerId: number | null = null;
    
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setVoiceChatTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endVoiceConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit5MinReached"),
              });
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isConversationActive(), voiceChatTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startVoiceConversation = async () => {
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const selectedAgentId = getAgentId();
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      if (isConversationActive()) {
        endVoiceConversation();
        return;
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const sessionId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      console.log(`Successfully started conversation session: ${sessionId}`);
      
      setVoiceChatTimeRemaining(300);
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    }
  };

  const endVoiceConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      setVoiceChatTimeRemaining(null);
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  const sendLanguageLearningPrompt = () => {
    let prompt = "";
    
    if (currentLanguage === "english") {
      prompt = "¡Hola! Quiero practicar español contigo.";
    } else if (currentLanguage === "spanish") {
      prompt = "¡Hola! Quiero practicar inglés contigo!";
    } else if (currentLanguage === "portuguese") {
      prompt = "Olá! Eu quero praticar inglês com você!";
    } else if (currentLanguage === "korean") {
      prompt = "안녕하세요! 저는 당신과 영어를 연습하고 싶습니다.";
    } else if (currentLanguage === "arabic") {
      prompt = "مرحباً! أريد أن أمارس اللغة الإنجليزية معك.";
    }

    if (prompt) {
      const userMessage: ChatMessage = {
        role: "user",
        content: prompt,
      };

      setMessages((prev) => [...prev, userMessage]);
      handleSendPrompt(prompt);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: promptText,
          userLanguage: currentLanguage 
        }
      });

      if (error) {
        throw error;
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: data.translation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: input,
          userLanguage: currentLanguage
        }
      });

      if (error) {
        throw error;
      }

      console.log('Response from AI tutor:', data);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: data.translation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    if (currentLanguage === "spanish") {
      return "Escribe tu mensaje en español o inglés...";
    } else if (currentLanguage === "portuguese") {
      return "Digite sua mensagem em português ou inglês...";
    } else if (currentLanguage === "korean") {
      return "한국어 또는 영어로 메시지를 입력하세요...";
    } else if (currentLanguage === "arabic") {
      return "اكتب رسالتك بالعربية أو الإنجليزية...";
    } else {
      return "Type your message in English or Spanish...";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("textPractice")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "arabic" 
            ? t("chatWithAITutor")
            : currentLanguage === "english" 
              ? `Chat with our AI tutor to practice your Spanish through text conversations! The AI will help correct your grammar, vocabulary, and usage. Feel free to ask questions about language or culture.`
              : currentLanguage === "spanish"
                ? `¡Chatea con nuestro tutor de IA para practicar tu inglés a través de conversaciones de texto! La IA te ayudará a corregir tu gramática, vocabulario y uso. No dudes en hacer preguntas sobre el idioma o la cultura.`
                : currentLanguage === "portuguese"
                  ? `Converse com nosso tutor de IA para praticar seu inglês através de conversas de texto! A IA ajudará a corrigir sua gramática, vocabulário e uso. Sinta-se à vontade para fazer perguntas sobre idioma ou cultura.`
                  : currentLanguage === "korean"
                    ? `AI 튜터와 채팅하여 영어를 연습해보세요! AI가 문법, 어휘, 발음을 교정하는 데 도움을 줄 것입니다. 언어나 문화에 대한 질문을 자유롭게 해보세요.`
                  : `Chat with our AI tutor to practice your language skills through text conversations!`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "arabic"
              ? t("noticeTextBasedPractice")
              : currentLanguage === "english" 
                ? "Note: This is the text-based practice feature. For voice practice, try our Unlimited Voice Chat or Premium Voice Chat features."
                : currentLanguage === "spanish"
                  ? "Nota: Esta es la función de práctica basada en texto. Para la práctica de voz, prueba nuestras funciones de Chat de Voz Ilimitado o Chat de Voz Premium."
                  : currentLanguage === "portuguese"
                    ? "Nota: Este é o recurso de prática baseada em texto. Para prática de voz, experimente nossos recursos de Chat de Voz Ilimitado ou Chat de Voz Premium."
                  : currentLanguage === "korean"
                    ? "참고: 이것은 텍스트 기반 연습 기능입니다. 음성 연습은 무제한 음성 채팅 또는 프리미엄 음성 채팅 기능을 사용해보세요."
                  : `Note: This is the text-based practice feature. For voice practice, try our Unlimited Voice Chat or Premium Voice Chat features.`}
          </p>
        </div>
      </div>

      <Card className="mb-4 p-6">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("startTextChatting")}</p>
              <p className="text-sm mt-2">
                {t("typeMessageBelow")}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-lingua-primary text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.translation && (
                    <p className="text-sm mt-2 text-gray-500">
                      {message.translation}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholderText()}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lingua-primary"
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {t("send")}
          </Button>
        </form>
      </Card>
      
      <div className="flex justify-center mb-8">
        <Button onClick={sendLanguageLearningPrompt} disabled={isLoading} className="bg-lingua-primary w-full sm:w-auto">
          <Book className="h-4 w-4 mr-2" />
          {currentLanguage === "arabic"
            ? t("sendEnglishPracticePrompt")
            : currentLanguage === "english" 
              ? "Send Spanish Practice Prompt" 
              : currentLanguage === "spanish"
                ? "Enviar mensaje de práctica en inglés"
                : currentLanguage === "portuguese"
                  ? "Enviar mensagem de prática em inglês"
                  : currentLanguage === "korean"
                    ? "영어 연습 메시지 보내기"
                    : "Send Practice Prompt"}
        </Button>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 mb-8">
        <h3 className="font-medium mb-2">{t("practiceWithTextChat")}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {currentLanguage === "arabic"
            ? "استخدم هذه الأداة لممارسة محادثات اللغة الإنجليزية النصية. يمكنك السؤال عن:"
            : currentLanguage === "english" 
              ? "Use this tool to practice your Spanish text conversations. You can ask about:" 
              : currentLanguage === "spanish"
                ? "Utiliza esta herramienta para practicar tus conversaciones en inglés. Puedes preguntar sobre:"
                : currentLanguage === "portuguese"
                  ? "Use esta ferramenta para praticar suas conversas em inglês. Você pode perguntar sobre:"
                  : currentLanguage === "korean"
                    ? "이 도구를 사용하여 영어 텍스트 대화를 연습하세요. 다음과 같은 주제로 질문할 수 있습니다:"
                    : "Use this tool to practice your conversations."}
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>{t("askAboutGrammarRules")}</li>
          <li>{t("practiceConversationsDifferentSituations")}</li>
          <li>{t("learnNewVocabulary")}</li>
          <li>{t("discussCulturalTopics")}</li>
        </ul>
      </div>
    </div>
  );
};

export default Practice;

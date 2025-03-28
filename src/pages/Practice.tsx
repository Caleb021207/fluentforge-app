
import { useState, useEffect } from "react";
import { MessageCircle, Send, Mic, MicOff, BookOpen, FileText, Volume2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

interface SkillAssessment {
  reading: string;
  writing: string;
  speaking: string;
  listening: string;
  overallLevel: string;
}

const Practice = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [skillAssessment, setSkillAssessment] = useState<SkillAssessment | null>(null);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

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
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const initMicrophone = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      }
    };

    initMicrophone();
  }, [toast, t]);

  const startVoiceConversation = async () => {
    try {
      await conversation.startSession({
        // Use the specific agent ID provided by the user
        agentId: "Qc5G2DZi0jRmMf3CzC8f",
      });
      toast({
        title: conversation.status === "connected" ? t("stopVoiceChat") : t("startVoiceChat"),
        description: t("startChatting"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    }
  };

  const requestSkillAssessment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: currentLanguage === "portuguese" 
            ? "Por favor, avalie minhas habilidades em inglês com base em nossa conversa. Forneça feedback sobre minha leitura, escrita, fala e compreensão auditiva, e estime meu nível geral de proficiência."
            : currentLanguage === "spanish"
              ? "Por favor evalúa mis habilidades en inglés basándote en nuestra conversación. Proporciona retroalimentación sobre mi lectura, escritura, habla y comprensión auditiva, y estima mi nivel general de competencia."
              : "Please assess my Spanish language skills based on our conversation. Provide feedback on my reading, writing, speaking, and listening abilities, and estimate my overall proficiency level.",
          requestType: "assessment"
        }
      });

      if (error) throw error;

      setSkillAssessment(data.assessment);
      toast({
        title: t("getSkillsAssessment"),
        description: currentLanguage === "portuguese" 
          ? "Suas habilidades linguísticas foram avaliadas!" 
          : currentLanguage === "spanish" 
            ? "¡Tus habilidades lingüísticas han sido evaluadas!" 
            : "Your language skills have been evaluated!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("failedToLoadProgressData"),
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
        body: { message: input }
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("practiceWithAITutor")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("chatWithAITutor")}
        </p>
        <div className="flex gap-4 mb-4">
          <Button
            onClick={conversation.status === "connected" ? conversation.endSession : startVoiceConversation}
            variant={conversation.status === "connected" ? "destructive" : "default"}
          >
            {conversation.status === "connected" ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                {t("stopVoiceChat")}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {t("startVoiceChat")}
              </>
            )}
          </Button>
          <Button onClick={requestSkillAssessment} disabled={messages.length === 0 || isLoading}>
            {t("getSkillsAssessment")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {skillAssessment && (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">{t("reading")}</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.reading}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">{t("writing")}</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.writing}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">{t("speaking")}</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.speaking}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">{t("listening")}</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.listening}</p>
            </Card>
            <Card className="p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">{t("overallLevel")}</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.overallLevel}</p>
            </Card>
          </>
        )}
      </div>

      <Card className="mb-4 p-6">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("startChatting")}</p>
              <p className="text-sm mt-2">
                {microphoneAccess 
                  ? t("clickToStartVoice")
                  : t("allowMicAccess")}
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
            placeholder={t("typeMessage")}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lingua-primary"
            disabled={conversation.status === "connected"}
          />
          <Button type="submit" disabled={isLoading || conversation.status === "connected"}>
            <Send className="h-4 w-4 mr-2" />
            {t("send")}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Practice;

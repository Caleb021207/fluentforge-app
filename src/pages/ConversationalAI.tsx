
import { useState, useEffect } from "react";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const ConversationalAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

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

    // Update conversation history with user message
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: input }
    ];
    setConversationHistory(updatedHistory);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: input,
          userLanguage: currentLanguage,
          conversationHistory: updatedHistory,
          cefrLevel: "B1" // Default level, could be made configurable
        }
      });

      if (error) {
        throw error;
      }

      console.log('Response from AI:', data);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: data.translation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update conversation history with assistant response
      setConversationHistory(data.updatedHistory || [
        ...updatedHistory,
        { role: "assistant", content: data.content }
      ]);
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
    } else {
      return "Type your message in English or Spanish...";
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    toast({
      title: t("Success"),
      description: "Conversation history has been cleared",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("conversationalAI")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Have a natural conversation with our AI tutor! Practice your language skills in a relaxed setting with contextual responses and helpful corrections.`
            : currentLanguage === "spanish"
              ? `¡Mantén una conversación natural con nuestro tutor de IA! Practica tus habilidades lingüísticas en un entorno relajado con respuestas contextuales y correcciones útiles.`
              : `Tenha uma conversa natural com nosso tutor de IA! Pratique suas habilidades linguísticas em um ambiente descontraído com respostas contextuais e correções úteis.`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: This conversational AI remembers your conversation context and adapts to your language level."
              : currentLanguage === "spanish"
                ? "Nota: Esta IA conversacional recuerda el contexto de tu conversación y se adapta a tu nivel de idioma."
                : "Nota: Esta IA conversacional lembra o contexto da sua conversa e se adapta ao seu nível de idioma."}
          </p>
        </div>
      </div>

      <Card className="mb-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            {t("conversation")}
          </h3>
          {messages.length > 0 && (
            <Button 
              onClick={clearConversation}
              variant="outline" 
              size="sm"
            >
              {t("clearConversation")}
            </Button>
          )}
        </div>
        
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("startChatting")}</p>
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
                  {message.role === "user" ? (
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-1 shrink-0" />
                      <p>{message.content}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start">
                        <Bot className="h-4 w-4 mr-2 mt-1 shrink-0" />
                        <p>{message.content}</p>
                      </div>
                      {message.translation && (
                        <p className="text-sm mt-2 text-gray-500 pl-6">
                          {message.translation}
                        </p>
                      )}
                    </div>
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
    </div>
  );
};

export default ConversationalAI;

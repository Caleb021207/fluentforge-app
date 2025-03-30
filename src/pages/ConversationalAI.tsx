import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Bot, User, Mic, MicOff, Headphones, Clock3, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const ConversationalAI = () => {
  // Text chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const [activeTab, setActiveTab] = useState("text");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice conversation hook
  const {
    isRecording,
    isProcessing,
    voiceMessages,
    remainingTime,
    isFallbackMode,
    audioRef,
    startRecording,
    stopRecording,
    handleFallbackVoiceInput,
    formatTime,
    clearConversation
  } = useVoiceConversation(currentLanguage);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, voiceMessages]);

  // Handle text chat form submission
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

  // Text input placeholder based on language
  const getPlaceholderText = () => {
    if (currentLanguage === "spanish") {
      return "Escribe tu mensaje en español o inglés...";
    } else if (currentLanguage === "portuguese") {
      return "Digite sua mensagem em português ou inglês...";
    } else {
      return "Type your message in English or Spanish...";
    }
  };

  // Clear text conversation history
  const clearTextConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    toast({
      title: t("Success"),
      description: "Conversation history has been cleared",
    });
  };

  // Handle voice recording toggle
  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      if (isFallbackMode) {
        handleFallbackVoiceInput();
      } else {
        const intervalId = await startRecording();
        // Register a handler to stop recording when a button is clicked
        const handler = () => {
          if (intervalId) stopRecording(intervalId);
        };
        document.addEventListener('click', handler, { once: true });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          {t("conversationalAI")}
        </h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === "english" 
            ? `Practice your language skills through both text and voice conversations with our AI tutor. Choose the method that works best for your learning style.`
            : currentLanguage === "spanish"
              ? `Practica tus habilidades lingüísticas a través de conversaciones de texto y voz con nuestro tutor de IA. Elige el método que mejor funcione para tu estilo de aprendizaje.`
              : `Pratique suas habilidades linguísticas por meio de conversas de texto e voz com nosso tutor de IA. Escolha o método que funciona melhor para seu estilo de aprendizado.`}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-800 text-sm">
            {currentLanguage === "english" 
              ? "Note: Voice conversations have a 10-minute daily limit for free users."
              : currentLanguage === "spanish"
                ? "Nota: Las conversaciones de voz tienen un límite diario de 10 minutos para usuarios gratuitos."
                : "Nota: As conversas de voz têm um limite diário de 10 minutos para usuários gratuitos."}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {currentLanguage === "english" ? "Text Chat" : 
             currentLanguage === "spanish" ? "Chat de Texto" : "Chat de Texto"}
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            {currentLanguage === "english" ? "Voice Chat" : 
             currentLanguage === "spanish" ? "Chat de Voz" : "Chat de Voz"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {t("conversation")}
              </h3>
              {messages.length > 0 && (
                <Button 
                  onClick={clearTextConversation}
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
              <div ref={messagesEndRef} />
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
        </TabsContent>

        <TabsContent value="voice">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {currentLanguage === "english" ? "Voice Conversation" : 
                 currentLanguage === "spanish" ? "Conversación de Voz" : "Conversa de Voz"}
              </h3>
              
              {remainingTime !== null && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock3 className="h-4 w-4 mr-1" />
                  <span>{formatTime(remainingTime)}</span>
                  <span className="text-xs ml-1">
                    {currentLanguage === "english" ? "remaining today" : 
                     currentLanguage === "spanish" ? "restante hoy" : "restante hoje"}
                  </span>
                </div>
              )}
              
              {voiceMessages.length > 0 && (
                <Button 
                  onClick={clearConversation}
                  variant="outline" 
                  size="sm"
                >
                  {t("clearConversation")}
                </Button>
              )}
            </div>
            
            <div className="space-y-4 mb-6 max-h-[450px] overflow-y-auto">
              {voiceMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Mic className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>
                    {currentLanguage === "english" ? "Tap the microphone button to start speaking" : 
                     currentLanguage === "spanish" ? "Toca el botón del micrófono para empezar a hablar" : 
                     "Toque no botão do microfone para começar a falar"}
                  </p>
                  <p className="text-sm mt-2">
                    {isFallbackMode ? 
                      (currentLanguage === "english" ? "You're in fallback mode (daily limit reached)" : 
                       currentLanguage === "spanish" ? "Estás en modo de respaldo (límite diario alcanzado)" : 
                       "Você está no modo de fallback (limite diário atingido)") : 
                      (currentLanguage === "english" ? "Speak naturally in your chosen language" : 
                       currentLanguage === "spanish" ? "Habla naturalmente en tu idioma elegido" : 
                       "Fale naturalmente em seu idioma escolhido")
                    }
                  </p>
                </div>
              ) : (
                voiceMessages.map((message, index) => (
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
                          {message.audio && (
                            <button
                              onClick={() => {
                                if (audioRef.current) {
                                  audioRef.current.src = `data:audio/mp3;base64,${message.audio}`;
                                  audioRef.current.play();
                                }
                              }}
                              className="flex items-center mt-2 text-xs text-lingua-primary hover:underline"
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              {currentLanguage === "english" ? "Play audio again" : 
                               currentLanguage === "spanish" ? "Reproducir audio de nuevo" : 
                               "Reproduzir áudio novamente"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
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
              <div ref={messagesEndRef} />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`rounded-full p-4 h-16 w-16 ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-lingua-primary hover:bg-lingua-primary/90'
                } ${isFallbackMode ? 'border-2 border-amber-500' : ''}`}
              >
                {isRecording ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              
              {/* Hidden audio element for playing responses */}
              <audio ref={audioRef} className="hidden" />
            </div>
            
            {isFallbackMode && (
              <div className="mt-4 text-center">
                <p className="text-amber-600 text-sm mb-1">
                  {currentLanguage === "english" ? "Daily limit reached" : 
                   currentLanguage === "spanish" ? "Límite diario alcanzado" : "Limite diário atingido"}
                </p>
                <p className="text-xs text-gray-500">
                  {currentLanguage === "english" ? "Using browser speech recognition as fallback" : 
                   currentLanguage === "spanish" ? "Usando reconocimiento de voz del navegador como respaldo" : 
                   "Usando reconhecimento de voz do navegador como fallback"}
                </p>
              </div>
            )}
          </Card>
          
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium mb-2">
              {currentLanguage === "english" ? "Voice Chat Features" : 
               currentLanguage === "spanish" ? "Características del Chat de Voz" : 
               "Recursos do Chat de Voz"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Headphones className="h-4 w-4 mr-2 mt-1 text-lingua-primary shrink-0" />
                <span>
                  {currentLanguage === "english" 
                    ? "Speak naturally and receive audio responses in your target language"
                    : currentLanguage === "spanish"
                      ? "Habla naturalmente y recibe respuestas de audio en tu idioma objetivo"
                      : "Fale naturalmente e receba respostas de áudio em seu idioma-alvo"}
                </span>
              </li>
              <li className="flex items-start">
                <Clock3 className="h-4 w-4 mr-2 mt-1 text-lingua-primary shrink-0" />
                <span>
                  {currentLanguage === "english" 
                    ? "Free users have 10 minutes of voice chat per day"
                    : currentLanguage === "spanish"
                      ? "Los usuarios gratuitos tienen 10 minutos de chat de voz por día"
                      : "Usuários gratuitos têm 10 minutos de chat de voz por dia"}
                </span>
              </li>
              <li className="flex items-start">
                <Bot className="h-4 w-4 mr-2 mt-1 text-lingua-primary shrink-0" />
                <span>
                  {currentLanguage === "english" 
                    ? "Powered by OpenAI's audio models for high-quality interactions"
                    : currentLanguage === "spanish"
                      ? "Impulsado por los modelos de audio de OpenAI para interacciones de alta calidad"
                      : "Alimentado pelos modelos de áudio da OpenAI para interações de alta qualidade"}
                </span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConversationalAI;

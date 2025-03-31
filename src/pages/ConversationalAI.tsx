
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Bot, User, Mic, MicOff, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("text");
  
  // Voice conversation states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
          cefrLevel: "B1", // Default level, could be made configurable
          audioResponse: activeTab === "voice" // Request audio response if in voice tab
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
      
      // Play audio if available
      if (data.audioContent && audioRef.current) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        await audioRef.current.play();
      }
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

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', async () => {
        processVoiceRecording();
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimeRemaining(600); // 10 minutes in seconds
      startTimer();
      
      toast({
        title: t("voiceChatStarted"),
        description: t("speakingNow"),
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: t("microphoneAccessRequired"),
        description: t("allowMicAccess"),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (isRecording) {
            stopRecording();
            toast({
              title: t("timeLimit"),
              description: t("dailyLimitReached"),
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const processVoiceRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      toast({
        title: t("error"),
        description: t("noAudioRecorded"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessingVoice(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove data URL prefix
        
        // Store user voice message
        const userMessage: ChatMessage = {
          role: "user",
          content: t("voiceMessage"),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Call Supabase function to process audio
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { 
            audio: base64Data,
            userLanguage: currentLanguage,
            conversationHistory
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data.transcript) {
          setTranscript(data.transcript);
          
          // Update user message with transcript
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1].content = data.transcript;
            }
            return newMessages;
          });
          
          // Add AI response
          if (data.response) {
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: data.response,
              translation: data.translation,
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            
            // Update conversation history
            if (data.updatedHistory) {
              setConversationHistory(data.updatedHistory);
            }
            
            // Play audio response if available
            if (data.audioContent && audioRef.current) {
              const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
              audioRef.current.src = audioSrc;
              await audioRef.current.play().catch(playError => {
                console.error('Error playing audio:', playError);
                toast({
                  title: t("error"),
                  description: t("audioPlaybackError"),
                  variant: "destructive",
                });
              });
            }
          }
        }
      };
    } catch (error) {
      console.error('Error processing voice:', error);
      toast({
        title: t("error"),
        description: t("errorProcessingVoice"),
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
      title: t("success"),
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="text">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t("textChat")}
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Headphones className="h-4 w-4 mr-2" />
            {t("standardVoice")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
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
        </TabsContent>
        
        <TabsContent value="voice">
          <Card className="mb-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {t("standardVoiceChat")}
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
            
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <Button 
                  onClick={handleVoiceRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className={isRecording ? "bg-red-500" : "bg-lingua-primary"}
                  disabled={isProcessingVoice}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      {t("stopRecording")}
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      {t("startVoiceChat")}
                    </>
                  )}
                </Button>
                
                {timeRemaining !== null && (
                  <div className="text-sm bg-amber-50 px-4 py-2 rounded-full text-amber-800 flex items-center">
                    <Headphones className="h-4 w-4 mr-2" />
                    <span>{formatTime(timeRemaining)}</span>
                    <span className="ml-2">{t("dailyRemaining")}</span>
                  </div>
                )}
              </div>
              
              {isRecording && (
                <p className="text-sm text-gray-500 mt-4 animate-pulse flex items-center">
                  <Mic className="h-4 w-4 mr-2 text-red-500" />
                  {t("recordingActive")}
                </p>
              )}
            </div>
            
            <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Headphones className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>{t("startVoiceChatting")}</p>
                  <p className="text-sm mt-2">
                    {t("tapMicToStart")}
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
              {isProcessingVoice && (
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
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t("standardVoiceInfo")}</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-800 px-1 rounded text-xs">✓</span>
                  {t("openAIVoiceModel")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-800 px-1 rounded text-xs">✓</span>
                  {t("tenMinutesDaily")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-100 text-amber-800 px-1 rounded text-xs">!</span>
                  {t("upgradePremium")}
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default ConversationalAI;

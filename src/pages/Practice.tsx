
import { useState, useEffect } from "react";
import { MessageCircle, Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

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
        title: "Error",
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
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice chat features.",
          variant: "destructive",
        });
      }
    };

    initMicrophone();
  }, [toast]);

  const startVoiceConversation = async () => {
    try {
      await conversation.startSession({
        agentId: "2rNEBxdJ814y7dcdZSOb",
      });
      toast({
        title: "Voice Chat Started",
        description: "You can now speak with your AI language tutor!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start voice conversation. Please try again.",
        variant: "destructive",
      });
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
        title: "Error",
        description: "Failed to get response from AI tutor. Please try again.",
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
          Practice with AI Language Tutor
        </h1>
        <p className="text-gray-600 mb-4">
          Chat with our AI tutor to practice your Spanish! The AI will help correct
          your grammar, vocabulary, and pronunciation. Feel free to ask questions
          about language or culture.
        </p>
        <div className="flex gap-4 mb-4">
          <Button
            onClick={conversation.status === "connected" ? conversation.endSession : startVoiceConversation}
            variant={conversation.status === "connected" ? "destructive" : "default"}
          >
            {conversation.status === "connected" ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Voice Chat
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Chat
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="mb-4 p-6">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Start chatting with your AI language tutor!</p>
              <p className="text-sm mt-2">
                {microphoneAccess 
                  ? "Click 'Start Voice Chat' to begin speaking with the tutor"
                  : "Please allow microphone access to use voice features"}
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
            placeholder="Type your message in English or Spanish..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lingua-primary"
            disabled={conversation.status === "connected"}
          />
          <Button type="submit" disabled={isLoading || conversation.status === "connected"}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Practice;

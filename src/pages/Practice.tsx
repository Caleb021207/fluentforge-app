
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Mic, MicOff, BookOpen, FileText, Volume2, Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

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

interface RealTimeMetrics {
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
}

const Practice = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [skillAssessment, setSkillAssessment] = useState<SkillAssessment | null>(null);
  const [showRealTimeMetrics, setShowRealTimeMetrics] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    pronunciation: 0,
    fluency: 0,
    vocabulary: 0,
    grammar: 0
  });
  const metricsRef = useRef<RealTimeMetrics>({
    pronunciation: 0,
    fluency: 0,
    vocabulary: 0,
    grammar: 0
  });
  const { toast } = useToast();

  const conversation = useConversation({
    clientTools: {
      updateMetric: (parameters: { metricType: keyof RealTimeMetrics, score: number }) => {
        const { metricType, score } = parameters;
        
        // Update the metrics ref first
        const updatedMetrics = { ...metricsRef.current };
        updatedMetrics[metricType] = score;
        metricsRef.current = updatedMetrics;
        
        // Then update the state
        setRealTimeMetrics(updatedMetrics);
        
        return `Metric updated: ${metricType}: ${score}/100`;
      }
    },
    onMessage: (message) => {
      console.log("Voice message received:", message);
      
      if (message.type === "llm_response") {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (message.type === "transcript") {
        // When user speaks, add their message to the chat
        const userMessage: ChatMessage = {
          role: "user",
          content: message.content,
        };
        setMessages((prev) => [...prev, userMessage]);
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
    
    // Clean up conversation on component unmount
    return () => {
      if (conversation.status === "connected") {
        conversation.endSession().catch(console.error);
      }
    };
  }, [toast]);

  const startVoiceConversation = async () => {
    try {
      await conversation.startSession({
        // Using the specialized language tutor agent
        agentId: "Qc5G2DZi0jRmMf3CzC8f",
      });
      
      // Show real-time metrics when voice conversation starts
      setShowRealTimeMetrics(true);
      
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

  const stopVoiceConversation = async () => {
    try {
      await conversation.endSession();
      
      // Hide metrics when conversation ends
      setShowRealTimeMetrics(false);
      
      // Reset metrics
      const resetMetrics = {
        pronunciation: 0,
        fluency: 0,
        vocabulary: 0,
        grammar: 0
      };
      
      setRealTimeMetrics(resetMetrics);
      metricsRef.current = resetMetrics;
      
      toast({
        title: "Voice Chat Ended",
        description: "Your conversation with the AI tutor has ended.",
      });
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  };

  const requestSkillAssessment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: "Please assess my Spanish language skills based on our conversation. Provide feedback on my reading, writing, speaking, and listening abilities, and estimate my overall proficiency level.",
          requestType: "assessment"
        }
      });

      if (error) throw error;

      setSkillAssessment(data.assessment);
      toast({
        title: "Assessment Complete",
        description: "Your language skills have been evaluated!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get skill assessment. Please try again.",
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
        <div className="flex flex-wrap gap-4 mb-4">
          <Button
            onClick={conversation.status === "connected" ? stopVoiceConversation : startVoiceConversation}
            variant={conversation.status === "connected" ? "destructive" : "default"}
            disabled={!microphoneAccess}
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
          <Button 
            onClick={requestSkillAssessment} 
            disabled={messages.length === 0 || isLoading || conversation.status === "connected"}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Assessment...
              </>
            ) : (
              <>Get Skills Assessment</>
            )}
          </Button>
        </div>
      </div>

      {showRealTimeMetrics && (
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-4">Real-time Language Analysis</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pronunciation</span>
                <span>{realTimeMetrics.pronunciation}%</span>
              </div>
              <Progress value={realTimeMetrics.pronunciation} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fluency</span>
                <span>{realTimeMetrics.fluency}%</span>
              </div>
              <Progress value={realTimeMetrics.fluency} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vocabulary</span>
                <span>{realTimeMetrics.vocabulary}%</span>
              </div>
              <Progress value={realTimeMetrics.vocabulary} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Grammar</span>
                <span>{realTimeMetrics.grammar}%</span>
              </div>
              <Progress value={realTimeMetrics.grammar} className="h-2" />
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {skillAssessment && (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">Reading</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.reading}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">Writing</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.writing}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">Speaking</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.speaking}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">Listening</h3>
              </div>
              <p className="text-sm text-gray-600">{skillAssessment.listening}</p>
            </Card>
            <Card className="p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-lingua-primary" />
                <h3 className="font-semibold">Overall Level</h3>
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

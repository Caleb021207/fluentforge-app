
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message, LanguageMetrics } from "@/types/chat";

export function useLanguageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<LanguageMetrics | null>(null);
  const { toast } = useToast();

  const analyzeConversation = async (
    messages: Message[], 
    options: { 
      sessionId?: string, 
      classroomId?: string,
      silent?: boolean 
    } = {}
  ) => {
    try {
      setIsAnalyzing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Format messages for the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Determine if this is a voice chat session by checking the session ID pattern or structure
      const isVoiceSession = options.sessionId && (
        options.sessionId.includes('voice') || 
        options.sessionId.startsWith('vc-')
      );
      
      // For voice sessions, we also need to extract pronunciation metrics
      let pronunciationMetrics = null;
      if (isVoiceSession) {
        try {
          // Call the analyze-speaking function to get pronunciation data
          const speakingResult = await supabase.functions.invoke('analyze-speaking', {
            body: {
              speakingAttemptId: options.sessionId,
              listeningAttemptId: options.sessionId,
              transcript: {
                userMessages: formattedMessages.filter(m => m.role === 'user'),
                aiResponses: formattedMessages.filter(m => m.role === 'assistant')
              }
            }
          });

          if (speakingResult.data && speakingResult.data.speaking) {
            pronunciationMetrics = speakingResult.data.speaking.pronunciation * 10; // Convert from 1-10 scale to percentage
          }
        } catch (voiceError) {
          console.error("Error getting pronunciation metrics:", voiceError);
          // Continue with other metrics even if pronunciation analysis fails
        }
      }
      
      // Call our Edge Function for general language metrics
      const { data, error } = await supabase.functions.invoke('analyze-conversation-quality', {
        body: {
          userId: user.id,
          classroomId: options.classroomId,
          sessionId: options.sessionId,
          messages: formattedMessages,
          includeVoiceMetrics: isVoiceSession
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      // Combine the metrics with pronunciation data if available
      const combinedMetrics: LanguageMetrics = {
        ...data.metrics,
        pronunciationAccuracy: pronunciationMetrics || data.metrics.pronunciationAccuracy,
        timestamp: Date.now()
      };

      setLastMetrics(combinedMetrics);
      
      // Optionally show success toast
      if (!options.silent) {
        toast({
          title: "Analysis Complete",
          description: "Your conversation has been analyzed successfully."
        });
      }
      
      return combinedMetrics;
    } catch (error: any) {
      console.error("Language analysis error:", error);
      
      if (!options.silent) {
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze conversation",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeConversation,
    isAnalyzing,
    lastMetrics
  };
}

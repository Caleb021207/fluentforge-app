
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
      
      // Call our Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-conversation-quality', {
        body: {
          userId: user.id,
          classroomId: options.classroomId,
          sessionId: options.sessionId,
          messages: formattedMessages
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setLastMetrics(data.metrics);
      
      // Optionally show success toast
      if (!options.silent) {
        toast({
          title: "Analysis Complete",
          description: "Your conversation has been analyzed successfully."
        });
      }
      
      return data.metrics;
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

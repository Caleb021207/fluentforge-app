import { useState } from 'react';
import { useLanguageAnalysis } from '@/hooks/useLanguageAnalysis';
import { Message, LanguageMetrics } from '@/types/chat';
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useLanguageMetricsPanel = (messages: Message[] = []) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<LanguageMetrics | null>(null);
  const { analyzeConversation, isAnalyzing } = useLanguageAnalysis();
  const { toast } = useToast();
  const { t } = useLocalization();

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const analyzeCurrentConversation = async () => {
    if (messages.length < 4) {
      toast({
        title: t("notEnoughMessages"),
        description: t("needMoreMessagesToAnalyze"),
        variant: "default"
      });
      return;
    }

    try {
      const result = await analyzeConversation(messages);
      
      if (result) {
        setMetrics(result);
        
        // If panel is not expanded, expand it to show the results
        if (!isExpanded) {
          setIsExpanded(true);
        }
      }
    } catch (error) {
      console.error("Error analyzing conversation:", error);
      toast({
        title: t("error"),
        description: t("failedToAnalyzeConversation"),
        variant: "destructive"
      });
    }
  };

  return {
    isExpanded,
    togglePanel,
    metrics,
    isMetricsLoading: isAnalyzing, // Rename for backward compatibility
    analyzeConversation: analyzeCurrentConversation, // For backward compatibility
    // Keep the new name as well for future compatibility
    isAnalyzing,
    analyzeCurrentConversation
  };
};


import { useState } from 'react';
import { useLanguageAnalysis } from '@/hooks/useLanguageAnalysis';
import { Message, LanguageMetrics } from '@/types/chat';
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useLanguageMetricsPanel = (messages: Message[]) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<LanguageMetrics | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const { analyzeConversation, isAnalyzing } = useLanguageAnalysis();
  const { toast } = useToast();
  const { t } = useLocalization();

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const analyzeCurrentConversation = async () => {
    if (hasAnalyzed) {
      toast({
        title: t("analysisLimitReached"),
        description: t("canOnlyAnalyzeOncePerSession"),
        variant: "default",
      });
      return;
    }

    if (messages.length < 4) {
      const definitionsText = `
${t("needMoreMessagesToAnalyze")}

${t("whatAreMessages")} ${t("messagesDefinition")}

${t("whatIsGrammarAccuracy")} ${t("grammarAccuracyDefinition")}

${t("whatIsComplexity")} ${t("complexityDefinition")}
      `.trim();
      
      toast({
        title: t("notEnoughMessages"),
        description: definitionsText,
        variant: "default",
        duration: 10000
      });
      return;
    }

    try {
      const result = await analyzeConversation(messages);
      
      if (result) {
        setMetrics(result);
        setHasAnalyzed(true);
        
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
    isAnalyzing,
    analyzeCurrentConversation,
    hasAnalyzed
  };
};

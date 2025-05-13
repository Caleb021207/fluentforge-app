
import { useState } from "react";
import { LanguageMetrics, Message } from "@/types/chat";

const DEFAULT_METRICS: LanguageMetrics = {
  grammarAccuracy: 0,
  vocabularyDiversity: 0,
  conversationComplexity: 0,
  messageCount: 0
};

export const useLanguageMetricsPanel = (messages: Message[]) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<LanguageMetrics>(DEFAULT_METRICS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const analyzeCurrentConversation = async () => {
    if (messages.length === 0) {
      return;
    }

    setIsAnalyzing(true);

    try {
      // In a real implementation, this would call an API to analyze the conversation
      // For now, we'll simulate a delay and return mock metrics
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate random metrics for demonstration purposes
      const mockMetrics: LanguageMetrics = {
        grammarAccuracy: Math.floor(Math.random() * 40) + 60, // 60-100
        vocabularyDiversity: Math.floor(Math.random() * 50) + 50, // 50-100
        conversationComplexity: Math.floor(Math.random() * 60) + 40, // 40-100
        messageCount: messages.filter(m => m.role === "user").length
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error analyzing conversation:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isExpanded,
    togglePanel,
    metrics,
    isMetricsLoading: isAnalyzing, // Rename for backward compatibility
    analyzeCurrentConversation,
    // For backward compatibility
    isAnalyzing,
    analyzeConversation: analyzeCurrentConversation
  };
};

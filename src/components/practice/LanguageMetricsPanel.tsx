
import React from 'react';

interface LanguageMetricsPanelProps {
  metrics: any | null;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onAnalyze: () => void;
}

const LanguageMetricsPanel: React.FC<LanguageMetricsPanelProps> = () => {
  // Component now renders nothing - analytics and metrics removed
  return null;
};

export default LanguageMetricsPanel;

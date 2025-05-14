
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { LanguageMetrics } from '@/types/chat';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from 'next-themes';

interface AccuracyChartProps {
  metricsHistory: (LanguageMetrics & { timestamp: number })[];
}

const AccuracyChart: React.FC<AccuracyChartProps> = ({ metricsHistory }) => {
  const { t } = useLocalization();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Colors that work well in both light and dark themes
  const lineColors = {
    grammarAccuracy: '#0ea5e9', // sky blue
    conversationComplexity: '#8b5cf6', // purple
    vocabularyDiversity: '#f59e0b', // amber
  };

  const textColor = isDark ? '#f1f5f9' : '#334155';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // Format data for the chart
  const chartData = useMemo(() => {
    if (!metricsHistory.length) return [];
    
    // Sort by timestamp
    return [...metricsHistory]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(metric => ({
        timestamp: metric.timestamp,
        formattedDate: new Date(metric.timestamp).toLocaleDateString(),
        grammarAccuracy: Math.round(metric.grammarAccuracy),
        conversationComplexity: Math.round(metric.conversationComplexity),
        vocabularyDiversity: metric.vocabularyDiversity !== undefined ? Math.round(metric.vocabularyDiversity) : undefined
      }));
  }, [metricsHistory]);

  if (chartData.length < 2) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        {t("notEnoughDataForTrends")}
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="formattedDate" 
            stroke={textColor}
            tick={{ fill: textColor }}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke={textColor}
            tick={{ fill: textColor }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#475569' : '#e2e8f0',
              color: textColor
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="grammarAccuracy"
            name={t("grammarAccuracy")}
            stroke={lineColors.grammarAccuracy}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="conversationComplexity"
            name={t("conversationComplexity")}
            stroke={lineColors.conversationComplexity}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {chartData[0].vocabularyDiversity !== undefined && (
            <Line
              type="monotone"
              dataKey="vocabularyDiversity"
              name={t("vocabularyDiversity")}
              stroke={lineColors.vocabularyDiversity}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccuracyChart;

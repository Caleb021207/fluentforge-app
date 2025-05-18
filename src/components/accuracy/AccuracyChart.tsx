
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useLocalization } from "@/context/LocalizationContext";
import { LanguageMetrics } from "@/types/chat";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface MetricsDataPoint {
  date: string;
  grammarAccuracy: number;
  conversationComplexity: number;
}

const formatDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  return `${month} ${day}`;
};

const AccuracyChart = ({ metricsHistory }: { metricsHistory: LanguageMetrics[] }) => {
  const { t } = useLocalization();
  
  if (!metricsHistory || metricsHistory.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">{t("noDataAvailable")}</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = metricsHistory.map(metric => ({
    date: formatDate(new Date(metric.timestamp || Date.now())),
    grammarAccuracy: metric.grammarAccuracy ? Number(metric.grammarAccuracy.toFixed(1)) : 0,
    conversationComplexity: metric.conversationComplexity ? Number(metric.conversationComplexity.toFixed(1)) : 0
  })).reverse();

  return (
    <ChartContainer config={{
      grammarAccuracy: { theme: { light: "#8884d8", dark: "#a78bfa" } },
      conversationComplexity: { theme: { light: "#82ca9d", dark: "#4ade80" } }
    }}>
      <LineChart 
        data={chartData} 
        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          height={60}
          tickMargin={10}
        />
        <YAxis 
          domain={[0, 100]} 
          tickCount={6} 
          tick={{ fontSize: 12 }}
          width={60}
          tickMargin={10}
          label={{ 
            value: t("score"), 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' },
            dy: 50,
            dx: -30 
          }}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend verticalAlign="bottom" height={36} />
        <Line
          name={t("grammarAccuracy")}
          type="monotone"
          dataKey="grammarAccuracy"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          name={t("conversationComplexity")}
          type="monotone"
          dataKey="conversationComplexity"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default AccuracyChart;

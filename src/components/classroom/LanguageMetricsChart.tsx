
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useLocalization } from "@/context/LocalizationContext";

interface MetricsDataPoint {
  date: string;
  grammarAccuracy: number;
  conversationComplexity: number;
}

interface LanguageMetricsChartProps {
  data: MetricsDataPoint[];
  title?: string;
}

const LanguageMetricsChart: React.FC<LanguageMetricsChartProps> = ({ 
  data, 
  title = "Language Skills Progress" 
}) => {
  const { t } = useLocalization();
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {t("noDataAvailable")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]} 
                tickCount={6} 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Score', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                  dx: -10
                }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}`, '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="grammarAccuracy"
                name="Grammar Accuracy"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="conversationComplexity"
                name="Conversation Complexity"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageMetricsChart;

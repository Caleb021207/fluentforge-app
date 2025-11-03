import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface ClassConversationComplexityChartProps {
  data: Array<{ date: string; avgComplexity: number; count: number }>;
}

const ClassConversationComplexityChart: React.FC<ClassConversationComplexityChartProps> = ({ data }) => {
  const { t } = useLocalization();

  if (!data || data.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("classComplexityTrends")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("noClassDataYet")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {t("classComplexityTrends")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          avgComplexity: { theme: { light: "hsl(var(--palavox-teal))", dark: "hsl(var(--palavox-teal))" } }
        }}>
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              height={60}
              tickMargin={10}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={[0, 100]} 
              tickCount={6} 
              tick={{ fontSize: 12 }}
              width={60}
              tickMargin={10}
              className="text-muted-foreground"
              label={{ 
                value: t("conversationComplexity"), 
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
              name={t("conversationComplexity")}
              type="monotone"
              dataKey="avgComplexity"
              stroke="hsl(var(--palavox-teal))"
              strokeWidth={3}
              dot={{ r: 5, fill: "hsl(var(--palavox-teal))" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ClassConversationComplexityChart;

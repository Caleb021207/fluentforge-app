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
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {t("classComplexityTrends")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer 
          config={{
            avgComplexity: { 
              label: t("conversationComplexity"),
              theme: { light: "hsl(var(--palavox-teal))", dark: "hsl(var(--palavox-teal))" } 
            }
          }}
          className="h-[300px] w-full"
        >
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="complexityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--palavox-teal))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--palavox-teal))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              name={t("conversationComplexity")}
              type="monotone"
              dataKey="avgComplexity"
              stroke="hsl(var(--palavox-teal))"
              strokeWidth={3}
              dot={{ 
                r: 4, 
                fill: "hsl(var(--palavox-teal))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))"
              }}
              activeDot={{ 
                r: 6,
                fill: "hsl(var(--palavox-teal))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))"
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ClassConversationComplexityChart;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface ClassGrammarAccuracyChartProps {
  data: Array<{ date: string; avgGrammar: number; count: number }>;
}

const ClassGrammarAccuracyChart: React.FC<ClassGrammarAccuracyChartProps> = ({ data }) => {
  const { t } = useLocalization();

  if (!data || data.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t("classGrammarTrends")}
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
          <BookOpen className="h-5 w-5 text-primary" />
          {t("classGrammarTrends")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer 
          config={{
            avgGrammar: { 
              label: t("grammarAccuracy"),
              theme: { light: "hsl(var(--palavox-accent))", dark: "hsl(var(--palavox-accent))" } 
            }
          }}
          className="h-[300px] w-full"
        >
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grammarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--palavox-accent))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--palavox-accent))" stopOpacity={0} />
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
              name={t("grammarAccuracy")}
              type="monotone"
              dataKey="avgGrammar"
              stroke="hsl(var(--palavox-accent))"
              strokeWidth={3}
              dot={{ 
                r: 4, 
                fill: "hsl(var(--palavox-accent))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))"
              }}
              activeDot={{ 
                r: 6,
                fill: "hsl(var(--palavox-accent))",
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

export default ClassGrammarAccuracyChart;

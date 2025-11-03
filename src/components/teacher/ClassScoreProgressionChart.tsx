import React from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ClassScoreProgressionChartProps {
  data: Array<{ date: string; avgScore: number; count: number }>;
}

const ClassScoreProgressionChart: React.FC<ClassScoreProgressionChartProps> = ({ data }) => {
  const { t } = useLocalization();

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              {t("classScoreProgression")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("noClassDataYet")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass border-green-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            {t("classScoreProgression")}
          </CardTitle>
          <CardDescription>
            Track average test scores across all students over time
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid rgb(34 197 94 / 0.5)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#10b981" 
                fill="url(#scoreGradient)"
                strokeWidth={3}
                name={t("averageClassScore")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassScoreProgressionChart;

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface ClassGrammarAccuracyChartProps {
  data: Array<{ date: string; avgGrammar: number; count: number }>;
}

const ClassGrammarAccuracyChart: React.FC<ClassGrammarAccuracyChartProps> = ({ data }) => {
  const { t } = useLocalization();

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-palavox-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-palavox-accent/20 to-purple-500/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-palavox-accent" />
              </div>
              {t("classGrammarTrends")}
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
      transition={{ delay: 0.1 }}
    >
      <Card className="glass border-purple-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-500" />
            </div>
            {t("classGrammarTrends")}
          </CardTitle>
          <CardDescription>
            Monitor grammar accuracy improvements across your class
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grammarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
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
                  border: '1px solid rgb(168 85 247 / 0.5)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgGrammar" 
                stroke="#a855f7" 
                fill="url(#grammarGradient)"
                strokeWidth={3}
                name={t("grammarAccuracy")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassGrammarAccuracyChart;

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ClassConversationComplexityChartProps {
  data: Array<{ date: string; avgComplexity: number; count: number }>;
}

const ClassConversationComplexityChart: React.FC<ClassConversationComplexityChartProps> = ({ data }) => {
  const { t } = useLocalization();

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-palavox-teal/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-palavox-teal/20 to-cyan-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-palavox-teal" />
              </div>
              {t("classComplexityTrends")}
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
      transition={{ delay: 0.2 }}
    >
      <Card className="glass border-orange-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg">
              <MessageSquare className="h-5 w-5 text-orange-500" />
            </div>
            {t("classComplexityTrends")}
          </CardTitle>
          <CardDescription>
            Track conversation sophistication across your students
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="complexityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
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
                  border: '1px solid rgb(249 115 22 / 0.5)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgComplexity" 
                stroke="#f97316" 
                fill="url(#complexityGradient)"
                strokeWidth={3}
                name={t("conversationComplexity")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassConversationComplexityChart;

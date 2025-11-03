import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface CEFRComparisonCardProps {
  cefrComparison?: {
    currentLevel: string;
    descriptorMatch: string;
    strengthsVsLevel: string[];
    gapsToNextLevel: string[];
    estimatedTimeToNextLevel: string;
  };
}

const CEFRComparisonCard: React.FC<CEFRComparisonCardProps> = ({ cefrComparison }) => {
  if (!cefrComparison) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'C2': return 'from-purple-500 to-purple-600';
      case 'C1': return 'from-indigo-500 to-indigo-600';
      case 'B2': return 'from-blue-500 to-blue-600';
      case 'B1': return 'from-green-500 to-green-600';
      case 'A2': return 'from-yellow-500 to-yellow-600';
      case 'A1': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          CEFR Level Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Badge */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Current Level</p>
            <Badge className={`bg-gradient-to-r ${getLevelColor(cefrComparison.currentLevel)} text-white text-lg px-4 py-2 shadow-lg`}>
              {cefrComparison.currentLevel}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Estimated Time to Next Level</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold text-lg">{cefrComparison.estimatedTimeToNextLevel}</span>
            </div>
          </div>
        </div>

        {/* Level Descriptor Match */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20"
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            How You Match This Level
          </h4>
          <p className="text-sm leading-relaxed text-foreground/80">{cefrComparison.descriptorMatch}</p>
        </motion.div>

        {/* Strengths vs Level */}
        {cefrComparison.strengthsVsLevel && cefrComparison.strengthsVsLevel.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20"
          >
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Where You Exceed Expectations
            </h4>
            <ul className="space-y-2">
              {cefrComparison.strengthsVsLevel.map((strength, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Gaps to Next Level */}
        {cefrComparison.gapsToNextLevel && cefrComparison.gapsToNextLevel.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20"
          >
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
              <Target className="h-4 w-4" />
              Skills Needed for Next Level
            </h4>
            <ul className="space-y-2">
              {cefrComparison.gapsToNextLevel.map((gap, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">→</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default CEFRComparisonCard;

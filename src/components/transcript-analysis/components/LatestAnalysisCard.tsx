
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Analysis } from "../types";
import { BookOpen, Mic, PenTool, Headphones } from "lucide-react";
import { motion } from "framer-motion";

interface LatestAnalysisCardProps {
  analysis: Analysis;
}

const LatestAnalysisCard: React.FC<LatestAnalysisCardProps> = ({ analysis }) => {
  const getCEFRColor = (level: string | null) => {
    switch (level) {
      case 'C2': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400';
      case 'C1': return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-400';
      case 'B2': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400';
      case 'B1': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400';
      case 'A2': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-400';
      case 'A1': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-muted';
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    return 'bg-gradient-to-r from-red-500 to-orange-500';
  };

  const skillSections = [
    {
      icon: BookOpen,
      title: 'Reading & Listening',
      score: analysis.reading_listening_score,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500'
    },
    {
      icon: PenTool,
      title: 'Written Production',
      score: analysis.written_production_score,
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500'
    },
    {
      icon: Mic,
      title: 'Spoken Fluency',
      score: analysis.spoken_fluency_score,
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-500'
    }
  ];

  return (
    <Card className="glass border-primary/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Latest Analysis Results</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              {format(new Date(analysis.upload_date), 'MMMM d, yyyy')} · {analysis.file_name}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        {/* Overall Score Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Overall Score</div>
              <div className="text-5xl font-bold gradient-text">{analysis.overall_score || 'N/A'}%</div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Badge className={`${getCEFRColor(analysis.cefr_level)} text-lg px-4 py-2 shadow-lg`}>
                {analysis.cefr_level || 'N/A'}
              </Badge>
            </motion.div>
          </div>
          <Progress value={analysis.overall_score || 0} className="h-3" />
        </motion.div>

        {/* Skills Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillSections.map((skill, index) => (
            skill.score !== null && (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`p-5 rounded-xl bg-gradient-to-br ${skill.color} border border-primary/10 hover:border-primary/30 transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <skill.icon className={`h-6 w-6 ${skill.iconColor}`} />
                  <div className="text-2xl font-bold text-foreground">{skill.score}%</div>
                </div>
                <div className="text-sm font-medium text-foreground mb-2">{skill.title}</div>
                <Progress value={skill.score} className="h-2" />
              </motion.div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestAnalysisCard;

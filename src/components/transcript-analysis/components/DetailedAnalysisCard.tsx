import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Mic, Brain, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface DetailedAnalysisCardProps {
  feedback: string;
  detailedAnalysis?: {
    grammarAnalysis?: {
      strengths: string[];
      weaknesses: string[];
      examples: string[];
      recommendations: string[];
    };
    vocabularyAnalysis?: {
      level: string;
      range: string[];
      sophisticatedTerms: string[];
      collocations: string[];
      recommendations: string[];
    };
    pronunciationAnalysis?: {
      strengths: string[];
      challenges: string[];
      intonationPatterns: string;
      recommendations: string[];
    };
    fluencyAnalysis?: {
      speechRate: string;
      hesitationPatterns: string[];
      discourseMarkers: string[];
      selfCorrections: string;
      recommendations: string[];
    };
    coherenceAnalysis?: {
      organization: string;
      linkingDevices: string[];
      topicDevelopment: string;
      recommendations: string[];
    };
  };
}

const DetailedAnalysisCard: React.FC<DetailedAnalysisCardProps> = ({ feedback, detailedAnalysis }) => {
  const analysisCategories = [
    {
      icon: BookOpen,
      title: "Grammar Analysis",
      data: detailedAnalysis?.grammarAnalysis,
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500"
    },
    {
      icon: MessageSquare,
      title: "Vocabulary Analysis",
      data: detailedAnalysis?.vocabularyAnalysis,
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500"
    },
    {
      icon: Mic,
      title: "Pronunciation Analysis",
      data: detailedAnalysis?.pronunciationAnalysis,
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500"
    },
    {
      icon: Brain,
      title: "Fluency Analysis",
      data: detailedAnalysis?.fluencyAnalysis,
      color: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Coherence Analysis",
      data: detailedAnalysis?.coherenceAnalysis,
      color: "from-indigo-500/20 to-violet-500/20",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Feedback */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Comprehensive Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed whitespace-pre-line">{feedback}</p>
        </CardContent>
      </Card>

      {/* Detailed Analysis Sections */}
      {detailedAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analysisCategories.map((category, index) => (
            category.data && (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`glass border-primary/20 h-full bg-gradient-to-br ${category.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Strengths */}
                    {'strengths' in category.data && category.data.strengths && category.data.strengths.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold text-green-700">Strengths</h4>
                        </div>
                        <ul className="space-y-1.5 ml-6">
                          {category.data.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-foreground/80 list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses/Challenges */}
                    {(('weaknesses' in category.data && category.data.weaknesses) || ('challenges' in category.data && category.data.challenges)) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <h4 className="font-semibold text-orange-700">Areas to Work On</h4>
                        </div>
                        <ul className="space-y-1.5 ml-6">
                          {('weaknesses' in category.data ? category.data.weaknesses : 'challenges' in category.data ? category.data.challenges : []).map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-foreground/80 list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Special fields for Vocabulary */}
                    {'sophisticatedTerms' in category.data && category.data.sophisticatedTerms && category.data.sophisticatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Sophisticated Terms Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.data.sophisticatedTerms.map((term: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special fields for Fluency */}
                    {'discourseMarkers' in category.data && category.data.discourseMarkers && category.data.discourseMarkers.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Discourse Markers</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.data.discourseMarkers.map((marker: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">{marker}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {'recommendations' in category.data && category.data.recommendations && category.data.recommendations.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
                        <ul className="space-y-1.5">
                          {category.data.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                              <span className="text-primary mt-0.5">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailedAnalysisCard;

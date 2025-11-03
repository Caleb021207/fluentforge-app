
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Calendar, ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

interface Analysis {
  id: string;
  upload_date: string;
  overall_score: number | null;
  cefr_level: string | null;
  file_name: string;
  reading_listening_score: number | null;
  written_production_score: number | null;
  spoken_fluency_score: number | null;
}

interface Milestone {
  id: string;
  milestone_type: string;
  previous_value: number | null;
  current_value: number | null;
  improvement_percentage: number | null;
  achievement_date: string;
  description: string | null;
}

interface ProgressTimelineProps {
  analyses: Analysis[] | undefined;
  milestones: Milestone[] | undefined;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ analyses, milestones }) => {
  const sortedAnalyses = analyses?.sort((a, b) => 
    new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
  ) || [];

  const getCEFRColor = (level: string | null) => {
    switch (level) {
      case 'C2': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'C1': return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white';
      case 'B2': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'B1': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'A2': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'A1': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const chartData = sortedAnalyses.map((analysis, index) => ({
    name: `Test ${index + 1}`,
    date: format(new Date(analysis.upload_date), 'MMM d'),
    overall: analysis.overall_score || 0,
    reading: analysis.reading_listening_score || 0,
    writing: analysis.written_production_score || 0,
    speaking: analysis.spoken_fluency_score || 0,
  }));

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="pt-6 text-center py-12">
          <TrendingUp className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">No progress data yet</h3>
          <p className="text-muted-foreground">Upload multiple transcripts to see your progress timeline and track improvement.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Chart */}
      {sortedAnalyses.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Score Progression
              </CardTitle>
              <CardDescription>
                Track your improvement across all skill areas over time
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="overall" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#overallGradient)"
                    strokeWidth={3}
                    name="Overall Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reading" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Reading"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="writing" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    name="Writing"
                    dot={{ fill: '#a855f7', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="speaking" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Speaking"
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Progress Overview
            </CardTitle>
            <CardDescription>
              Your language learning journey at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedAnalyses.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                  <div className="text-sm text-muted-foreground mb-1">First Test</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-foreground">{sortedAnalyses[0]?.overall_score || 'N/A'}</div>
                    <div className="text-lg text-muted-foreground">%</div>
                  </div>
                  <Badge className={`${getCEFRColor(sortedAnalyses[0]?.cefr_level)} mt-2`}>
                    {sortedAnalyses[0]?.cefr_level || 'N/A'}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Latest Test</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-foreground">{sortedAnalyses[sortedAnalyses.length - 1]?.overall_score || 'N/A'}</div>
                    <div className="text-lg text-muted-foreground">%</div>
                  </div>
                  <Badge className={`${getCEFRColor(sortedAnalyses[sortedAnalyses.length - 1]?.cefr_level)} mt-2`}>
                    {sortedAnalyses[sortedAnalyses.length - 1]?.cefr_level || 'N/A'}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Improvement</div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const first = sortedAnalyses[0]?.overall_score;
                      const latest = sortedAnalyses[sortedAnalyses.length - 1]?.overall_score;
                      if (first && latest) {
                        const improvement = latest - first;
                        const Icon = improvement > 0 ? ArrowUp : improvement < 0 ? ArrowDown : Minus;
                        const colorClass = improvement > 0 ? 'text-green-500' : improvement < 0 ? 'text-red-500' : 'text-muted-foreground';
                        return (
                          <>
                            <Icon className={`h-6 w-6 ${colorClass}`} />
                            <div className={`text-3xl font-bold ${colorClass}`}>
                              {improvement > 0 ? '+' : ''}{improvement}%
                            </div>
                          </>
                        );
                      }
                      return <div className="text-2xl text-muted-foreground">N/A</div>;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline of all analyses */}
            <div className="relative space-y-4">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-palavox-teal to-accent" />
              
              {sortedAnalyses.map((analysis, index) => {
                const prevScore = index > 0 ? sortedAnalyses[index - 1]?.overall_score : null;
                const currentScore = analysis.overall_score;
                const scoreDiff = prevScore && currentScore ? currentScore - prevScore : null;
                
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="relative pl-16 pr-4"
                  >
                    <div className="absolute left-0 top-2 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg z-10">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="p-5 border rounded-xl bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg text-foreground mb-1">{analysis.file_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(analysis.upload_date), 'MMMM d, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-foreground">{analysis.overall_score || 'N/A'}</div>
                            {analysis.overall_score && <div className="text-sm text-muted-foreground">%</div>}
                          </div>
                          {analysis.cefr_level && (
                            <Badge className={`${getCEFRColor(analysis.cefr_level)} mt-1`}>
                              {analysis.cefr_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {scoreDiff !== null && (
                        <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                          scoreDiff > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                          scoreDiff < 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                          'bg-muted/50 text-muted-foreground border border-border'
                        }`}>
                          {scoreDiff > 0 ? <ArrowUp className="h-4 w-4" /> : scoreDiff < 0 ? <ArrowDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          {scoreDiff > 0 ? '+' : ''}{scoreDiff}% from previous
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestones Section */}
      {milestones && milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-palavox-teal/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-palavox-teal/20 to-accent/20 rounded-lg">
                  <Award className="h-5 w-5 text-palavox-teal" />
                </div>
                Achievements & Milestones
              </CardTitle>
              <CardDescription>Celebrate your progress and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-5 bg-gradient-to-br from-primary/10 via-palavox-teal/5 to-transparent rounded-xl border border-primary/20 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-semibold text-foreground capitalize mb-1">
                          {milestone.milestone_type.replace('_', ' ')}
                        </div>
                        {milestone.description && (
                          <div className="text-sm text-muted-foreground mb-2">{milestone.description}</div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(milestone.achievement_date), 'MMM d, yyyy')}
                          </div>
                          {milestone.improvement_percentage && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                              <ArrowUp className="h-3 w-3 text-green-500" />
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                +{milestone.improvement_percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressTimeline;

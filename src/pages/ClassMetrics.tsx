import { motion } from "framer-motion";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useTeacherClassMetrics } from "@/hooks/useTeacherClassMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { Users, TrendingUp, BookOpen, Mic, MessageSquare, Award, Sparkles, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import ClassScoreProgressionChart from "@/components/teacher/ClassScoreProgressionChart";
import ClassGrammarAccuracyChart from "@/components/teacher/ClassGrammarAccuracyChart";
import ClassConversationComplexityChart from "@/components/teacher/ClassConversationComplexityChart";
import StudentTestScores from "@/components/profile/StudentTestScores";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fadeIn, slideInUp, staggeredContainer } from "@/lib/animations";

const ClassMetrics = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { isTeacher, teacherId, isLoading: teacherLoading } = useTeacherStatus();
  const { data: metrics, isLoading: metricsLoading } = useTeacherClassMetrics(teacherId);

  if (teacherLoading || metricsLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 md:p-8">
        <GradientBlob className="top-20 left-10" />
        <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    navigate("/profile");
    return null;
  }

  // Calculate averages for display
  const avgScore = metrics?.scoreProgression?.length 
    ? Math.round(metrics.scoreProgression.reduce((sum, item) => sum + item.avgScore, 0) / metrics.scoreProgression.length)
    : null;
  
  const avgGrammar = metrics?.grammarTrends?.length
    ? Math.round(metrics.grammarTrends.reduce((sum, item) => sum + item.avgGrammar, 0) / metrics.grammarTrends.length)
    : null;
  
  const avgComplexity = metrics?.complexityTrends?.length
    ? Math.round(metrics.complexityTrends.reduce((sum, item) => sum + item.avgComplexity, 0) / metrics.complexityTrends.length)
    : null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 md:p-8">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToProfile")}
          </Button>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              {t("classWideMetrics")}
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your students' learning journey and performance
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={staggeredContainer(0.1)}
          initial="hidden"
          animate="visible"
        >
          <Card className="glass border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Class Overview
              </CardTitle>
              <CardDescription>
                Performance metrics across all your students
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={fadeIn} className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{metrics?.totalStudents || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metrics?.totalClasses || 0} classes</div>
                </motion.div>
                
                <motion.div variants={fadeIn} className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <div className="text-sm text-muted-foreground">Avg Test Score</div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-3xl font-bold text-foreground">{avgScore ?? 'N/A'}</div>
                    {avgScore && <div className="text-lg text-muted-foreground">%</div>}
                  </div>
                </motion.div>
                
                <motion.div variants={fadeIn} className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <div className="text-sm text-muted-foreground">Avg Grammar</div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-3xl font-bold text-foreground">{avgGrammar ?? 'N/A'}</div>
                    {avgGrammar && <div className="text-lg text-muted-foreground">%</div>}
                  </div>
                </motion.div>
                
                <motion.div variants={fadeIn} className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    <div className="text-sm text-muted-foreground">Avg Complexity</div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-3xl font-bold text-foreground">{avgComplexity ?? 'N/A'}</div>
                    {avgComplexity && <div className="text-lg text-muted-foreground">%</div>}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Class-Wide Performance Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          <ClassScoreProgressionChart data={metrics?.scoreProgression || []} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClassGrammarAccuracyChart data={metrics?.grammarTrends || []} />
            <ClassConversationComplexityChart data={metrics?.complexityTrends || []} />
          </div>
        </motion.div>

        {/* Student Roster & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <StudentTestScores teacherId={teacherId || ""} onDataUpdate={() => {}} />
        </motion.div>
      </div>
    </div>
  );
};

export default ClassMetrics;

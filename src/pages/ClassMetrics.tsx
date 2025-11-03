import { motion } from "framer-motion";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useTeacherClassMetrics } from "@/hooks/useTeacherClassMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { Users, TrendingUp } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import ClassScoreProgressionChart from "@/components/teacher/ClassScoreProgressionChart";
import ClassGrammarAccuracyChart from "@/components/teacher/ClassGrammarAccuracyChart";
import ClassConversationComplexityChart from "@/components/teacher/ClassConversationComplexityChart";
import ClassPronunciationAccuracyChart from "@/components/teacher/ClassPronunciationAccuracyChart";
import StudentTestScores from "@/components/profile/StudentTestScores";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 md:p-8">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToProfile")}
          </Button>
          
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <TrendingUp className="h-8 w-8 text-primary" />
                {t("classWideMetrics")}
              </CardTitle>
              {metrics && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {t("studentsAcrossClasses")
                      .replace("{count}", metrics.totalStudents.toString())
                      .replace("{classCount}", metrics.totalClasses.toString())}
                  </span>
                </div>
              )}
            </CardHeader>
          </Card>
        </motion.div>

        {/* Class-Wide Performance Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-6"
        >
          <ClassScoreProgressionChart data={metrics?.scoreProgression || []} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClassGrammarAccuracyChart data={metrics?.grammarTrends || []} />
            <ClassConversationComplexityChart data={metrics?.complexityTrends || []} />
          </div>
          
          <ClassPronunciationAccuracyChart data={metrics?.pronunciationTrends || []} />
        </motion.div>

        {/* Student Roster & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <StudentTestScores teacherId={teacherId || ""} onDataUpdate={() => {}} />
        </motion.div>
      </div>
    </div>
  );
};

export default ClassMetrics;

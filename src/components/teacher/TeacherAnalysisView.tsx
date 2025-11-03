import React from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap } from 'lucide-react';
import { useTeacherClassMetrics } from '@/hooks/useTeacherClassMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLocalization } from '@/context/LocalizationContext';
import ClassScoreProgressionChart from './ClassScoreProgressionChart';
import ClassGrammarAccuracyChart from './ClassGrammarAccuracyChart';
import ClassConversationComplexityChart from './ClassConversationComplexityChart';
import ClassPronunciationAccuracyChart from './ClassPronunciationAccuracyChart';
import StudentAnalysisView from '../student/StudentAnalysisView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherAnalysisView = () => {
  const { t } = useLocalization();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: classMetrics, isLoading } = useTeacherClassMetrics(user?.id);

  return (
    <div className="space-y-8">
      {/* Class-Wide Metrics Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <GraduationCap className="h-6 w-6 text-primary" />
              {t("classWideMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              {classMetrics && (
                <span>
                  {classMetrics.totalStudents} {t("students").toLowerCase()} {t("across").toLowerCase()} {classMetrics.totalClasses} {t("classes").toLowerCase()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Test Score Progression */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ClassScoreProgressionChart data={classMetrics?.scoreProgression || []} />
            </motion.div>

            {/* Grammar and Complexity Side by Side */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <ClassGrammarAccuracyChart data={classMetrics?.grammarTrends || []} />
              <ClassConversationComplexityChart data={classMetrics?.complexityTrends || []} />
            </motion.div>

            {/* Pronunciation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ClassPronunciationAccuracyChart data={classMetrics?.pronunciationTrends || []} />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Teacher's Personal Metrics Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{t("yourPersonalMetrics")}</CardTitle>
          </CardHeader>
        </Card>
        <StudentAnalysisView />
      </motion.div>
    </div>
  );
};

export default TeacherAnalysisView;

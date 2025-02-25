
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Calendar, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { Progress } from "@/components/ui/progress";

interface LearningGoalsProps {
  user: User | null;
  profileData: {
    learningGoal: string;
    targetLevel: string;
    targetDate: string;
    displayName: string;
  };
  setProfileData: (data: any) => void;
  avatarUrl: string | null;
}

interface LessonProgress {
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  lastActivity?: string;
  streakDays?: number;
}

const LearningGoals = ({ user, profileData }: LearningGoalsProps) => {
  const [estimatedWeeks, setEstimatedWeeks] = useState<number | null>(null);
  const [progressRate, setProgressRate] = useState<number | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    if (user) {
      calculateEstimatedTime();
      fetchLessonProgress();
    }
  }, [user, profileData.targetLevel]);

  const fetchLessonProgress = async () => {
    try {
      // In a real app, this would fetch from a lessons_progress table
      // For now, we'll simulate this with the certification_attempts data
      const { data: attempts } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      // Calculate simulated lesson progress based on certification attempts
      if (attempts && attempts.length > 0) {
        // Simulate progress based on test scores
        // In a real implementation, this would come from actual lesson data
        const totalLessons = 60; // Simulate 60 total lessons
        const completedLessons = Math.floor((attempts.length / 4) * 20); // Rough estimate
        
        setLessonProgress({
          totalLessons,
          completedLessons: Math.min(completedLessons, totalLessons),
          percentComplete: Math.min(Math.round((completedLessons / totalLessons) * 100), 100),
          lastActivity: attempts[0].completed_at,
          streakDays: Math.min(attempts.length * 2, 30) // Simulated streak
        });
      } else {
        setLessonProgress({
          totalLessons: 60,
          completedLessons: 0,
          percentComplete: 0
        });
      }
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  const calculateEstimatedTime = async () => {
    try {
      // Fetch user's certification attempts
      const { data: attempts } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: true });

      if (!attempts || attempts.length === 0) {
        setEstimatedWeeks(24); // Default estimation if no attempts
        return;
      }

      // Calculate average improvement rate
      const scores = attempts.map(attempt => attempt.score);
      const firstScore = scores[0];
      const lastScore = scores[scores.length - 1];
      const weeksBetween = Math.ceil(
        (new Date(attempts[attempts.length - 1].completed_at).getTime() - 
         new Date(attempts[0].completed_at).getTime()) / 
        (1000 * 60 * 60 * 24 * 7)
      ) || 1;

      const improvementRate = (lastScore - firstScore) / weeksBetween;
      setProgressRate(improvementRate);

      // Calculate current level score range
      const currentLevelScore = lastScore;
      const currentLevel = determineLevel(currentLevelScore);
      const targetLevel = profileData.targetLevel;

      // Estimate weeks needed based on level difference
      const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const currentLevelIndex = CEFR_LEVELS.indexOf(currentLevel);
      const targetLevelIndex = CEFR_LEVELS.indexOf(targetLevel);
      const levelDifference = targetLevelIndex - currentLevelIndex;

      // Assuming each level requires approximately 15-20 points improvement
      const pointsNeeded = levelDifference * 17;
      const estimatedWeeks = Math.ceil(pointsNeeded / (improvementRate || 0.5));
      
      setEstimatedWeeks(Math.max(estimatedWeeks, 4)); // Minimum 4 weeks
    } catch (error) {
      console.error('Error calculating estimated time:', error);
      setEstimatedWeeks(24); // Default fallback
    }
  };

  const getEstimatedDate = () => {
    if (!estimatedWeeks) return null;
    const date = new Date();
    date.setDate(date.getDate() + (estimatedWeeks * 7));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            Targeting CEFR Level: {profileData.targetLevel}
          </p>
          <p className="text-sm text-gray-600">
            {estimatedWeeks ? (
              <>
                Estimated achievement in{' '}
                <span className="font-semibold text-lingua-primary">
                  {estimatedWeeks} weeks
                </span>
                <br />
                (around {getEstimatedDate()})
              </>
            ) : (
              'Calculating estimation...'
            )}
          </p>
          {progressRate !== null && progressRate > 0 && (
            <p className="text-xs text-green-600">
              Your current learning pace: +{progressRate.toFixed(1)} points per week
            </p>
          )}
        </div>
        
        {lessonProgress && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-lingua-primary" />
                <h4 className="font-medium">Lesson Progress</h4>
              </div>
              <span className="text-sm font-semibold">
                {lessonProgress.completedLessons}/{lessonProgress.totalLessons}
              </span>
            </div>
            
            <Progress value={lessonProgress.percentComplete} />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{lessonProgress.percentComplete}% Complete</span>
              {lessonProgress.lastActivity && (
                <span>Last activity: {new Date(lessonProgress.lastActivity).toLocaleDateString()}</span>
              )}
            </div>
            
            {lessonProgress.streakDays && (
              <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                <Award className="h-4 w-4" />
                <span>{lessonProgress.streakDays} day streak! Keep it up!</span>
              </div>
            )}
          </div>
        )}

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Tips to reach your goal faster:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Practice consistently every day</li>
            <li>Complete all certification attempts</li>
            <li>Focus on areas where you score lowest</li>
            <li>Use AI conversation practice regularly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningGoals;

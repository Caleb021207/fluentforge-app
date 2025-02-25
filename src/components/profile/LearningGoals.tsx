
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";

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

const LearningGoals = ({ user, profileData }: LearningGoalsProps) => {
  const [estimatedWeeks, setEstimatedWeeks] = useState<number | null>(null);
  const [progressRate, setProgressRate] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      calculateEstimatedTime();
    }
  }, [user, profileData.targetLevel]);

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
          Level Achievement Timeline
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

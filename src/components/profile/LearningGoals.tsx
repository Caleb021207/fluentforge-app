
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Calendar, BookOpen, Award } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface LearningGoalsProps {
  user: User | null;
  profileData: {
    learningGoal: string;
    targetLevel: string;
    targetDate: string;
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
  const [estimatedWeeks] = useState<number>(24); // Default static value
  const [progressRate] = useState<number>(0.8); // Default static value
  const [lessonProgress] = useState<LessonProgress>({
    totalLessons: 60,
    completedLessons: 12,
    percentComplete: 20,
    lastActivity: new Date().toISOString(),
    streakDays: 5
  });

  const getEstimatedDate = () => {
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
            Estimated achievement in{' '}
            <span className="font-semibold text-lingua-primary">
              {estimatedWeeks} weeks
            </span>
            <br />
            (around {getEstimatedDate()})
          </p>
          <p className="text-xs text-green-600">
            Your current learning pace: +{progressRate.toFixed(1)} points per week
          </p>
        </div>
        
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

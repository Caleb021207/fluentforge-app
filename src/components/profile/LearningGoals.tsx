
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Calendar, BookOpen, Award, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const [estimatedWeeks, setEstimatedWeeks] = useState<number>(24);
  const [progressRate, setProgressRate] = useState<number>(0.8);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({
    totalLessons: 60,
    completedLessons: 0,
    percentComplete: 0,
    lastActivity: new Date().toISOString(),
    streakDays: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [certificationsCompleted, setCertificationsCompleted] = useState<{[key: string]: boolean}>({
    reading: false,
    writing: false,
    speaking: false,
    listening: false,
    vocabulary: false
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch certification attempts to calculate progress
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Track which certifications have been completed
      const completedCertifications = {
        reading: false,
        writing: false,
        speaking: false,
        listening: false,
        vocabulary: false
      };

      // Calculate completion based on certification attempts
      let completedLessons = 0;
      if (attempts && attempts.length > 0) {
        console.log("Retrieved certification attempts:", attempts);
        
        // Process certification attempts
        const uniqueTypes = new Set();
        attempts.forEach(attempt => {
          uniqueTypes.add(attempt.certification_type);
          
          // Mark certification as completed
          if (attempt.certification_type in completedCertifications) {
            completedCertifications[attempt.certification_type] = true;
          }
          
          // Special handling for speaking_listening which counts as two certifications
          if (attempt.certification_type === 'speaking_listening') {
            completedCertifications['speaking'] = true;
            completedCertifications['listening'] = true;
          }
        });
        
        // Each certification type counts as 3 lessons
        completedLessons = uniqueTypes.size * 3;
        
        // Add bonus for speaking_listening which counts double
        const hasSpeakingListening = attempts.some(a => a.certification_type === 'speaking_listening');
        if (hasSpeakingListening) {
          completedLessons += 3; // Add 3 more lessons for the combined test
        }

        // Calculate streak based on attempt dates
        const streakDays = calculateStreak(attempts);
        
        // Calculate progress rate based on attempts frequency
        const progressRate = calculateProgressRate(attempts);
        setProgressRate(progressRate);

        // Set estimated weeks based on progress and target level
        const estimatedWeeks = calculateEstimatedWeeks(progressRate, profileData.targetLevel);
        setEstimatedWeeks(estimatedWeeks);
      }

      // Update certification completion status
      setCertificationsCompleted(completedCertifications);

      // Update lesson progress state
      setLessonProgress({
        totalLessons: 60, // Default total lessons
        completedLessons: completedLessons,
        percentComplete: Math.min(100, Math.round((completedLessons / 60) * 100)),
        lastActivity: attempts && attempts.length > 0 ? attempts[0].completed_at : new Date().toISOString(),
        streakDays: calculateStreak(attempts)
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast({
        title: "Error",
        description: "Failed to load your learning progress data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      setIsRefreshing(true);
      fetchUserProgress().finally(() => setIsRefreshing(false));
    }
  };

  const calculateStreak = (attempts: any[] | null): number => {
    if (!attempts || attempts.length === 0) return 0;
    
    // Sort attempts by date
    const sortedDates = attempts.map(a => new Date(a.completed_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    // Check for activity in the last day
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);
    
    if (sortedDates[0] < oneDayAgo) return 0;
    
    // Count consecutive days with activity
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    currentDate.setDate(currentDate.getDate() - 1);
    
    for (let i = 1; i < sortedDates.length; i++) {
      // Convert to date strings for comparison (ignoring time)
      const dateStr = currentDate.toISOString().split('T')[0];
      const attemptDateStr = sortedDates[i].toISOString().split('T')[0];
      
      if (dateStr === attemptDateStr) {
        currentDate.setDate(currentDate.getDate() - 1);
        streak++;
      } else if (sortedDates[i] < currentDate) {
        // If we found an attempt before the expected day, continue checking
        currentDate = new Date(sortedDates[i]);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Streak is broken
        break;
      }
    }
    
    return streak;
  };

  const calculateProgressRate = (attempts: any[] | null): number => {
    if (!attempts || attempts.length <= 1) return 0.8; // Default rate
    
    // Calculate average points gained per week
    const firstAttempt = new Date(attempts[attempts.length - 1].completed_at);
    const lastAttempt = new Date(attempts[0].completed_at);
    const weeksDiff = Math.max(1, (lastAttempt.getTime() - firstAttempt.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Assuming each attempt gives approximately 5 points
    return Math.min(3, Math.max(0.5, (attempts.length * 5) / weeksDiff));
  };

  const calculateEstimatedWeeks = (rate: number, targetLevel: string): number => {
    // Map CEFR levels to estimated points needed
    const pointsNeeded: Record<string, number> = {
      'A1': 50,
      'A2': 100,
      'B1': 200,
      'B2': 350,
      'C1': 550,
      'C2': 800
    };
    
    // Get points needed for target level
    const points = pointsNeeded[targetLevel] || 350; // Default to B2
    
    // Calculate weeks based on progress rate
    return Math.ceil(points / (rate * 7)); // rate * 7 = weekly points
  };

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
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Learning Progress
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
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
          
          <Progress 
            value={lessonProgress.percentComplete}
            className="h-2" 
          />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{lessonProgress.percentComplete}% Complete</span>
            {lessonProgress.lastActivity && (
              <span>Last activity: {new Date(lessonProgress.lastActivity).toLocaleDateString()}</span>
            )}
          </div>
          
          {lessonProgress.streakDays && lessonProgress.streakDays > 0 && (
            <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
              <Award className="h-4 w-4" />
              <span>{lessonProgress.streakDays} day streak! Keep it up!</span>
            </div>
          )}
        </div>

        {/* Certification Progress */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-lingua-primary" />
            <h4 className="font-medium">Certification Status</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2 rounded ${certificationsCompleted.reading ? 'bg-green-100' : 'bg-gray-100'}`}>
              <span className="text-sm">Reading: </span>
              <span className={`text-sm font-medium ${certificationsCompleted.reading ? 'text-green-600' : 'text-gray-500'}`}>
                {certificationsCompleted.reading ? 'Completed' : 'Not taken'}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.writing ? 'bg-green-100' : 'bg-gray-100'}`}>
              <span className="text-sm">Writing: </span>
              <span className={`text-sm font-medium ${certificationsCompleted.writing ? 'text-green-600' : 'text-gray-500'}`}>
                {certificationsCompleted.writing ? 'Completed' : 'Not taken'}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.speaking ? 'bg-green-100' : 'bg-gray-100'}`}>
              <span className="text-sm">Speaking: </span>
              <span className={`text-sm font-medium ${certificationsCompleted.speaking ? 'text-green-600' : 'text-gray-500'}`}>
                {certificationsCompleted.speaking ? 'Completed' : 'Not taken'}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.listening ? 'bg-green-100' : 'bg-gray-100'}`}>
              <span className="text-sm">Listening: </span>
              <span className={`text-sm font-medium ${certificationsCompleted.listening ? 'text-green-600' : 'text-gray-500'}`}>
                {certificationsCompleted.listening ? 'Completed' : 'Not taken'}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.vocabulary ? 'bg-green-100' : 'bg-gray-100'}`}>
              <span className="text-sm">Vocabulary: </span>
              <span className={`text-sm font-medium ${certificationsCompleted.vocabulary ? 'text-green-600' : 'text-gray-500'}`}>
                {certificationsCompleted.vocabulary ? 'Completed' : 'Not taken'}
              </span>
            </div>
          </div>
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

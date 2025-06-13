import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Calendar, BookOpen, Award, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

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
    listening: false
  });
  const { toast } = useToast();
  const { currentLanguage } = useLocalization();

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const completedCertifications = {
        reading: false,
        writing: false,
        speaking: false,
        listening: false
      };

      let completedLessons = 0;
      if (attempts && attempts.length > 0) {
        console.log("Retrieved certification attempts:", attempts);
        
        const uniqueTypes = new Set();
        attempts.forEach(attempt => {
          if (!['reading', 'writing', 'speaking', 'listening'].includes(attempt.certification_type)) {
            return;
          }
          
          uniqueTypes.add(attempt.certification_type);
          
          if (attempt.certification_type in completedCertifications) {
            completedCertifications[attempt.certification_type] = true;
          }
        });
        
        completedLessons = uniqueTypes.size * 3;

        const streakDays = calculateStreak(attempts);
        
        const progressRate = calculateProgressRate(attempts);
        setProgressRate(progressRate);

        const estimatedWeeks = calculateEstimatedWeeks(progressRate, profileData.targetLevel);
        setEstimatedWeeks(estimatedWeeks);
      }

      setCertificationsCompleted(completedCertifications);

      setLessonProgress({
        totalLessons: 60,
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
    
    const sortedDates = attempts.map(a => new Date(a.completed_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);
    
    if (sortedDates[0] < oneDayAgo) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    currentDate.setDate(currentDate.getDate() - 1);
    
    for (let i = 1; i < sortedDates.length; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const attemptDateStr = sortedDates[i].toISOString().split('T')[0];
      
      if (dateStr === attemptDateStr) {
        currentDate.setDate(currentDate.getDate() - 1);
        streak++;
      } else if (sortedDates[i] < currentDate) {
        currentDate = new Date(sortedDates[i]);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateProgressRate = (attempts: any[] | null): number => {
    if (!attempts || attempts.length <= 1) return 0.8;
    
    const firstAttempt = new Date(attempts[attempts.length - 1].completed_at);
    const lastAttempt = new Date(attempts[0].completed_at);
    const weeksDiff = Math.max(1, (lastAttempt.getTime() - firstAttempt.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    return Math.min(3, Math.max(0.5, (attempts.length * 5) / weeksDiff));
  };

  const calculateEstimatedWeeks = (rate: number, targetLevel: string): number => {
    const pointsNeeded: Record<string, number> = {
      'A1': 50,
      'A2': 100,
      'B1': 200,
      'B2': 350,
      'C1': 550,
      'C2': 800
    };
    
    const points = pointsNeeded[targetLevel] || 350;
    
    return Math.ceil(points / (rate * 7));
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
            {currentLanguage === "spanish" ? "Progreso de Aprendizaje" : "Learning Progress"}
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">
              {currentLanguage === "spanish" ? "Actualizar" : "Refresh"}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            {currentLanguage === "spanish" ? "Objetivo Nivel CEFR: " : "Targeting CEFR Level: "}
            {profileData.targetLevel}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentLanguage === "spanish" ? "Logro estimado en " : "Estimated achievement in "}
            <span className="font-semibold text-primary">
              {estimatedWeeks} {currentLanguage === "spanish" ? "semanas" : "weeks"}
            </span>
            <br />
            ({currentLanguage === "spanish" ? "alrededor del " : "around "}{getEstimatedDate()})
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            {currentLanguage === "spanish" 
              ? "Tu ritmo de aprendizaje actual: +" 
              : "Your current learning pace: +"}
            {progressRate.toFixed(1)} 
            {currentLanguage === "spanish" ? " puntos por semana" : " points per week"}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-muted space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-medium">
                {currentLanguage === "spanish" ? "Progreso de Lecciones" : "Lesson Progress"}
              </h4>
            </div>
            <span className="text-sm font-semibold">
              {lessonProgress.completedLessons}/{lessonProgress.totalLessons}
            </span>
          </div>
          
          <Progress 
            value={lessonProgress.percentComplete}
            className="h-2" 
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {lessonProgress.percentComplete}% 
              {currentLanguage === "spanish" ? " Completado" : " Complete"}
            </span>
            {lessonProgress.lastActivity && (
              <span>
                {currentLanguage === "spanish" ? "Última actividad: " : "Last activity: "}
                {new Date(lessonProgress.lastActivity).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {lessonProgress.streakDays && lessonProgress.streakDays > 0 && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
              <Award className="h-4 w-4" />
              <span>
                {lessonProgress.streakDays} 
                {currentLanguage === "spanish" 
                  ? " días consecutivos! ¡Sigue así!" 
                  : " day streak! Keep it up!"}
              </span>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-muted space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <h4 className="font-medium">
              {currentLanguage === "spanish" ? "Estado de Certificación" : "Certification Status"}
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2 rounded ${certificationsCompleted.reading ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-secondary'}`}>
              <span className="text-sm">
                {currentLanguage === "spanish" ? "Lectura: " : "Reading: "}
              </span>
              <span className={`text-sm font-medium ${certificationsCompleted.reading ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {certificationsCompleted.reading 
                  ? (currentLanguage === "spanish" ? "Completado" : "Completed") 
                  : (currentLanguage === "spanish" ? "No realizado" : "Not taken")}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.writing ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-secondary'}`}>
              <span className="text-sm">
                {currentLanguage === "spanish" ? "Escritura: " : "Writing: "}
              </span>
              <span className={`text-sm font-medium ${certificationsCompleted.writing ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {certificationsCompleted.writing 
                  ? (currentLanguage === "spanish" ? "Completado" : "Completed") 
                  : (currentLanguage === "spanish" ? "No realizado" : "Not taken")}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.speaking ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-secondary'}`}>
              <span className="text-sm">
                {currentLanguage === "spanish" ? "Habla: " : "Speaking: "}
              </span>
              <span className={`text-sm font-medium ${certificationsCompleted.speaking ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {certificationsCompleted.speaking 
                  ? (currentLanguage === "spanish" ? "Completado" : "Completed") 
                  : (currentLanguage === "spanish" ? "No realizado" : "Not taken")}
              </span>
            </div>
            
            <div className={`p-2 rounded ${certificationsCompleted.listening ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-secondary'}`}>
              <span className="text-sm">
                {currentLanguage === "spanish" ? "Comprensión Auditiva: " : "Listening: "}
              </span>
              <span className={`text-sm font-medium ${certificationsCompleted.listening ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {certificationsCompleted.listening 
                  ? (currentLanguage === "spanish" ? "Completado" : "Completed") 
                  : (currentLanguage === "spanish" ? "No realizado" : "Not taken")}
              </span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-muted">
          <h4 className="font-medium mb-2">
            {currentLanguage === "spanish" 
              ? "Consejos para alcanzar tu meta más rápido:" 
              : "Tips to reach your goal faster:"}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              {currentLanguage === "spanish" 
                ? "Practica constantemente todos los días" 
                : "Practice consistently every day"}
            </li>
            <li>
              {currentLanguage === "spanish" 
                ? "Completa todos los intentos de certificación" 
                : "Complete all certification attempts"}
            </li>
            <li>
              {currentLanguage === "spanish" 
                ? "Enfócate en áreas donde obtengas las puntuaciones más bajas" 
                : "Focus on areas where you score lowest"}
            </li>
            <li>
              {currentLanguage === "spanish" 
                ? "Usa la práctica de conversación con IA regularmente" 
                : "Use AI conversation practice regularly"}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningGoals;

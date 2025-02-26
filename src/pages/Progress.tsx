
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProgressData {
  date: string;
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
}

const ProgressPage = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchProgressData(user.id);
      } else {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const fetchProgressData = async (userId: string) => {
    try {
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        const processedData = processAttemptsData(attempts);
        setProgressData(processedData);
        generateRecommendations(attempts);
      } else {
        toast({
          title: "No Progress Data",
          description: "Complete some certification attempts to see your progress!",
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processAttemptsData = (attempts: any[]): ProgressData[] => {
    const dataMap = new Map<string, ProgressData>();
    
    attempts.forEach(attempt => {
      const date = new Date(attempt.completed_at).toISOString().split('T')[0];
      const existing = dataMap.get(date) || {
        date,
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0,
      };

      existing[attempt.certification_type as keyof Omit<ProgressData, 'date'>] = attempt.score;
      dataMap.set(date, existing);
    });

    return Array.from(dataMap.values());
  };

  const generateRecommendations = (attempts: any[]) => {
    const latestScores: Record<string, number> = {};
    const skills = ['reading', 'writing', 'speaking', 'listening'];
    
    // Get the latest score for each skill
    skills.forEach(skill => {
      const skillAttempts = attempts.filter(a => a.certification_type === skill);
      if (skillAttempts.length > 0) {
        const latestAttempt = skillAttempts.reduce((latest: any, current: any) => {
          return new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest;
        });
        latestScores[skill] = latestAttempt.score;
      }
    });

    // Generate recommendations based on CEFR levels
    const newRecommendations = skills.map(skill => {
      const score = latestScores[skill] || 0;
      const level = determineLevel(score);
      const recommendation = getRecommendationsForLevel(skill, level);
      
      if (recommendation) {
        return {
          ...recommendation,
          currentLevel: level
        };
      }
      return null;
    }).filter(Boolean);

    setRecommendations(newRecommendations);
  };

  const handleSignIn = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please sign in to view your progress data and personalized recommendations.</p>
        <Button 
          onClick={handleSignIn} 
          className="bg-lingua-primary hover:bg-lingua-primary/90"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        Your Learning Progress
      </h1>

      {progressData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reading" stroke="#2563eb" name="Reading" />
                    <Line type="monotone" dataKey="writing" stroke="#16a34a" name="Writing" />
                    <Line type="monotone" dataKey="speaking" stroke="#dc2626" name="Speaking" />
                    <Line type="monotone" dataKey="listening" stroke="#9333ea" name="Listening" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.skill}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {rec.skill}
                    <span className="text-sm font-normal">Current Level: {rec.currentLevel}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-yellow-600">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.recommendations.map((recommendation: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg text-gray-600">Complete some certification attempts to see your progress!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;

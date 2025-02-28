import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { getRecommendationsForLevel } from "@/utils/cefrRecommendations";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProgressData {
  date: string;
  reading?: number;
  writing?: number;
  speaking?: number;
  listening?: number;
  vocabulary?: number;
}

interface CertificationAttempt {
  id: string;
  completed_at?: string;
  created_at?: string;
  score: number;
  certification_type: string;
}

interface ChartData {
  date: string;
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
  vocabulary?: number;
}

interface SkillScores {
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
  overall: number;
}

const ProgressPage = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProgressData = useCallback(async (userId: string) => {
    try {
      setIsRefreshing(true);
      
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        console.log("Retrieved certification attempts:", attempts);
        const processedData = processAttemptsByDate(attempts);
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
      setIsRefreshing(false);
    }
  }, [toast]);

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
    
    const channel = supabase
      .channel('public:certification_attempts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'certification_attempts' 
        }, 
        (payload) => {
          console.log('New certification attempt:', payload);
          if (user && payload.new && payload.new.user_id === user.id) {
            fetchProgressData(user.id);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProgressData]);

  const processAttemptsByDate = (attempts: CertificationAttempt[] | null): ChartData[] => {
    if (!attempts || attempts.length === 0) return [];

    console.log("Processing attempts for chart:", attempts);
    const dataMap = new Map<string, ChartData>();
    
    attempts.forEach(attempt => {
      if ((!attempt.completed_at && !attempt.created_at) || attempt.score === 0) {
        console.log(`Skipping attempt with invalid data:`, attempt);
        return;
      }
      
      const date = new Date(attempt.completed_at || attempt.created_at || '').toISOString().split('T')[0];
      const existing = dataMap.get(date) || {
        date,
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0,
        vocabulary: 0
      };
      
      const type = attempt.certification_type;
      
      if (type === 'fluency') {
        console.log(`Processing fluency attempt #${attempt.id} with score ${attempt.score}`);
        const speakingScore = existing.speaking as number;
        if (attempt.score > speakingScore) {
          existing.speaking = attempt.score;
        }
        const listeningScore = existing.listening as number;
        if (attempt.score > listeningScore) {
          existing.listening = attempt.score;
        }
      } 
      else if (type === 'reading' || type === 'writing' || type === 'speaking' || 
              type === 'listening' || type === 'vocabulary') {
        console.log(`Processing ${type} attempt #${attempt.id} with score ${attempt.score}`);
        
        const propertyName = type as keyof typeof existing;
        const currentScore = existing[propertyName] as number;
        
        if (attempt.score > currentScore) {
          existing[propertyName] = attempt.score;
        }
      } else {
        console.log(`Ignoring unknown certification type: ${type}`);
      }
      
      dataMap.set(date, existing);
    });
    
    const result = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    console.log("Processed chart data:", result);
    return result;
  };

  const calculateSkillScores = (attempts: CertificationAttempt[] | null): SkillScores => {
    if (!attempts || attempts.length === 0) {
      return { reading: 0, writing: 0, speaking: 0, listening: 0, overall: 0 };
    }
    
    const skills = ['reading', 'writing', 'speaking', 'listening'];
    const scores: Record<string, number> = {
      reading: 0,
      writing: 0,
      speaking: 0,
      listening: 0
    };
    
    skills.forEach(skill => {
      const directAttempts = attempts.filter(a => 
        a.certification_type === skill && a.score > 0
      );
      
      const fluencyAttempts = (skill === 'speaking' || skill === 'listening') 
        ? attempts.filter(a => a.certification_type === 'fluency' && a.score > 0)
        : [];
      
      const skillAttempts = [...directAttempts, ...fluencyAttempts];
      
      if (skillAttempts.length > 0) {
        scores[skill] = Math.max(...skillAttempts.map(a => a.score));
      }
    });
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const overall = Math.round(totalScore / skills.length);
    
    return {
      reading: scores.reading,
      writing: scores.writing, 
      speaking: scores.speaking,
      listening: scores.listening,
      overall
    };
  };

  const generateRecommendations = (attempts: CertificationAttempt[]) => {
    if (!attempts || attempts.length === 0) return;
    
    console.log("Generating recommendations from attempts:", attempts);
    const skills = ['reading', 'writing', 'speaking', 'listening', 'vocabulary'];
    const highestScores: Record<string, number> = {};
    
    skills.forEach(skill => {
      const directAttempts = attempts.filter(a => 
        a.certification_type === skill && a.score > 0
      );
      
      const fluencyAttempts = (skill === 'speaking' || skill === 'listening') 
        ? attempts.filter(a => a.certification_type === 'fluency' && a.score > 0)
        : [];
      
      const skillAttempts = [...directAttempts, ...fluencyAttempts];
      
      if (skillAttempts.length > 0) {
        highestScores[skill] = Math.max(...skillAttempts.map(a => a.score));
      } else {
        highestScores[skill] = 0;
      }
    });

    console.log("Highest scores for recommendations:", highestScores);
    
    const newRecommendations = skills.map(skill => {
      const score = highestScores[skill] || 0;
      const level = determineLevel(score);
      const recommendation = getRecommendationsForLevel(skill, level);
      
      if (recommendation) {
        return {
          ...recommendation,
          currentLevel: level,
          lastScore: score
        };
      }
      return null;
    }).filter(Boolean);

    setRecommendations(newRecommendations);
  };

  const handleRefresh = () => {
    if (user) {
      fetchProgressData(user.id);
    }
  };

  const handleSignIn = () => {
    navigate("/");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any) => (
            entry.value !== undefined && entry.value > 0 && (
              <p key={entry.name} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}%`}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">
          Your Learning Progress
        </h1>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="reading" 
                      stroke="#2563eb" 
                      name="Reading" 
                      connectNulls={true} 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="writing" 
                      stroke="#16a34a" 
                      name="Writing" 
                      connectNulls={true} 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="speaking" 
                      stroke="#dc2626" 
                      name="Speaking" 
                      connectNulls={true} 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="listening" 
                      stroke="#9333ea" 
                      name="Listening" 
                      connectNulls={true} 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="vocabulary" 
                      stroke="#ea580c" 
                      name="Vocabulary" 
                      connectNulls={true} 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.skill} className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{rec.skill}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-normal">Current Level: {rec.currentLevel}</span>
                      <span className="text-sm text-gray-500">Last Score: {rec.lastScore}%</span>
                    </div>
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
        <Card className="border border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">Complete certification tests to see your progress!</p>
            <Button onClick={() => navigate('/certificates')} className="bg-lingua-primary">
              Take a Certification Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;

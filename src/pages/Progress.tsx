
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ProgressData {
  date: string;
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
}

interface SkillRecommendation {
  skill: string;
  currentLevel: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const ProgressPage = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your progress.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Fetch certification attempts
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      // Process data for the chart
      const processedData = processAttemptsData(attempts);
      setProgressData(processedData);

      // Get AI recommendations
      await getAIRecommendations(attempts);
      
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data",
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

  const getAIRecommendations = async (attempts: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-progress', {
        body: { attempts }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate learning recommendations",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        Your Learning Progress
      </h1>

      {/* Progress Chart */}
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

      {/* Skill-specific Recommendations */}
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
                    {rec.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-yellow-600">Areas for Improvement</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{weakness}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressPage;

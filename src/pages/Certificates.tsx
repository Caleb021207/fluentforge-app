import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ReadingCertification from "@/components/certifications/ReadingCertification";

// Define the type for our certification attempts
type CertificationAttempt = {
  id: string;
  certification_type: 'reading' | 'writing' | 'speaking' | 'listening';
  score: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  completed_at: string;
};

const Certificates = () => {
  // Fetch certification attempts
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['certification-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as CertificationAttempt[];
    },
  });

  // Calculate most recent scores for each type
  const recentScores = attempts?.reduce((acc, attempt) => {
    if (!acc[attempt.certification_type] || 
        new Date(attempt.completed_at) > new Date(acc[attempt.certification_type].completed_at)) {
      acc[attempt.certification_type] = attempt;
    }
    return acc;
  }, {} as Record<string, CertificationAttempt>);

  // Prepare data for the chart
  const chartData = attempts?.map(attempt => ({
    date: format(new Date(attempt.completed_at), 'MMM d'),
    score: attempt.score,
    type: attempt.certification_type
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Certification Progress</h1>
      
      {/* Reading Certification Test */}
      <ReadingCertification />
      
      {/* Recent Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['reading', 'writing', 'speaking', 'listening'].map((type) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="capitalize">{type}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScores?.[type] ? (
                <>
                  <Progress value={recentScores[type].score} className="mb-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Score: {recentScores[type].score}%</span>
                    <span>Level: {recentScores[type].level}</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No attempts yet</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No certification history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attempt History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {attempts && attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium capitalize">{attempt.certification_type}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(attempt.completed_at), 'PPP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{attempt.score}%</div>
                      <div className="text-sm text-gray-600">Level {attempt.level}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No attempts recorded yet
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Certificates;


import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import WritingCertification from "@/components/certifications/WritingCertification";
import SpeakingListeningCertification from "@/components/certifications/SpeakingListeningCertification";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";

type CertificationAttempt = {
  id: string;
  certification_type: 'reading' | 'writing' | 'speaking' | 'listening';
  score: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  completed_at: string;
};

const Certificates = () => {
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['certification-attempts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as CertificationAttempt[];
    },
  });

  const recentScores = attempts?.reduce((acc, attempt) => {
    if (!acc[attempt.certification_type] || 
        new Date(attempt.completed_at) > new Date(acc[attempt.certification_type].completed_at)) {
      acc[attempt.certification_type] = attempt;
    }
    return acc;
  }, {} as Record<string, CertificationAttempt>);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Certification Progress</h1>
      
      <ReadingCertification />
      
      <WritingCertification />
      
      <SpeakingListeningCertification />
      
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
                    <span>Level: {determineLevel(recentScores[type].score)}</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No attempts yet</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
                      <div className="text-sm text-gray-600">Level {determineLevel(attempt.score)}</div>
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


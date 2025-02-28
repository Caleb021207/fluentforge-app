
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import WritingCertification from "@/components/certifications/WritingCertification";
import SpeakingListeningCertification from "@/components/certifications/SpeakingListeningCertification";
import TranscriptDisplay from "@/components/certifications/TranscriptDisplay";
import { determineLevel, getLevelDescription } from "@/components/certifications/utils/scoreUtils";
import { useEffect, useState } from "react";
import { CertificationAttempt } from "@/types/supabase";
import { FileText, Award, Eye } from "lucide-react";

const rubricData = [
  { level: 'C2', range: '84-100%' },
  { level: 'C1', range: '67-83%' },
  { level: 'B2', range: '50-66%' },
  { level: 'B1', range: '33-49%' },
  { level: 'A2', range: '17-32%' },
  { level: 'A1', range: '0-16%' },
];

const Certificates = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();
  }, []);

  const { data: attempts, isLoading, refetch } = useQuery({
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

  const highestScores = attempts?.reduce((acc, attempt) => {
    if (!acc[attempt.certification_type] || 
        attempt.score > acc[attempt.certification_type].score) {
      acc[attempt.certification_type] = attempt;
    }
    return acc;
  }, {} as Record<string, CertificationAttempt>);

  const calculateCompositeScore = () => {
    if (!highestScores) return null;

    const scoreTypes = ['reading', 'writing', 'speaking', 'listening'];
    const scores = scoreTypes.map(type => highestScores[type]?.score || 0);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / scoreTypes.length);

    return {
      score: averageScore,
      level: determineLevel(averageScore)
    };
  };

  const compositeScore = calculateCompositeScore();

  const handleViewAttempt = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
  };

  const handleBackFromTranscript = () => {
    setSelectedAttemptId(null);
  };

  const formatCertificationType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return <div>Loading certification data...</div>;
  }

  // If a transcript is selected, show the transcript display
  if (selectedAttemptId) {
    return (
      <TranscriptDisplay 
        attemptId={selectedAttemptId} 
        onBack={handleBackFromTranscript} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Certification Progress</h1>
      
      {compositeScore && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Overall Language Proficiency Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-blue-900">
                CEFR Level {compositeScore.level}
              </h2>
              <p className="text-gray-600">
                Overall Score: {compositeScore.score}%
              </p>
              <div className="p-4 border rounded-lg bg-white">
                <p className="text-sm text-gray-600">
                  This certificate represents your current language proficiency level based on your highest test scores across all four skills: reading, writing, speaking, and listening.
                </p>
              </div>
            </div>
            <Progress value={compositeScore.score} className="h-2" />
            
            {/* CEFR Level Rubric */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">CEFR Level Rubric</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {rubricData.map((item) => (
                  <div key={item.level} className="p-2 bg-white rounded border text-center">
                    <div className="font-medium">Level {item.level}</div>
                    <div className="text-sm text-gray-600">{item.range}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Descriptions */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">CEFR Level Descriptions</h3>
              <div className="grid gap-4">
                {rubricData.map((item) => (
                  <div key={item.level} className="p-4 bg-white rounded border">
                    <h4 className="font-medium mb-2">Level {item.level}</h4>
                    <p className="text-sm text-gray-600">{getLevelDescription(item.level)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
              {highestScores?.[type] ? (
                <>
                  <Progress value={highestScores[type].score} className="mb-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Score: {highestScores[type].score}%</span>
                    <span>Level: {determineLevel(highestScores[type].score)}</span>
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
          <CardTitle>Recent Certification Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {attempts && attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="mb-2 md:mb-0">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium capitalize">{formatCertificationType(attempt.certification_type)}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(attempt.completed_at || ''), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-2">
                        <div className="font-medium">{attempt.score}%</div>
                        <div className="text-sm text-gray-600">Level {determineLevel(attempt.score)}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 opacity-50 cursor-not-allowed"
                        disabled
                        title="Transcripts are currently unavailable"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="hidden md:inline">View</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-10">
                  <p>No certification attempts recorded yet</p>
                  <p className="text-sm mt-2">Take a test to see your results here</p>
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

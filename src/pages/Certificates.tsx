
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CertificationAttempt } from "@/types/supabase";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import WritingCertification from "@/components/certifications/WritingCertification";
import OverallCertificate from "@/components/certificates/OverallCertificate";
import ScoreCards from "@/components/certificates/ScoreCards";
import CertificationAttemptsList from "@/components/certificates/CertificationAttemptsList";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";

const Certificates = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    // Only include reading and writing scores now
    const scoreTypes = ['reading', 'writing'];
    const scores = scoreTypes.map(type => highestScores[type]?.score || 0);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / scoreTypes.length);

    return {
      score: averageScore,
      level: determineLevel(averageScore)
    };
  };

  const compositeScore = calculateCompositeScore();

  if (isLoading) {
    return <div>Loading certification data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Certification Progress</h1>
      
      <OverallCertificate compositeScore={compositeScore} />
      
      <ReadingCertification />
      
      <WritingCertification />
      
      <ScoreCards highestScores={highestScores} />

      <CertificationAttemptsList 
        attempts={attempts} 
        hasTranscript={{}}
        onViewAttempt={() => {}}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Certificates;

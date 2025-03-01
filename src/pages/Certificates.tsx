import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CertificationAttempt } from "@/types/supabase";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import WritingCertification from "@/components/certifications/WritingCertification";
import OverallCertificate from "@/components/certificates/OverallCertificate";
import ScoreCards from "@/components/certificates/ScoreCards";
import CertificationAttemptsList from "@/components/certificates/CertificationAttemptsList";
import { determineLevel, ensureValidScore } from "@/components/certifications/utils/scoreUtils";
import ConversationalFluency from "@/components/certificates/ConversationalFluencyTest";
import { useToast } from "@/hooks/use-toast";

const Certificates = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return [];
        }

        const { data, error } = await supabase
          .from('certification_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) {
          console.error("Error fetching certification attempts:", error);
          toast({
            title: "Error fetching certification data",
            description: error.message,
            variant: "destructive"
          });
          throw error;
        }
        
        console.log("Fetched certification attempts:", data);
        return data as CertificationAttempt[];
      } catch (error) {
        console.error("Error in query function:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  const normalizeAttempts = (rawAttempts: CertificationAttempt[] | undefined) => {
    if (!rawAttempts) return [];
    
    const validAttempts = rawAttempts.filter(attempt => {
      return attempt.completed_at != null && attempt.score >= 0;
    });
    
    return validAttempts;
  };

  const normalizedAttempts = normalizeAttempts(attempts);
  
  const highestScores = normalizedAttempts.reduce((acc, attempt) => {
    const type = attempt.certification_type;
    const currentScore = ensureValidScore(attempt.score);
    
    if (attempt.completed_at && (!acc[type] || currentScore > ensureValidScore(acc[type].score))) {
      acc[type] = attempt;
    }
    return acc;
  }, {} as Record<string, CertificationAttempt>);

  if (normalizedAttempts) {
    normalizedAttempts.forEach(attempt => {
      if (attempt.score <= 0) return;
      
      if (attempt.certification_type === "speaking" && (!highestScores["speaking"] || attempt.score > highestScores["speaking"].score)) {
        highestScores["speaking"] = attempt;
      }
      
      if (attempt.certification_type === "listening" && (!highestScores["listening"] || attempt.score > highestScores["listening"].score)) {
        highestScores["listening"] = attempt;
      }
    });
  }

  const calculateCompositeScore = () => {
    if (!highestScores) return null;

    const scoreTypes = ['reading', 'writing', 'speaking', 'listening'];
    const scores = scoreTypes.map(type => {
      const score = highestScores[type]?.score;
      return typeof score === 'number' ? score : 0;
    });
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

    return {
      score: averageScore,
      level: determineLevel(averageScore)
    };
  };

  const compositeScore = calculateCompositeScore();

  const [hasTranscript, setHasTranscript] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!attempts || attempts.length === 0) return;
      
      const transcriptMap: Record<string, boolean> = {};
      
      for (const attempt of attempts) {
        if (attempt.certification_type === 'speaking' || 
            attempt.certification_type === 'listening' || 
            attempt.certification_type === 'fluency') {
          try {
            const { data, error } = await supabase
              .from('certification_transcripts')
              .select('id')
              .eq('attempt_id', attempt.id)
              .maybeSingle();
              
            if (error) {
              if (!error.message.includes("permission denied for table users")) {
                console.error("Error checking transcript for attempt", attempt.id, error);
              }
            }
            
            transcriptMap[attempt.id] = !!data;
          } catch (err) {
            console.error("Error in fetchTranscripts for attempt", attempt.id, err);
          }
        }
      }
      
      console.log("Transcript map:", transcriptMap);
      setHasTranscript(transcriptMap);
    };
    
    fetchTranscripts();
  }, [attempts]);

  const handleViewAttempt = async (attemptId: string) => {
    console.log("View attempt:", attemptId);
    toast({
      title: "Viewing details",
      description: "This feature will be implemented in a future update.",
    });
  };

  useEffect(() => {
    const refreshAttempts = () => {
      console.log("Refreshing certification attempts...");
      refetch();
    };
    
    window.addEventListener('fluency-test-completed', refreshAttempts);
    
    refreshAttempts();
    
    setTimeout(refreshAttempts, 500);
    setTimeout(refreshAttempts, 1500);
    setTimeout(refreshAttempts, 3000);
    
    return () => {
      window.removeEventListener('fluency-test-completed', refreshAttempts);
    };
  }, [refetch]);

  if (isLoading) {
    return <div>Loading certification data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Certification Progress</h1>
      
      <OverallCertificate compositeScore={compositeScore} />
      
      <ReadingCertification />
      
      <WritingCertification />
      
      <ConversationalFluency onTestComplete={() => {
        console.log("Test completed, refreshing data...");
        refetch();
        setTimeout(() => refetch(), 500);
        setTimeout(() => refetch(), 1500);
        setTimeout(() => refetch(), 3000);
      }} />
      
      <ScoreCards highestScores={highestScores} />

      <CertificationAttemptsList 
        attempts={normalizedAttempts} 
        hasTranscript={hasTranscript}
        onViewAttempt={handleViewAttempt}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Certificates;

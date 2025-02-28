
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
import ConversationalFluencyTest from "@/components/certificates/ConversationalFluencyTest";
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

  // This is a more thorough normalization of the fluency tests
  const normalizeAttempts = (rawAttempts: CertificationAttempt[] | undefined) => {
    if (!rawAttempts) return [];
    
    // First, remove any fluency attempts with a score of 0
    const filteredAttempts = rawAttempts.filter(attempt => {
      if (attempt.certification_type === "fluency") {
        return attempt.score > 0;
      }
      return true;
    });
    
    return filteredAttempts;
  };

  const normalizedAttempts = normalizeAttempts(attempts);
  
  // Process highest scores after normalizing types
  const highestScores = normalizedAttempts.reduce((acc, attempt) => {
    const type = attempt.certification_type;
    
    if (!acc[type] || attempt.score > acc[type].score) {
      acc[type] = attempt;
    }
    return acc;
  }, {} as Record<string, CertificationAttempt>);

  const calculateCompositeScore = () => {
    if (!highestScores) return null;

    // Include reading, writing, speaking and listening scores
    const scoreTypes = ['reading', 'writing', 'speaking', 'listening'];
    const scores = scoreTypes.map(type => {
      const score = highestScores[type]?.score;
      // Make sure we're returning a number and not undefined or null
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

  // Create a map of attempt IDs that have transcript data
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
              // Don't log errors about permission denied for table users
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
    // Navigate to transcript view or display detailed results
    console.log("View attempt:", attemptId);
    toast({
      title: "Viewing details",
      description: "This feature will be implemented in a future update.",
    });
  };

  // Auto-refresh attempts when component mounts or after a test
  useEffect(() => {
    const refreshAttempts = () => {
      console.log("Refreshing certification attempts...");
      refetch();
    };
    
    // Set up a listener for the ConversationalFluencyTest completion
    window.addEventListener('fluency-test-completed', refreshAttempts);
    
    // Initial fetch
    refreshAttempts();
    
    // Force multiple refreshes at different intervals to ensure we have the latest data
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
      
      <ConversationalFluencyTest onTestComplete={() => {
        console.log("Test completed, refreshing data...");
        // Multiple refreshes to ensure data is loaded
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

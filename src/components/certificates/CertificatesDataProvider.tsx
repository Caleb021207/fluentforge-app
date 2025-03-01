
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CertificationAttempt } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { fetchTranscripts, normalizeAttempts, calculateHighestScores, calculateCompositeScore } from "./utils/certificateUtils";

interface CertificatesDataProviderProps {
  children: (props: {
    attempts: CertificationAttempt[];
    normalizedAttempts: CertificationAttempt[];
    highestScores: Record<string, CertificationAttempt>;
    compositeScore: { score: number; level: string } | null;
    hasTranscript: Record<string, boolean>;
    isLoading: boolean;
    refetch: () => void;
    handleViewAttempt: (attemptId: string) => void;
  }) => React.ReactNode;
}

const CertificatesDataProvider = ({ children }: CertificatesDataProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasTranscript, setHasTranscript] = useState<Record<string, boolean>>({});
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

  const normalizedAttempts = normalizeAttempts(attempts);
  const highestScores = calculateHighestScores(normalizedAttempts);
  const compositeScore = calculateCompositeScore(highestScores);

  useEffect(() => {
    const loadTranscripts = async () => {
      const transcriptMap = await fetchTranscripts(attempts, supabase);
      setHasTranscript(transcriptMap);
    };
    
    loadTranscripts();
  }, [attempts]);

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

  const handleViewAttempt = async (attemptId: string) => {
    console.log("View attempt:", attemptId);
    toast({
      title: "Viewing details",
      description: "This feature will be implemented in a future update.",
    });
  };

  return (
    <>
      {children({
        attempts: attempts || [],
        normalizedAttempts,
        highestScores,
        compositeScore,
        hasTranscript,
        isLoading,
        refetch,
        handleViewAttempt
      })}
    </>
  );
};

export default CertificatesDataProvider;

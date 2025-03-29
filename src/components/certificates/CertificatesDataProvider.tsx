
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CertificationAttempt } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { fetchTranscripts, normalizeAttempts, calculateHighestScores, calculateCompositeScore } from "./utils/certificateUtils";
import { useLocalization } from "@/context/LocalizationContext";

interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface CertificatesDataProviderProps {
  children: (props: {
    attempts: CertificationAttempt[];
    normalizedAttempts: CertificationAttempt[];
    highestScores: Record<string, CertificationAttempt>;
    compositeScore: { score: number; level: string } | null;
    hasTranscript: Record<string, boolean>;
    isLoading: boolean;
    languagePairs: LanguagePair[];
    selectedPair: LanguagePair | null;
    onSelectLanguagePair: (pair: LanguagePair) => void;
    refetch: () => void;
    handleViewAttempt: (attemptId: string) => void;
  }) => React.ReactNode;
}

const getAvailableLanguagePairs = (attempts: CertificationAttempt[]): LanguagePair[] => {
  const pairs = new Map<string, LanguagePair>();
  
  attempts.forEach(attempt => {
    if (attempt.source_language && attempt.target_language) {
      const key = `${attempt.source_language}-${attempt.target_language}`;
      if (!pairs.has(key)) {
        pairs.set(key, {
          sourceLanguage: attempt.source_language,
          targetLanguage: attempt.target_language
        });
      }
    }
  });
  
  return Array.from(pairs.values());
};

const CertificatesDataProvider = ({ children }: CertificatesDataProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasTranscript, setHasTranscript] = useState<Record<string, boolean>>({});
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);
  const [selectedPair, setSelectedPair] = useState<LanguagePair | null>(null);
  const { toast } = useToast();
  const { currentLanguage } = useLocalization();

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
        
        // Update language pairs
        if (data && data.length > 0) {
          const pairs = getAvailableLanguagePairs(data);
          setLanguagePairs(pairs);
          
          // Set default pair if none selected yet
          if (pairs.length > 0 && !selectedPair) {
            // Try to find a pair matching current UI language
            const uiLanguagePair = pairs.find(pair => 
              pair.sourceLanguage === currentLanguage || 
              pair.targetLanguage === currentLanguage
            );
            
            setSelectedPair(uiLanguagePair || pairs[0]);
          }
        }
        
        return data as CertificationAttempt[];
      } catch (error) {
        console.error("Error in query function:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  // Filter attempts by selected language pair
  const filteredAttempts = attempts && selectedPair
    ? attempts.filter(attempt => 
        attempt.source_language === selectedPair.sourceLanguage && 
        attempt.target_language === selectedPair.targetLanguage)
    : attempts || [];

  const normalizedAttempts = normalizeAttempts(filteredAttempts);
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

  const handleSelectLanguagePair = (pair: LanguagePair) => {
    setSelectedPair(pair);
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
        languagePairs,
        selectedPair,
        onSelectLanguagePair: handleSelectLanguagePair,
        refetch,
        handleViewAttempt
      })}
    </>
  );
};

export default CertificatesDataProvider;

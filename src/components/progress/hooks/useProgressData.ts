
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { CertificationAttempt } from "@/types/supabase";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useLocalization } from "@/context/LocalizationContext";
import { processAttemptsByDate, generateRecommendations, normalizeAttempts, LanguagePair } from "../ProgressDataProcessor";

export const useProgressData = (user: User) => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawAttempts, setRawAttempts] = useState<CertificationAttempt[]>([]);
  const [normalizedAttempts, setNormalizedAttempts] = useState<CertificationAttempt[]>([]);
  const [hasTranscript, setHasTranscript] = useState<Record<string, boolean>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);
  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(null);
  const [showFixButton, setShowFixButton] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { toast } = useToast();
  const { isOffline, isOnline } = useConnectionStatus();
  const { t } = useLocalization();

  const getSelectedLanguagePair = useCallback((): LanguagePair | undefined => {
    if (!selectedPairKey) return undefined;
    const [sourceLanguage, targetLanguage] = selectedPairKey.split('-');
    return { sourceLanguage, targetLanguage };
  }, [selectedPairKey]);

  const checkForIncompleteLanguagePairs = useCallback((attempts: CertificationAttempt[]) => {
    if (!attempts || attempts.length === 0) return false;
    
    const incomplete = attempts.some(attempt => 
      !attempt.source_language || !attempt.target_language
    );
    
    setShowFixButton(incomplete);
    return incomplete;
  }, []);

  const fetchTranscripts = useCallback(async () => {
    if (!rawAttempts || rawAttempts.length === 0 || isOffline) return;
    
    const transcriptMap: Record<string, boolean> = {};
    
    for (const attempt of rawAttempts) {
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
  }, [rawAttempts, isOffline]);

  const fetchProgressData = useCallback(async (userId: string) => {
    if (isOffline) {
      setFetchError(t("offlineDataMayNotBeUpToDate"));
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        
        if (error.message.includes("Failed to fetch")) {
          setFetchError(t("networkConnectionIssue"));
        } else {
          setFetchError(t("problemLoadingProgressData"));
        }
        return; // Exit early
      }

      setFetchError(null);

      if (attempts && attempts.length > 0) {
        console.log("Retrieved certification attempts:", attempts);
        
        // Cast the attempt data to include our expected properties
        const formattedAttempts = attempts.map(attempt => {
          // Handle the case where source_language or target_language might be missing
          // in the database by providing default values
          return {
            ...attempt,
            source_language: attempt.source_language || 'english',
            target_language: attempt.target_language || 'spanish'
          } as CertificationAttempt;
        });
        
        setRawAttempts(formattedAttempts);
        
        checkForIncompleteLanguagePairs(formattedAttempts);
        
        const pairs = getAvailableLanguagePairs(formattedAttempts);
        setLanguagePairs(pairs);
        
        if (pairs.length > 0 && !selectedPairKey) {
          const firstPair = pairs[0];
          setSelectedPairKey(`${firstPair.sourceLanguage}-${firstPair.targetLanguage}`);
        }
        
        const selectedPair = getSelectedLanguagePair();
        
        const processedData = processAttemptsByDate(formattedAttempts, selectedPair);
        setProgressData(processedData);
        
        const recommendations = generateRecommendations(formattedAttempts, selectedPair);
        setRecommendations(recommendations);
        
        const normalized = normalizeAttempts(formattedAttempts, selectedPair);
        setNormalizedAttempts(normalized);
      } else {
        setRawAttempts([]);
        setProgressData([]);
        setRecommendations([]);
        setNormalizedAttempts([]);
        
        toast({
          title: t("noProgressData"),
          description: t("completeTestsToSeeProgress"),
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setFetchError(t("networkConnectionIssue"));
      } else {
        setFetchError(t("failedToLoadProgressData"));
        
        toast({
          title: t("error"),
          description: t("failedToLoadProgressData"),
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [toast, isOffline, t, selectedPairKey, getSelectedLanguagePair, checkForIncompleteLanguagePairs]);

  const fixCertificationLanguages = async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      
      const { data: incompleteAttempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .or('source_language.is.null,target_language.is.null');
        
      if (error) {
        throw error;
      }
      
      if (!incompleteAttempts || incompleteAttempts.length === 0) {
        toast({
          title: t("noDataToFix"),
          description: t("allCertificationsHaveLanguagePairs"),
        });
        setShowFixButton(false);
        return;
      }
      
      for (const attempt of incompleteAttempts) {
        const { error: updateError } = await supabase
          .from('certification_attempts')
          .update({
            source_language: 'english',
            target_language: 'spanish'
          })
          .eq('id', attempt.id);
          
        if (updateError) {
          console.error(`Error updating attempt ${attempt.id}:`, updateError);
        }
      }
      
      toast({
        title: t("dataFixed"),
        description: t("refreshingData"),
      });
      
      await fetchProgressData(user.id);
      
      setShowFixButton(false);
    } catch (error) {
      console.error('Error fixing certification languages:', error);
      toast({
        title: t("error"),
        description: t("errorFixingData"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Effect to fetch data when user or online status changes
  useEffect(() => {
    if (user && isOnline) {
      fetchProgressData(user.id);
    }
    
    if (isOnline) {
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
    }
    
    return () => {};
  }, [fetchProgressData, user, isOnline]);

  // Effect to process data when language pair changes
  useEffect(() => {
    if (rawAttempts.length > 0) {
      const selectedPair = getSelectedLanguagePair();
      
      const processedData = processAttemptsByDate(rawAttempts, selectedPair);
      setProgressData(processedData);
      
      const recommendations = generateRecommendations(rawAttempts, selectedPair);
      setRecommendations(recommendations);
      
      const normalized = normalizeAttempts(rawAttempts, selectedPair);
      setNormalizedAttempts(normalized);
    }
  }, [selectedPairKey, rawAttempts, getSelectedLanguagePair]);

  // Effect to retry fetching data after coming online
  useEffect(() => {
    if (isOnline && user && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log("Retrying data fetch after coming online");
        fetchProgressData(user.id);
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, user, fetchProgressData, retryCount]);

  // Effect to fetch transcripts when attempts change
  useEffect(() => {
    if (isOnline) {
      fetchTranscripts();
    }
  }, [rawAttempts, fetchTranscripts, isOnline]);

  const handleLanguagePairChange = (pairKey: string) => {
    setSelectedPairKey(pairKey);
  };

  return {
    progressData,
    recommendations,
    isRefreshing,
    normalizedAttempts,
    hasTranscript,
    fetchError,
    languagePairs,
    selectedPairKey,
    showFixButton,
    handleLanguagePairChange,
    fixCertificationLanguages,
  };
};

// Helper function to get available language pairs
export const getAvailableLanguagePairs = (attempts: CertificationAttempt[]): LanguagePair[] => {
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

// Helper function to get language name
export const getLanguageName = (code: string): string => {
  switch(code) {
    case 'english': return 'English';
    case 'spanish': return 'Spanish';
    case 'portuguese': return 'Portuguese';
    default: return code.charAt(0).toUpperCase() + code.slice(1);
  }
};

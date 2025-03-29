
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { CertificationAttempt } from "@/types/supabase";
import ProgressPageHeader from "./ProgressPageHeader";
import ProgressChart from "./ProgressChart";
import RecommendationCard from "./RecommendationCard";
import RecentAttemptsCard from "./RecentAttemptsCard";
import NoProgressCard from "./NoProgressCard";
import { processAttemptsByDate, generateRecommendations, normalizeAttempts, LanguagePair } from "./ProgressDataProcessor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useLocalization } from "@/context/LocalizationContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthenticatedProgressProps {
  user: User;
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

const getLanguageName = (code: string): string => {
  switch(code) {
    case 'english': return 'English';
    case 'spanish': return 'Spanish';
    case 'portuguese': return 'Portuguese';
    default: return code.charAt(0).toUpperCase() + code.slice(1);
  }
};

const AuthenticatedProgress = ({ user }: AuthenticatedProgressProps) => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawAttempts, setRawAttempts] = useState<CertificationAttempt[]>([]);
  const [normalizedAttempts, setNormalizedAttempts] = useState<CertificationAttempt[]>([]);
  const [hasTranscript, setHasTranscript] = useState<Record<string, boolean>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);
  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOffline, isOnline } = useConnectionStatus();
  const [retryCount, setRetryCount] = useState(0);
  const { t, currentLanguage } = useLocalization();

  const getSelectedLanguagePair = useCallback((): LanguagePair | undefined => {
    if (!selectedPairKey) return undefined;
    const [sourceLanguage, targetLanguage] = selectedPairKey.split('-');
    return { sourceLanguage, targetLanguage };
  }, [selectedPairKey]);

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

      // Clear any previous errors since we succeeded
      setFetchError(null);

      if (attempts && attempts.length > 0) {
        console.log("Retrieved certification attempts:", attempts);
        setRawAttempts(attempts);
        
        // Find all unique language pairs
        const pairs = getAvailableLanguagePairs(attempts);
        setLanguagePairs(pairs);
        
        // If we have pairs but no selection, default to the first pair
        if (pairs.length > 0 && !selectedPairKey) {
          const firstPair = pairs[0];
          setSelectedPairKey(`${firstPair.sourceLanguage}-${firstPair.targetLanguage}`);
        }
        
        const selectedPair = getSelectedLanguagePair();
        
        const processedData = processAttemptsByDate(attempts, selectedPair);
        setProgressData(processedData);
        
        const recommendations = generateRecommendations(attempts, selectedPair);
        setRecommendations(recommendations);
        
        const normalized = normalizeAttempts(attempts, selectedPair);
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
  }, [toast, isOffline, t, selectedPairKey, getSelectedLanguagePair]);

  useEffect(() => {
    if (user && isOnline) {
      fetchProgressData(user.id);
    }
    
    // Only set up the subscription if we're online
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
    
    return () => {}; // Empty cleanup when offline
  }, [fetchProgressData, user, isOnline]);

  // When language pair selection changes, update the data
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

  // Retry fetching data when coming back online
  useEffect(() => {
    if (isOnline && user && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log("Retrying data fetch after coming online");
        fetchProgressData(user.id);
        setRetryCount(prev => prev + 1);
      }, 2000); // Wait 2 seconds after coming online
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, user, fetchProgressData, retryCount]);

  useEffect(() => {
    const fetchTranscripts = async () => {
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
    };
    
    if (isOnline) {
      fetchTranscripts();
    }
  }, [rawAttempts, isOffline, isOnline]);

  const handleViewAttempt = async (attemptId: string) => {
    console.log("View attempt:", attemptId);
    toast({
      title: t("viewingDetails"),
      description: t("featureComingSoon"),
    });
  };

  const handleLanguagePairChange = (pairKey: string) => {
    setSelectedPairKey(pairKey);
  };

  return (
    <div className="space-y-6">
      <ProgressPageHeader />
      
      {fetchError && (
        <Alert variant={isOffline ? "warning" : "destructive"}>
          {isOffline ? (
            <WifiOff className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {fetchError}
          </AlertDescription>
        </Alert>
      )}

      {languagePairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("selectLanguagePair")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedPairKey || ''}
              onValueChange={handleLanguagePairChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectLanguagePair")} />
              </SelectTrigger>
              <SelectContent>
                {languagePairs.map((pair, index) => (
                  <SelectItem 
                    key={index} 
                    value={`${pair.sourceLanguage}-${pair.targetLanguage}`}
                  >
                    {getLanguageName(pair.sourceLanguage)} → {getLanguageName(pair.targetLanguage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {progressData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("scoreTrends")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart progressData={progressData} />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} rec={rec} />
            ))}
          </div>

          <RecentAttemptsCard 
            attempts={normalizedAttempts} 
            hasTranscript={hasTranscript} 
            onViewAttempt={handleViewAttempt} 
          />
        </>
      ) : (
        <NoProgressCard />
      )}
    </div>
  );
};

export default AuthenticatedProgress;

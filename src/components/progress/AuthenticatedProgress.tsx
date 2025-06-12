
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
import { processAttemptsByDate, generateRecommendations, normalizeAttempts } from "./ProgressDataProcessor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useLocalization } from "@/context/LocalizationContext";

interface AuthenticatedProgressProps {
  user: User;
}

const AuthenticatedProgress = ({ user }: AuthenticatedProgressProps) => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawAttempts, setRawAttempts] = useState<CertificationAttempt[]>([]);
  const [normalizedAttempts, setNormalizedAttempts] = useState<CertificationAttempt[]>([]);
  const [hasTranscript, setHasTranscript] = useState<Record<string, boolean>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOffline, isOnline } = useConnectionStatus();
  const [retryCount, setRetryCount] = useState(0);
  const { t } = useLocalization();

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
        
        const processedData = processAttemptsByDate(attempts);
        setProgressData(processedData);
        
        const recommendations = generateRecommendations(attempts);
        setRecommendations(recommendations);
        
        const normalized = normalizeAttempts(attempts);
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
  }, [toast, isOffline, t]);

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

  // Remove the fetchTranscripts function since certification_transcripts table doesn't exist
  useEffect(() => {
    // Simply set empty transcript map since the table doesn't exist
    setHasTranscript({});
  }, [rawAttempts, isOffline, isOnline]);

  const handleViewAttempt = async (attemptId: string) => {
    console.log("View attempt:", attemptId);
    toast({
      title: t("viewingDetails"),
      description: t("featureComingSoon"),
    });
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

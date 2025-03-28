
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

  const fetchProgressData = useCallback(async (userId: string) => {
    if (isOffline) {
      setFetchError("You're currently offline. Data shown may not be up to date.");
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
          setFetchError("Network connection issue. Unable to load your progress data.");
        } else {
          setFetchError("There was a problem loading your progress data. Please try again later.");
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
          title: "No Progress Data",
          description: "Complete some certification attempts to see your progress!",
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setFetchError("Network connection issue. Unable to load your progress data.");
      } else {
        setFetchError("Failed to load progress data. Please try again later.");
        
        toast({
          title: "Error",
          description: "Failed to load progress data. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [toast, isOffline]);

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

  const handleRefresh = () => {
    if (user && !isOffline) {
      setRetryCount(0); // Reset retry count
      fetchProgressData(user.id);
    } else if (isOffline) {
      toast({
        title: "Offline",
        description: "You are currently offline. Please check your internet connection.",
        variant: "destructive"
      });
    }
  };

  const handleViewAttempt = async (attemptId: string) => {
    console.log("View attempt:", attemptId);
    toast({
      title: "Viewing details",
      description: "This feature will be implemented in a future update.",
    });
  };

  return (
    <div className="space-y-6">
      <ProgressPageHeader 
        isRefreshing={isRefreshing} 
        onRefresh={handleRefresh} 
        isOffline={isOffline}
      />
      
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
              <CardTitle>Score Trends</CardTitle>
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

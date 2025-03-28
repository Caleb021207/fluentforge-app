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
import { AlertCircle } from "lucide-react";

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

  const fetchProgressData = useCallback(async (userId: string) => {
    try {
      setIsRefreshing(true);
      setFetchError(null);
      
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        setFetchError("There was a problem loading your progress data. Please try again later.");
        throw error;
      }

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
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchProgressData(user.id);
    }
    
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
  }, [fetchProgressData, user]);

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!rawAttempts || rawAttempts.length === 0) return;
      
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
    
    fetchTranscripts();
  }, [rawAttempts]);

  const handleRefresh = () => {
    if (user) {
      fetchProgressData(user.id);
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
      <ProgressPageHeader isRefreshing={isRefreshing} onRefresh={handleRefresh} />
      
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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

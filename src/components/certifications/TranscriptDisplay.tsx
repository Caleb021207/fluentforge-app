
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, User, Bot, AlertCircle, MessageSquare, Activity } from "lucide-react";
import { format } from "date-fns";

interface TranscriptDisplayProps {
  attemptId: string;
  onBack: () => void;
}

const TranscriptDisplay = ({ attemptId, onBack }: TranscriptDisplayProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{
    userTranscripts: string[];
    aiResponses: string[];
    analysisData: any;
    createdAt: string;
    certificationType: string;
    score: number;
    level: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("⭐ Starting transcript fetch for attempt:", attemptId);

        // Get the current user to verify that we're authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("🔴 Auth error:", authError);
          throw new Error(`Authentication error: ${authError.message}`);
        }
        
        if (!user) {
          console.error("🔴 No authenticated user found");
          throw new Error('You must be logged in to view transcripts');
        }
        
        console.log("✅ Authenticated as user:", user.id);

        // First, get the attempt details to know certification type
        const { data: attemptData, error: attemptError } = await supabase
          .from('certification_attempts')
          .select('certification_type, score, level')
          .eq('id', attemptId)
          .single();

        if (attemptError) {
          console.error("🔴 Error fetching attempt data:", attemptError);
          throw new Error(`Error fetching attempt data: ${attemptError.message}`);
        }

        if (!attemptData) {
          console.error("🔴 No attempt data found for ID:", attemptId);
          throw new Error('Attempt not found');
        }

        console.log("✅ Found attempt data:", attemptData);

        // Then get the transcript data with explicit column selection
        console.log("⭐ Fetching transcript with params:", { 
          attempt_id: attemptId,
          user_id: user.id
        });
        
        // Try first without the user_id filter to see if any records exist
        const { data: allTranscripts, error: allTranscriptsError } = await supabase
          .from('certification_transcripts')
          .select('id, user_id, attempt_id, user_transcripts, ai_responses, analysis_data, created_at');
          
        console.log("✅ All transcripts in system:", { 
          count: allTranscripts?.length || 0,
          data: allTranscripts,
          error: allTranscriptsError
        });
        
        // Now try with the filters
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('certification_transcripts')
          .select('id, user_id, attempt_id, user_transcripts, ai_responses, analysis_data, created_at')
          .eq('attempt_id', attemptId)
          .eq('user_id', user.id);

        console.log("🔍 Transcript query result:", { 
          count: transcriptData?.length || 0,
          data: transcriptData, 
          error: transcriptError,
          filters: {
            attempt_id: attemptId,
            user_id: user.id
          }
        });

        if (transcriptError) {
          console.error("🔴 Error fetching transcript:", transcriptError);
          throw new Error(`Error fetching transcript: ${transcriptError.message}`);
        }

        if (!transcriptData || transcriptData.length === 0) {
          // Check if transcript exists for the attempt but with a different user_id
          const { data: attemptTranscripts } = await supabase
            .from('certification_transcripts')
            .select('id, user_id')
            .eq('attempt_id', attemptId);
            
          console.log("🔍 Transcripts for this attempt with any user:", attemptTranscripts);
          
          if (attemptTranscripts && attemptTranscripts.length > 0) {
            console.error("🔶 Found transcript but for a different user:", {
              foundForUsers: attemptTranscripts.map(t => t.user_id),
              requestingUser: user.id
            });
            throw new Error('You do not have permission to view this transcript');
          } else {
            console.error("🔴 No transcript found for attempt:", attemptId);
            throw new Error('No transcript found for this attempt');
          }
        }

        // Use the first transcript found
        const transcript = transcriptData[0];
        console.log("✅ Found transcript data:", transcript);

        setTranscript({
          userTranscripts: transcript.user_transcripts as string[],
          aiResponses: transcript.ai_responses as string[],
          analysisData: transcript.analysis_data,
          createdAt: transcript.created_at,
          certificationType: attemptData.certification_type,
          score: attemptData.score,
          level: attemptData.level
        });
      } catch (err: any) {
        console.error('🔴 Error in fetchTranscript:', err);
        setError(err.message || 'An error occurred while fetching the transcript');
        toast({
          title: "Error",
          description: err.message || 'Failed to load transcript',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchTranscript();
    }
  }, [attemptId, toast]);

  const formatCreatedAt = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (err) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="outline" className="mr-4" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Transcript</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button variant="outline" onClick={onBack}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transcript Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find a transcript for this attempt. This might be because the test was
                taken before transcript saving was implemented.
              </p>
              <Button variant="outline" onClick={onBack}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { userTranscripts, aiResponses, analysisData, createdAt, certificationType, score, level } = transcript;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
        <div className="text-sm text-gray-500">
          {formatCreatedAt(createdAt)}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="capitalize">{certificationType.replace('_', ' ')} Test Transcript</span>
            </div>
            <div className="flex items-center gap-2 text-base font-normal">
              <Activity className="h-4 w-4 text-lingua-primary" />
              Score: <span className="font-medium">{score}%</span> 
              <span className="text-gray-500">(Level {level})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {userTranscripts.length === 0 && aiResponses.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  No conversation data available for this attempt.
                </div>
              ) : (
                <>
                  {aiResponses.map((response, index) => (
                    <React.Fragment key={`conversation-${index}`}>
                      {/* AI response */}
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="prose-sm prose-gray">
                            <p>{response}</p>
                          </div>
                        </div>
                      </div>

                      {/* User response (if available for this exchange) */}
                      {userTranscripts[index] && (
                        <div className="flex gap-3 ml-6">
                          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-muted shadow-sm">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="prose-sm prose-gray">
                              <p>{userTranscripts[index]}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {index < aiResponses.length - 1 && <Separator className="my-4" />}
                    </React.Fragment>
                  ))}
                </>
              )}

              {analysisData && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-lingua-primary" />
                      Analysis
                    </h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{analysisData.analysis || "No detailed analysis available."}</pre>
                      
                      {analysisData.feedback && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium mb-2">Feedback</h4>
                          <p className="text-sm">{analysisData.feedback}</p>
                        </div>
                      )}
                      
                      {analysisData.strengths && analysisData.strengths.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium mb-2">Strengths</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {analysisData.strengths.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysisData.areas_for_improvement && analysisData.areas_for_improvement.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium mb-2">Areas for Improvement</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {analysisData.areas_for_improvement.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDisplay;

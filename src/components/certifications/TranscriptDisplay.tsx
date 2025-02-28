
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import TranscriptConversation from "./transcript/TranscriptConversation";
import NoTranscriptFound from "./transcript/NoTranscriptFound";
import TranscriptHeader from "./transcript/TranscriptHeader";
import TranscriptSkeleton from "./transcript/TranscriptSkeleton";
import TranscriptError from "./transcript/TranscriptError";
import { TranscriptAssessment } from "./utils/assessmentUtils";
import ScoreDisplay from "./transcript/ScoreDisplay";
import FeedbackSection from "./transcript/FeedbackSection";
import DetailedScores from "./transcript/DetailedScores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TranscriptDisplayProps {
  attemptId: string;
  onBack: () => void;
  onRetake?: () => void;
}

const TranscriptDisplay = ({ attemptId, onBack, onRetake }: TranscriptDisplayProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<TranscriptAssessment | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscriptData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the transcript data from the database
        const { data, error } = await supabase
          .from('certification_transcripts')
          .select('user_transcripts, ai_responses, analysis_data')
          .eq('id', attemptId)
          .single();

        if (error) throw error;

        if (data) {
          // Convert user_transcripts and ai_responses to a transcript format
          // This assumes that user_transcripts and ai_responses are arrays of messages
          const userTranscripts = data.user_transcripts ? Array.isArray(data.user_transcripts) ? data.user_transcripts : [] : [];
          const aiResponses = data.ai_responses ? Array.isArray(data.ai_responses) ? data.ai_responses : [] : [];
          
          // Combine user transcripts and AI responses into a conversation format
          const conversationItems = [];
          const maxLength = Math.max(userTranscripts.length, aiResponses.length);
          
          for (let i = 0; i < maxLength; i++) {
            if (i < userTranscripts.length && userTranscripts[i]) {
              conversationItems.push({
                role: 'user',
                content: userTranscripts[i].text || userTranscripts[i],
                timestamp: userTranscripts[i].timestamp
              });
            }
            
            if (i < aiResponses.length && aiResponses[i]) {
              conversationItems.push({
                role: 'assistant',
                content: aiResponses[i].text || aiResponses[i],
                timestamp: aiResponses[i].timestamp
              });
            }
          }
          
          setTranscript(JSON.stringify(conversationItems));
          
          // Extract prompt if available (might be in the first AI response or elsewhere)
          const promptData = aiResponses.length > 0 ? aiResponses[0].prompt : null;
          setPrompt(promptData);
          
          // Parse the assessment JSON if it exists
          if (data.analysis_data) {
            try {
              const parsedAssessment = typeof data.analysis_data === 'string' 
                ? JSON.parse(data.analysis_data) 
                : data.analysis_data;
              setAssessment(parsedAssessment);
            } catch (parseError) {
              console.error("Error parsing assessment:", parseError);
              setError("Could not parse assessment data");
            }
          }
        } else {
          setError("No transcript found");
        }
      } catch (err) {
        console.error("Error fetching transcript:", err);
        setError("Failed to load transcript");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchTranscriptData();
    }
  }, [attemptId]);

  if (loading) {
    return <TranscriptSkeleton onBack={onBack} />;
  }

  if (error) {
    return <TranscriptError error={error} onBack={onBack} />;
  }

  if (!transcript) {
    return <NoTranscriptFound onBack={onBack} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
        
        {onRetake && (
          <Button onClick={onRetake} variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake Test
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <TranscriptHeader prompt={prompt} />
          {assessment && (
            <div className="mt-4">
              <ScoreDisplay assessment={assessment} />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment ? (
            <Tabs defaultValue="feedback" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="details">Detailed Scores</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feedback" className="mt-4">
                <FeedbackSection assessment={assessment} />
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <DetailedScores assessment={assessment} />
              </TabsContent>
              
              <TabsContent value="transcript" className="mt-4">
                <TranscriptConversation transcript={transcript} />
              </TabsContent>
            </Tabs>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Assessment Not Available</AlertTitle>
              <AlertDescription>
                The AI has not yet analyzed this transcript. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDisplay;


import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import TranscriptConversation from "@/components/certifications/transcript/TranscriptConversation";
import NoTranscriptFound from "@/components/certifications/transcript/NoTranscriptFound";
import TranscriptHeader from "@/components/certifications/transcript/TranscriptHeader";
import TranscriptSkeleton from "@/components/certifications/transcript/TranscriptSkeleton";
import TranscriptError from "@/components/certifications/transcript/TranscriptError";
import { TranscriptAssessment } from "./utils/assessmentUtils";
import ScoreDisplay from "@/components/certifications/transcript/ScoreDisplay";
import FeedbackSection from "@/components/certifications/transcript/FeedbackSection";
import DetailedScores from "@/components/certifications/transcript/DetailedScores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Json } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";

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
  const [activeTab, setActiveTab] = useState<string>("feedback");

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
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(`Failed to fetch transcript: ${error.message}`);
        }

        if (!data) {
          setError("No transcript found with this ID");
          return;
        }

        // Process user transcripts
        let userTranscripts = [];
        try {
          userTranscripts = data.user_transcripts ? 
            (Array.isArray(data.user_transcripts) ? data.user_transcripts : 
            (typeof data.user_transcripts === 'string' ? JSON.parse(data.user_transcripts) : [])) : [];
        } catch (err) {
          console.error("Error parsing user transcripts:", err);
          userTranscripts = [];
        }

        // Process AI responses
        let aiResponses = [];
        try {
          aiResponses = data.ai_responses ? 
            (Array.isArray(data.ai_responses) ? data.ai_responses : 
            (typeof data.ai_responses === 'string' ? JSON.parse(data.ai_responses) : [])) : [];
        } catch (err) {
          console.error("Error parsing AI responses:", err);
          aiResponses = [];
        }
        
        // Combine user transcripts and AI responses into a conversation format
        const conversationItems = [];
        const maxLength = Math.max(userTranscripts.length, aiResponses.length);
        
        for (let i = 0; i < maxLength; i++) {
          if (i < userTranscripts.length && userTranscripts[i]) {
            const userMsg = userTranscripts[i];
            conversationItems.push({
              role: 'user',
              content: typeof userMsg === 'string' ? userMsg : 
                      (typeof userMsg === 'object' && userMsg !== null && 'text' in userMsg ? 
                      String(userMsg.text) : String(userMsg))
            });
          }
          
          if (i < aiResponses.length && aiResponses[i]) {
            const aiMsg = aiResponses[i];
            conversationItems.push({
              role: 'assistant',
              content: typeof aiMsg === 'string' ? aiMsg : 
                      (typeof aiMsg === 'object' && aiMsg !== null && 'text' in aiMsg ? 
                      String(aiMsg.text) : String(aiMsg))
            });
          }
        }
        
        if (conversationItems.length === 0) {
          setError("Transcript is empty");
          return;
        }

        setTranscript(JSON.stringify(conversationItems));
        
        // Extract prompt if available
        let promptText = null;
        if (aiResponses.length > 0) {
          const firstAiResponse = aiResponses[0];
          if (typeof firstAiResponse === 'object' && firstAiResponse !== null) {
            promptText = 'prompt' in firstAiResponse ? String(firstAiResponse.prompt) : null;
          }
        }
        setPrompt(promptText);
        
        // Parse the assessment JSON if it exists
        if (data.analysis_data) {
          try {
            const parsedAssessment = typeof data.analysis_data === 'string' 
              ? JSON.parse(data.analysis_data) 
              : data.analysis_data;
            
            // Validate assessment object has the expected structure
            if (parsedAssessment && 
                typeof parsedAssessment === 'object' && 
                'assessment' in parsedAssessment &&
                'overallScore' in parsedAssessment) {
              setAssessment(parsedAssessment);
              
              // Default to feedback tab if assessment exists
              setActiveTab("feedback");
            } else {
              console.error("Assessment data is missing required fields");
              toast({
                title: "Assessment data format issue",
                description: "The assessment data isn't in the expected format",
                variant: "destructive"
              });
            }
          } catch (parseError) {
            console.error("Error parsing assessment:", parseError);
            setError("Could not parse assessment data");
          }
        } else {
          // Default to transcript tab if no assessment
          setActiveTab("transcript");
        }
      } catch (err) {
        console.error("Error fetching transcript:", err);
        setError(err instanceof Error ? err.message : "Failed to load transcript");
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
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="details">Detailed Scores</TabsTrigger>
                <TabsTrigger value="transcript">Conversation</TabsTrigger>
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
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Assessment Not Available</AlertTitle>
                <AlertDescription>
                  The AI has not yet analyzed this conversation. You can still view the conversation below.
                </AlertDescription>
              </Alert>
              
              <TranscriptConversation transcript={transcript} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDisplay;

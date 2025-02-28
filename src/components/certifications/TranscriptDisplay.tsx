
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import AnalysisSection from "./transcript/AnalysisSection";
import TranscriptConversation from "./transcript/TranscriptConversation";
import NoTranscriptFound from "./transcript/NoTranscriptFound";
import TranscriptHeader from "./transcript/TranscriptHeader";
import TranscriptSkeleton from "./transcript/TranscriptSkeleton";
import TranscriptError from "./transcript/TranscriptError";
import { TranscriptAssessment } from "./utils/assessmentUtils";

interface TranscriptDisplayProps {
  attemptId: string;
  onBack: () => void;
}

const TranscriptDisplay = ({ attemptId, onBack }: TranscriptDisplayProps) => {
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
          .select('transcript, assessment, prompt')
          .eq('id', attemptId)
          .single();

        if (error) throw error;

        if (data) {
          setTranscript(data.transcript);
          setPrompt(data.prompt || null);
          
          // Parse the assessment JSON if it exists
          if (data.assessment) {
            try {
              const parsedAssessment = typeof data.assessment === 'string' 
                ? JSON.parse(data.assessment) 
                : data.assessment;
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
      <div className="flex items-center">
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
      </div>

      <Card>
        <CardHeader>
          <TranscriptHeader prompt={prompt} />
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment ? (
            <div className="space-y-6">
              <AnalysisSection assessment={assessment} />
              <TranscriptConversation transcript={transcript} />
            </div>
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

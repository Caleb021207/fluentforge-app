
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import TranscriptSkeleton from "./transcript/TranscriptSkeleton";
import TranscriptError from "./transcript/TranscriptError";
import NoTranscriptFound from "./transcript/NoTranscriptFound";
import TranscriptHeader from "./transcript/TranscriptHeader";
import TranscriptConversation from "./transcript/TranscriptConversation";
import { fetchTranscriptData } from "./transcript/utils/transcriptUtils";

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
    const getTranscript = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchTranscriptData(attemptId);
        setTranscript(data);
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
      getTranscript();
    }
  }, [attemptId, toast]);

  if (loading) {
    return <TranscriptSkeleton onBack={onBack} />;
  }

  if (error) {
    return <TranscriptError error={error} onBack={onBack} />;
  }

  if (!transcript) {
    return <NoTranscriptFound onBack={onBack} />;
  }

  const { 
    userTranscripts, 
    aiResponses, 
    analysisData, 
    createdAt, 
    certificationType, 
    score, 
    level 
  } = transcript;

  return (
    <div className="space-y-4">
      <TranscriptHeader 
        onBack={onBack}
        createdAt={createdAt}
        certificationType={certificationType}
        score={score}
        level={level}
      />

      <Card>
        <CardHeader>
          {/* Header is empty because the title is in TranscriptHeader component */}
        </CardHeader>
        <CardContent>
          <TranscriptConversation 
            userTranscripts={userTranscripts}
            aiResponses={aiResponses}
            analysisData={analysisData}
            attemptId={attemptId}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDisplay;

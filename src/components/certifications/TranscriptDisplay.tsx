
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CertificationAttempt } from "@/types/supabase";
import { Mic, Volume2, ArrowLeft } from "lucide-react";

interface TranscriptDisplayProps {
  attemptId: string;
  onBack: () => void;
}

type Transcript = {
  id: string;
  attempt_id: string;
  user_id: string;
  user_transcripts: string[];
  ai_responses: string[];
  analysis_data: {
    speakingLevel?: string;
    speakingScore?: number;
    listeningLevel?: string;
    listeningScore?: number;
    analysis?: string;
  } | null;
  created_at: string;
};

const TranscriptDisplay = ({ attemptId, onBack }: TranscriptDisplayProps) => {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [attempt, setAttempt] = useState<CertificationAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, get the attempt details
        const { data: attemptData, error: attemptError } = await supabase
          .from('certification_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();

        if (attemptError) {
          console.error('Error fetching attempt:', attemptError);
          setError('Failed to fetch attempt details');
          return;
        }

        setAttempt(attemptData as CertificationAttempt);

        // Then, get the transcript data
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('certification_transcripts')
          .select('*')
          .eq('attempt_id', attemptId)
          .single();

        if (transcriptError && transcriptError.code !== 'PGRST116') { // Not found
          console.error('Error fetching transcript:', transcriptError);
          setError('Failed to fetch transcript data');
          return;
        }

        setTranscript(transcriptData as Transcript);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId) {
      fetchTranscript();
    }
  }, [attemptId]);

  const getCertificationType = () => {
    if (!attempt) return '';
    
    return attempt.certification_type.charAt(0).toUpperCase() + 
           attempt.certification_type.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading transcript data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-800 p-4 rounded-md">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={onBack}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attempt) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
            <p>The requested certification attempt could not be found.</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={onBack}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's no transcript data
  if (!transcript) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {getCertificationType()} Test - {attempt.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-900">Test Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-medium">Type:</span> {getCertificationType()}</p>
                <p><span className="font-medium">Level:</span> {attempt.level}</p>
                <p><span className="font-medium">Score:</span> {attempt.score}%</p>
                <p><span className="font-medium">Completed:</span> {formatDate(attempt.completed_at || '')}</p>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No transcript data is available for this test attempt.</p>
              <p className="text-sm text-gray-400 mt-2">Transcript data is only stored for speaking and listening tests completed after this feature was added.</p>
            </div>
            
            <Button onClick={onBack} className="w-full">
              Return to Certifications
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {getCertificationType()} Test Transcript - {attempt.level}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-900">Test Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-medium">Type:</span> {getCertificationType()}</p>
                <p><span className="font-medium">Level:</span> {attempt.level}</p>
                <p><span className="font-medium">Score:</span> {attempt.score}%</p>
                <p><span className="font-medium">Completed:</span> {formatDate(attempt.completed_at || '')}</p>
              </div>
            </div>
            
            {transcript.analysis_data && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-lg font-medium text-green-900">Assessment Results</h3>
                <div className="mt-2 space-y-1 text-sm">
                  {transcript.analysis_data.speakingLevel && (
                    <p><span className="font-medium">Speaking Level:</span> {transcript.analysis_data.speakingLevel}</p>
                  )}
                  {transcript.analysis_data.speakingScore !== undefined && (
                    <p><span className="font-medium">Speaking Score:</span> {transcript.analysis_data.speakingScore}%</p>
                  )}
                  {transcript.analysis_data.listeningLevel && (
                    <p><span className="font-medium">Listening Level:</span> {transcript.analysis_data.listeningLevel}</p>
                  )}
                  {transcript.analysis_data.listeningScore !== undefined && (
                    <p><span className="font-medium">Listening Score:</span> {transcript.analysis_data.listeningScore}%</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="conversation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversation" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {transcript.user_transcripts.map((userText, i) => (
                        <React.Fragment key={i}>
                          <div className="flex items-start gap-2 mb-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Mic className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg flex-1">
                              <p>{userText}</p>
                            </div>
                          </div>
                          
                          {transcript.ai_responses[i] && (
                            <div className="flex items-start gap-2 mb-2 pl-8">
                              <div className="bg-green-100 p-2 rounded-full">
                                <Volume2 className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg flex-1">
                                <p>{transcript.ai_responses[i]}</p>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                      
                      {transcript.user_transcripts.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                          No conversation data available
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[400px] pr-4">
                    {transcript.analysis_data?.analysis ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line">
                          {transcript.analysis_data.analysis}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-gray-500">
                        No analysis data available
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onBack}>
          Return to Certifications
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TranscriptDisplay;

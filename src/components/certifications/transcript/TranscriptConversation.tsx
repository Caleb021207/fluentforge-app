
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCheck, PlusCircle } from "lucide-react";
import ConversationItem from "./ConversationItem";
import AnalysisSection from "./AnalysisSection";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface TranscriptConversationProps {
  userTranscripts: string[];
  aiResponses: string[];
  analysisData: any;
  showCopyButton?: boolean;
  attemptId?: string;
}

const TranscriptConversation = ({ 
  userTranscripts = [], 
  aiResponses = [], 
  analysisData,
  showCopyButton = false,
  attemptId
}: TranscriptConversationProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [exchanges, setExchanges] = useState<React.ReactNode[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [updatedAnalysisData, setUpdatedAnalysisData] = useState(analysisData);
  
  // Process conversation data into paired exchanges
  useEffect(() => {
    if (!hasConversationData()) {
      setExchanges([]);
      return;
    }

    try {
      // Ensure we're working with arrays
      const userArray = Array.isArray(userTranscripts) ? userTranscripts : [];
      const aiArray = Array.isArray(aiResponses) ? aiResponses : [];
      
      // Determine which array is longer to handle mismatched array lengths
      const responseCount = Math.max(aiArray.length, userArray.length);
      
      // Create exchanges array
      const newExchanges = [];
      for (let i = 0; i < responseCount; i++) {
        newExchanges.push(
          <React.Fragment key={`conversation-${i}`}>
            {/* AI response */}
            {aiArray[i] && (
              <ConversationItem 
                message={aiArray[i]} 
                isAi={true} 
                index={i}
              />
            )}

            {/* User response */}
            {userArray[i] && (
              <div className="ml-6">
                <ConversationItem 
                  message={userArray[i]} 
                  isAi={false} 
                  index={i}
                />
              </div>
            )}

            {i < responseCount - 1 && <Separator className="my-4" />}
          </React.Fragment>
        );
      }
      
      setExchanges(newExchanges);
    } catch (error) {
      console.error("Error processing conversation data:", error);
      setExchanges([
        <Alert variant="destructive" key="error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to process conversation data. Please try again.
          </AlertDescription>
        </Alert>
      ]);
    }
  }, [userTranscripts, aiResponses]);

  useEffect(() => {
    setUpdatedAnalysisData(analysisData);
  }, [analysisData]);
  
  // Function to prepare conversation for copying
  const prepareConversationForCopy = () => {
    let conversationText = "# Language Assessment Conversation\n\n";
    
    try {
      // Determine which array is longer to handle mismatched array lengths
      const maxLength = Math.max(aiResponses.length, userTranscripts.length);
      
      // Combine exchanges in a readable format
      for (let i = 0; i < maxLength; i++) {
        conversationText += `## Exchange ${i + 1}\n\n`;
        
        if (aiResponses[i]) {
          conversationText += `**AI:** ${aiResponses[i]}\n\n`;
        }
        
        if (userTranscripts[i]) {
          conversationText += `**User:** ${userTranscripts[i]}\n\n`;
        }
      }
      
      conversationText += "# Assessment Request\n\n";
      conversationText += "Based on this conversation, please assess my Spanish speaking and listening skills on the CEFR scale (A1-C2).\n";
      conversationText += "Please provide detailed feedback on my pronunciation, grammar, vocabulary, fluency, and comprehension.\n";
      conversationText += "Include specific improvement suggestions for each area.\n";
      conversationText += "Format your response with clear sections for Speaking (level + score percentage), Listening (level + score percentage), and detailed feedback.\n";
      
      return conversationText;
    } catch (error) {
      console.error("Error preparing conversation for copy:", error);
      return "Error preparing conversation data. Please try again.";
    }
  };

  // Handle copying transcript to clipboard
  const handleCopyTranscript = () => {
    try {
      const textToCopy = prepareConversationForCopy();
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Conversation transcript copied. Paste it into ChatGPT for assessment. After getting the assessment, come back here to submit it.",
        });
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error("Failed to copy transcript:", err);
        toast({
          title: "Copy failed",
          description: "Could not copy the transcript. Please try again.",
          variant: "destructive",
        });
      });
    } catch (error) {
      console.error("Error in handleCopyTranscript:", error);
      toast({
        title: "Copy failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle submitting feedback from ChatGPT
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Empty feedback",
        description: "Please paste the assessment from ChatGPT before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!attemptId) {
      toast({
        title: "Cannot submit feedback",
        description: "Unable to find the test attempt. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      // Parse the feedback to extract levels and scores
      const speakingMatch = feedback.match(/Speaking:?\s*([A-C][1-2])\s*\(?(\d+)%?\)?/i);
      const listeningMatch = feedback.match(/Listening:?\s*([A-C][1-2])\s*\(?(\d+)%?\)?/i);
      
      const speakingLevel = speakingMatch ? speakingMatch[1] : 'B1';
      const speakingScore = speakingMatch ? parseInt(speakingMatch[2], 10) : 70;
      
      const listeningLevel = listeningMatch ? listeningMatch[1] : 'B1';
      const listeningScore = listeningMatch ? parseInt(listeningMatch[2], 10) : 70;
      
      // Extract strengths and areas for improvement
      const strengthsMatch = feedback.match(/Strengths:?([\s\S]*?)(?=Areas for Improvement:|$)/i);
      const improvementMatch = feedback.match(/Areas for Improvement:?([\s\S]*?)(?=\n#|\n##|$)/i);
      
      let strengths: string[] = [];
      if (strengthsMatch && strengthsMatch[1]) {
        strengths = strengthsMatch[1]
          .split(/\n-|\n•/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
      
      let areasForImprovement: string[] = [];
      if (improvementMatch && improvementMatch[1]) {
        areasForImprovement = improvementMatch[1]
          .split(/\n-|\n•/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to submit feedback");
      }
      
      // Update the certification_transcripts table with the feedback
      const newAnalysisData = {
        ...updatedAnalysisData,
        analysis: feedback,
        speakingLevel,
        speakingScore,
        listeningLevel,
        listeningScore,
        strengths,
        areas_for_improvement: areasForImprovement,
        updated_at: new Date().toISOString()
      };
      
      const { error: transcriptError } = await supabase
        .from('certification_transcripts')
        .update({
          analysis_data: newAnalysisData
        })
        .eq('attempt_id', attemptId)
        .eq('user_id', user.id);
        
      if (transcriptError) {
        throw transcriptError;
      }

      // Update local state with the new data
      setUpdatedAnalysisData(newAnalysisData);
      setShowFeedbackForm(false);
      
      toast({
        title: "Feedback submitted",
        description: "Your assessment has been successfully added. You can now apply the score to your profile.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Check if there's any conversation data to display
  const hasConversationData = () => {
    const hasUserData = Array.isArray(userTranscripts) && userTranscripts.length > 0 && 
                        userTranscripts.some(transcript => !!transcript);
    
    const hasAiData = Array.isArray(aiResponses) && aiResponses.length > 0 && 
                      aiResponses.some(response => !!response);
    
    return hasUserData || hasAiData;
  };

  // Render empty state when no data is available
  const renderEmptyState = () => {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No conversation data</AlertTitle>
        <AlertDescription className="text-center p-4 text-gray-500">
          No conversation data is available for this attempt.
          This could happen if the test was not completed properly or if there was an issue saving your responses.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-4">
      {showCopyButton && hasConversationData() && (
        <div className="flex flex-wrap justify-between gap-3 mb-2">
          <Button 
            onClick={handleCopyTranscript} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={copied}
          >
            {copied ? (
              <>
                <CheckCheck className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy for ChatGPT Assessment
              </>
            )}
          </Button>
          
          {attemptId && !showFeedbackForm && (
            <Button 
              onClick={() => setShowFeedbackForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Assessment Results
            </Button>
          )}
        </div>
      )}
      
      {showFeedbackForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Submit ChatGPT Assessment</CardTitle>
            <CardDescription>
              Paste the assessment results from ChatGPT below. The system will attempt to extract the speaking and listening levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Paste the ChatGPT assessment here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFeedbackForm(false)}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback || !feedback.trim()}
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit Assessment"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {hasConversationData() ? exchanges : renderEmptyState()}

          {updatedAnalysisData && Object.keys(updatedAnalysisData).length > 0 && (
            <>
              <Separator className="my-6" />
              <AnalysisSection analysisData={updatedAnalysisData} attemptId={attemptId} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptConversation;

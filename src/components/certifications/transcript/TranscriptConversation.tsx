
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck } from "lucide-react";
import ConversationItem from "./ConversationItem";
import AnalysisSection from "./AnalysisSection";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [copied, setCopied] = React.useState(false);
  const [exchanges, setExchanges] = React.useState<React.ReactNode[]>([]);
  
  // Process conversation data into paired exchanges
  React.useEffect(() => {
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
  
  // Function to prepare conversation for copying
  const prepareConversationForCopy = () => {
    let conversationText = "# Conversation Transcript\n\n";
    
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
          description: "Conversation transcript copied.",
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
                Copy Transcript
              </>
            )}
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {hasConversationData() ? exchanges : renderEmptyState()}

          {analysisData && Object.keys(analysisData).length > 0 && (
            <>
              <Separator className="my-6" />
              <AnalysisSection analysisData={analysisData} attemptId={attemptId} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptConversation;

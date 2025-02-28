
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import ConversationItem from "./ConversationItem";
import AnalysisSection from "./AnalysisSection";
import { useToast } from "@/hooks/use-toast";

interface TranscriptConversationProps {
  userTranscripts: string[];
  aiResponses: string[];
  analysisData: any;
  showCopyButton?: boolean;
}

const TranscriptConversation = ({ 
  userTranscripts, 
  aiResponses, 
  analysisData,
  showCopyButton = false
}: TranscriptConversationProps) => {
  const { toast } = useToast();
  
  // Function to prepare conversation for copying
  const prepareConversationForCopy = () => {
    let conversationText = "# Language Assessment Conversation\n\n";
    
    // Combine exchanges in a readable format
    aiResponses.forEach((response, index) => {
      conversationText += `## Exchange ${index + 1}\n\n`;
      conversationText += `**AI:** ${response}\n\n`;
      
      if (userTranscripts && userTranscripts[index]) {
        conversationText += `**User:** ${userTranscripts[index]}\n\n`;
      }
    });
    
    // Add any remaining user responses
    if (userTranscripts && userTranscripts.length > aiResponses.length) {
      const lastIndex = aiResponses.length;
      conversationText += `**User (Final Response):** ${userTranscripts[lastIndex]}\n\n`;
    }
    
    conversationText += "# Assessment Request\n\n";
    conversationText += "Based on this conversation, please assess my Spanish speaking and listening skills on the CEFR scale (A1-C2).\n";
    conversationText += "Please provide detailed feedback on my pronunciation, grammar, vocabulary, fluency, and comprehension.\n";
    conversationText += "Include specific improvement suggestions for each area.\n";
    
    return conversationText;
  };

  // Handle copying transcript to clipboard
  const handleCopyTranscript = () => {
    const textToCopy = prepareConversationForCopy();
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Conversation transcript copied. Paste it into ChatGPT for assessment.",
      });
    }).catch(err => {
      console.error("Failed to copy transcript:", err);
      toast({
        title: "Copy failed",
        description: "Could not copy the transcript. Please try again.",
        variant: "destructive",
      });
    });
  };

  // Main render content
  const renderConversationContent = () => {
    if ((!userTranscripts || userTranscripts.length === 0) && 
        (!aiResponses || aiResponses.length === 0)) {
      return (
        <div className="text-center p-6 text-gray-500">
          No conversation data available for this attempt.
        </div>
      );
    }

    // Determine which array is longer to handle mismatched array lengths
    const responseCount = Math.max(
      aiResponses?.length || 0,
      userTranscripts?.length || 0
    );
    
    // Create exchanges array
    const exchanges = [];
    for (let i = 0; i < responseCount; i++) {
      exchanges.push(
        <React.Fragment key={`conversation-${i}`}>
          {/* AI response */}
          {aiResponses && aiResponses[i] && (
            <ConversationItem message={aiResponses[i]} isAi={true} />
          )}

          {/* User response */}
          {userTranscripts && userTranscripts[i] && (
            <div className="ml-6">
              <ConversationItem message={userTranscripts[i]} isAi={false} />
            </div>
          )}

          {i < responseCount - 1 && <Separator className="my-4" />}
        </React.Fragment>
      );
    }
    
    return exchanges;
  };

  return (
    <div className="space-y-4">
      {showCopyButton && (
        <div className="flex justify-end mb-2">
          <Button 
            onClick={handleCopyTranscript} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy for ChatGPT Assessment
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {renderConversationContent()}

          {analysisData && (
            <>
              <Separator className="my-6" />
              <AnalysisSection analysisData={analysisData} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptConversation;

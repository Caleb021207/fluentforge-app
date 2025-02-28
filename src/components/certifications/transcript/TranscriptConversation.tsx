
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ConversationItem from "./ConversationItem";
import AnalysisSection from "./AnalysisSection";

interface TranscriptConversationProps {
  userTranscripts: string[];
  aiResponses: string[];
  analysisData: any;
}

const TranscriptConversation = ({ 
  userTranscripts, 
  aiResponses, 
  analysisData 
}: TranscriptConversationProps) => {
  return (
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
                <ConversationItem message={response} isAi={true} />

                {/* User response (if available for this exchange) */}
                {userTranscripts[index] && (
                  <div className="ml-6">
                    <ConversationItem message={userTranscripts[index]} isAi={false} />
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
            <AnalysisSection analysisData={analysisData} />
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default TranscriptConversation;

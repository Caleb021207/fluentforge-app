
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ConversationItem from "./ConversationItem";
import { formatTranscriptLines } from "./utils/transcriptUtils";

interface TranscriptConversationProps {
  transcript: string;
}

const TranscriptConversation: React.FC<TranscriptConversationProps> = ({ transcript }) => {
  const lines = formatTranscriptLines(transcript);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lines.length > 0 ? (
            lines.map((line, index) => (
              <ConversationItem 
                key={index}
                text={line.text}
                isUser={line.isUser}
              />
            ))
          ) : (
            <p className="text-gray-500 italic">This transcript doesn't contain any recognizable conversation structure.</p>
          )}
          
          {lines.length === 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">Raw Transcript:</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{transcript}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptConversation;

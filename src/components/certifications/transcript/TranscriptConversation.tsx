
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ConversationItem from "./ConversationItem";

interface TranscriptConversationProps {
  transcript: string;
}

interface ConversationMessage {
  role: string;
  content: string;
}

const TranscriptConversation = ({ transcript }: TranscriptConversationProps) => {
  const parseTranscript = (transcriptString: string): ConversationMessage[] => {
    try {
      return JSON.parse(transcriptString);
    } catch (error) {
      console.error("Error parsing transcript:", error);
      return [];
    }
  };

  const conversation = parseTranscript(transcript);

  if (!conversation || conversation.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-gray-500 italic">
            No conversation data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversation.map((message, index) => (
        <ConversationItem 
          key={index}
          role={message.role}
          content={message.content}
        />
      ))}
    </div>
  );
};

export default TranscriptConversation;

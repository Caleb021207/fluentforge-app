
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ConversationItem from "@/components/certifications/transcript/ConversationItem";
import { Badge } from "@/components/ui/badge";

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
      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mb-4">
        <p className="font-medium">Conversational Fluency Assessment</p>
        <p>This transcript shows the conversation that was assessed for your speaking and listening abilities.</p>
      </div>
      
      <div className="flex justify-between mb-4">
        <Badge variant="outline" className="bg-blue-50 text-blue-700">You</Badge>
        <Badge variant="outline" className="bg-gray-50 text-gray-700">AI Tutor</Badge>
      </div>
      
      {conversation.map((message, index) => (
        <ConversationItem 
          key={index}
          text={message.content}
          isUser={message.role === "user"}
        />
      ))}
    </div>
  );
};

export default TranscriptConversation;

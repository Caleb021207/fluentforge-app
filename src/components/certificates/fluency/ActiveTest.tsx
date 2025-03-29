import React from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActiveTestProps {
  timeRemaining: string; // Ensure this is typed as string
  onEnd: () => void;
  conversation: any;
  conversationTranscript: {
    userMessages: any[];
    aiResponses: any[];
  };
  languagePair?: {
    sourceLanguage: string;
    targetLanguage: string;
  };
}

const ActiveTest = ({
  timeRemaining,
  onEnd,
  conversation,
  conversationTranscript,
  languagePair
}: ActiveTestProps) => {
  return (
    <div>ActiveTest Component
      <CardHeader>
        <CardTitle>Time Remaining: {timeRemaining}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Speak now in {languagePair?.targetLanguage || 'the target language'}.</p>
        <button onClick={onEnd}>End Test</button>
        <div>
          <h3>Your Messages:</h3>
          <ul>
            {conversationTranscript.userMessages.map((message, index) => (
              <li key={index}>{message.content}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>AI Responses:</h3>
          <ul>
            {conversationTranscript.aiResponses.map((message, index) => (
              <li key={index}>{message.content}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </div>
  );
};

export default ActiveTest;

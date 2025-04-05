
import React from "react";
import { Card } from "@/components/ui/card";
import VoiceChatControls from "./VoiceChatControls";
import UserTranscript from "./UserTranscript";
import LoadingIndicator from "./LoadingIndicator";
import ResponseCard from "./ResponseCard";
import { useCefrLevel } from "../hooks/useCefrLevel";

interface VoiceChatContainerProps {
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  gptResponse: string;
  translation: string;
  toggleListening: () => void;
  playAgain: () => void;
}

const VoiceChatContainer: React.FC<VoiceChatContainerProps> = ({
  isLoading,
  isListening,
  isSpeaking,
  transcript,
  gptResponse,
  translation,
  toggleListening,
  playAgain
}) => {
  const { cefrDescription, practiceLevelText } = useCefrLevel();

  return (
    <Card className="p-6">
      <VoiceChatControls 
        isListening={isListening} 
        toggleListening={toggleListening} 
        isLoading={isLoading}
        isSpeaking={isSpeaking}
        cefrDescription={cefrDescription}
        practiceLevelText={practiceLevelText}
      />
      
      {isListening && (
        <div className="text-sm text-gray-500 animate-pulse">
          {transcript ? transcript : "Listening now..."}
        </div>
      )}

      {transcript && <UserTranscript transcript={transcript} />}
      
      {isLoading && <LoadingIndicator />}
      
      {gptResponse && (
        <ResponseCard 
          gptResponse={gptResponse}
          translation={translation}
          isSpeaking={isSpeaking}
          onPlay={playAgain}
        />
      )}
    </Card>
  );
};

export default VoiceChatContainer;

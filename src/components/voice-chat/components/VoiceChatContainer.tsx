
import React from "react";
import { Card } from "@/components/ui/card";
import VoiceChatControls from "./VoiceChatControls";
import UserTranscript from "./UserTranscript";
import LoadingIndicator from "./LoadingIndicator";
import ResponseCard from "./ResponseCard";
import { useCefrLevel } from "../hooks/useCefrLevel";
import { useLocalization } from "@/context/LocalizationContext";

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
  const { t } = useLocalization();

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
      
      {isListening && !transcript && (
        <div className="text-sm text-gray-500 animate-pulse mb-4">
          {t("listeningNow")}...
        </div>
      )}

      {transcript && <UserTranscript transcript={transcript} />}
      
      {isLoading && <LoadingIndicator isListening={isListening} />}
      
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

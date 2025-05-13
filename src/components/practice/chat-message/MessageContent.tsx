
import React from "react";
import AudioButton from "./AudioButton";
import WordWithTTS from "./WordWithTTS";
import { useWordTTS } from "@/hooks/useWordTTS";

interface MessageContentProps {
  role: "user" | "assistant";
  content: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayAudio?: () => void;
  targetLanguage?: string;
  speechRate?: number;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  role, 
  content, 
  isPlaying, 
  isLoading, 
  onPlayAudio,
  targetLanguage = "english",
  speechRate = 1.0
}) => {
  const { 
    playWordAudio, 
    isPlaying: isWordPlaying, 
    isLoading: isWordLoading,
    currentWord
  } = useWordTTS({ 
    language: targetLanguage, 
    isTargetLanguage: true,
    speechRate
  });

  // Only split content into words if it's an assistant message
  const renderContent = () => {
    if (role !== "assistant") {
      return <p className="text-primary-foreground">{content}</p>;
    }
    
    // Split the content into words, preserving punctuation
    const words = content.match(/[\w']+|[.,!?;:]/g) || [];
    
    return (
      <p className="text-accent-foreground">
        {words.map((word, index) => (
          <WordWithTTS
            key={`${word}-${index}`}
            word={word}
            isPlaying={isWordPlaying}
            isLoading={isWordLoading}
            isCurrentWord={currentWord === word}
            onClick={playWordAudio}
          />
        ))}
      </p>
    );
  };

  return (
    <div className="flex justify-between items-start">
      <div className="message-content flex-1">
        {renderContent()}
      </div>
      
      {role === "assistant" && onPlayAudio && (
        <AudioButton 
          isLoading={isLoading} 
          isPlaying={isPlaying} 
          onClick={onPlayAudio}
          ariaLabel="Play target language audio"
        />
      )}
    </div>
  );
};

export default MessageContent;

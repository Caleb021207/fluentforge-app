
import React from "react";
import AudioButton from "./AudioButton";
import WordWithTTS from "./WordWithTTS";
import { useWordTTS } from "@/hooks/useWordTTS";

interface TranslationContentProps {
  role: "user" | "assistant";
  translation: string;
  isTranslationPlaying: boolean;
  isTranslationLoading: boolean;
  onPlayTranslationAudio?: () => void;
  speechRate?: number;
}

const TranslationContent: React.FC<TranslationContentProps> = ({
  role,
  translation,
  isTranslationPlaying,
  isTranslationLoading,
  onPlayTranslationAudio,
  speechRate = 1.0
}) => {
  const { 
    playWordAudio, 
    isPlaying: isWordPlaying, 
    isLoading: isWordLoading,
    currentWord
  } = useWordTTS({ 
    language: "english", // For translations, we always use native language
    isTargetLanguage: false,
    speechRate
  });

  // Split translation into words for clickable word-by-word TTS
  const renderTranslation = () => {
    if (role !== "assistant") {
      return <p className={`text-sm text-primary-foreground/90`}>{translation}</p>;
    }
    
    // Split the translation into words
    const words = translation.match(/[\w']+|[.,!?;:]/g) || [];
    
    return (
      <p className={`text-sm text-accent-foreground`}>
        {words.map((word, index) => (
          <WordWithTTS
            key={`trans-${word}-${index}`}
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
      <div className="translation-content flex-1">
        {renderTranslation()}
      </div>
      
      {role === "assistant" && translation && onPlayTranslationAudio && (
        <AudioButton 
          isLoading={isTranslationLoading} 
          isPlaying={isTranslationPlaying} 
          onClick={onPlayTranslationAudio}
          isTranslation={true}
          ariaLabel="Play native language audio"
        />
      )}
    </div>
  );
};

export default TranslationContent;

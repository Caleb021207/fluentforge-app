
import React from "react";
import { Volume2, Loader2 } from "lucide-react";

interface WordWithTTSProps {
  word: string;
  isPlaying: boolean;
  isLoading: boolean;
  isCurrentWord: boolean;
  onClick: (word: string) => void;
}

const WordWithTTS: React.FC<WordWithTTSProps> = ({
  word,
  isPlaying,
  isLoading,
  isCurrentWord,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(word);
  };
  
  const displayWord = word.trim() ? word : ' '; // Keep spaces as spaces
  
  return (
    <span 
      className={`word-tts-container inline-flex items-center ${isCurrentWord ? 'text-primary font-bold' : ''} hover:underline hover:cursor-pointer select-none mr-1`}
      onClick={handleClick}
      title="Click to hear pronunciation"
    >
      {displayWord}
      {isCurrentWord && (
        <span className="ml-0.5 inline-flex items-center">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          ) : isPlaying ? (
            <Volume2 className="h-3 w-3 text-primary" />
          ) : null}
        </span>
      )}
    </span>
  );
};

export default WordWithTTS;

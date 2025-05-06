
import React from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioButtonProps {
  isLoading: boolean;
  isPlaying: boolean;
  onClick: () => void;
  isTranslation?: boolean;
  ariaLabel: string;
}

const AudioButton: React.FC<AudioButtonProps> = ({ 
  isLoading, 
  isPlaying, 
  onClick, 
  isTranslation = false,
  ariaLabel 
}) => {
  return (
    <Button 
      onClick={onClick} 
      variant="ghost" 
      size="sm"
      disabled={isLoading || isPlaying}
      className={`
        ml-2 -mt-1 p-1 h-auto rounded-full transition-colors duration-200
        ${isTranslation ? 'hover:bg-gray-200/20 dark:hover:bg-gray-700/50' : 'hover:bg-lingua-accent/30 dark:hover:bg-lingua-blue-primary/30'}
      `}
      aria-label={ariaLabel}
    >
      {isLoading || isPlaying ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className={`h-4 w-4 ${isTranslation ? "text-gray-400 dark:text-gray-500" : "text-white dark:text-gray-200"}`} />
      )}
    </Button>
  );
};

export default AudioButton;


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
      className="ml-2 -mt-1 p-1 h-auto"
      aria-label={ariaLabel}
    >
      {isLoading || isPlaying ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className={`h-4 w-4 ${isTranslation ? "text-gray-500" : ""}`} />
      )}
    </Button>
  );
};

export default AudioButton;

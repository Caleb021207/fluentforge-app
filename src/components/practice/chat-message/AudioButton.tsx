
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
      className="ml-3 -mt-1 p-2 h-auto"
      aria-label={ariaLabel}
    >
      {isLoading || isPlaying ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Volume2 className={`h-6 w-6 ${isTranslation ? "text-gray-500" : ""}`} />
      )}
    </Button>
  );
};

export default AudioButton;

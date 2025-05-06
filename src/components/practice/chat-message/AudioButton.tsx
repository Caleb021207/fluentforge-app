
import React from "react";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onClick: () => void;
  ariaLabel?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "ghost" | "outline" | "default" | "link";
}

const AudioButton: React.FC<AudioButtonProps> = ({
  isPlaying,
  isLoading,
  onClick,
  ariaLabel = "Play audio",
  size = "icon",
  variant = "ghost"
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className="flex-shrink-0 group hover:bg-lingua-primary/20 dark:hover:bg-lingua-blue-light/20"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={isPlaying || isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 
          className={`h-4 w-4 ${isPlaying ? 'text-lingua-accent animate-pulse' : 'group-hover:text-lingua-accent'}`} 
        />
      )}
    </Button>
  );
};

export default AudioButton;

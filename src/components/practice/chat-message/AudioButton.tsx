
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

const AudioButton: React.FC<AudioButtonProps> = React.memo(({ 
  isLoading, 
  isPlaying, 
  onClick, 
  isTranslation = false,
  ariaLabel 
}) => {
  // Use a stable class string that doesn't change between renders
  const buttonClassNames = React.useMemo(() => `
    ml-2 -mt-1 p-1 h-auto rounded-full transition-colors duration-200
    ${isTranslation ? 'hover:bg-gray-200/20 dark:hover:bg-gray-700/50' : 'hover:bg-lingua-accent/30 dark:hover:bg-lingua-blue-primary/30'}
  `, [isTranslation]);

  const iconClassNames = React.useMemo(() => `h-4 w-4 ${
    isTranslation ? "text-gray-400 dark:text-gray-500" : "text-white dark:text-gray-200"
  }`, [isTranslation]);

  return (
    <Button 
      onClick={onClick} 
      variant="ghost" 
      size="sm"
      disabled={isLoading || isPlaying}
      className={buttonClassNames}
      aria-label={ariaLabel}
    >
      {isLoading || isPlaying ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className={iconClassNames} />
      )}
    </Button>
  );
});

AudioButton.displayName = "AudioButton";

export default AudioButton;

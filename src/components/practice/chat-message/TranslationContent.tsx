
import React from "react";
import AudioButton from "./AudioButton";

interface TranslationContentProps {
  role: "user" | "assistant";
  translation: string;
  isTranslationPlaying: boolean;
  isTranslationLoading: boolean;
  onPlayTranslationAudio?: () => void;
}

const TranslationContent: React.FC<TranslationContentProps> = ({
  role,
  translation,
  isTranslationPlaying,
  isTranslationLoading,
  onPlayTranslationAudio,
}) => {
  return (
    <div className="flex justify-between items-start gap-3">
      <p className={`text-base md:text-lg ${role === "user" ? "text-primary-foreground/90" : "text-accent-foreground"}`}>
        {translation}
      </p>
      
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

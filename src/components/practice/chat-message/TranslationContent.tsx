
import React from "react";
import AudioButton from "./AudioButton";

interface TranslationContentProps {
  role: "user" | "assistant";
  translation: string;
  isTranslationPlaying: boolean;
  isTranslationLoading: boolean;
  onPlayTranslationAudio?: () => void;
}

// Memoize the component to prevent unnecessary re-renders
const TranslationContent: React.FC<TranslationContentProps> = React.memo(({
  role,
  translation,
  isTranslationPlaying,
  isTranslationLoading,
  onPlayTranslationAudio,
}) => {
  return (
    <div className="flex justify-between items-start">
      <p className={`text-sm ${role === "user" ? "text-gray-200" : "text-gray-500"}`}>
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
});

TranslationContent.displayName = 'TranslationContent';

export default TranslationContent;


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
    <div className="flex justify-between items-start gap-2">
      <p className={`
        flex-1 leading-relaxed text-sm transition-colors duration-200
        ${role === "user" 
          ? "text-gray-200 font-normal" 
          : "text-gray-300 dark:text-gray-300"}
      `}>
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

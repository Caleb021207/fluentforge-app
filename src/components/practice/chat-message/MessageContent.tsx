
import React from "react";
import AudioButton from "./AudioButton";

interface MessageContentProps {
  role: "user" | "assistant";
  content: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayAudio?: () => void;
  translation?: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  role, 
  content, 
  isPlaying, 
  isLoading, 
  onPlayAudio,
  translation
}) => {
  // Using memo to prevent unnecessary re-renders
  const contentElement = React.useMemo(() => (
    <p className={`
      flex-1 leading-relaxed transition-colors duration-200
      ${role === "user" 
        ? "text-white font-medium" 
        : "text-white dark:text-gray-100"}
    `}>
      {content}
    </p>
  ), [content, role]);

  // Use memo to stabilize the audio button as well
  const audioButtonElement = React.useMemo(() => (
    role === "assistant" && onPlayAudio ? (
      <AudioButton 
        isLoading={isLoading} 
        isPlaying={isPlaying} 
        onClick={onPlayAudio}
        ariaLabel="Play target language audio"
      />
    ) : null
  ), [role, isLoading, isPlaying, onPlayAudio]);

  // If translation exists, render it
  const translationElement = React.useMemo(() => (
    translation ? (
      <div className="mt-2 border-t pt-2 text-sm text-gray-300/90">
        <span className="font-medium">Translation: </span>
        {translation}
      </div>
    ) : null
  ), [translation]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-start gap-2">
        {contentElement}
        {audioButtonElement}
      </div>
      {translationElement}
    </div>
  );
};

export default React.memo(MessageContent);

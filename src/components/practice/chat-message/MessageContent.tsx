
import React from "react";
import AudioButton from "./AudioButton";

interface MessageContentProps {
  role: "user" | "assistant";
  content: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayAudio?: () => void;
}

// Memoize the component to prevent unnecessary re-renders
const MessageContent: React.FC<MessageContentProps> = React.memo(({ 
  role, 
  content, 
  isPlaying, 
  isLoading, 
  onPlayAudio 
}) => {
  return (
    <div className="flex justify-between items-start">
      <p className={`${role === "user" ? "text-white" : "text-gray-800"}`}>{content}</p>
      
      {role === "assistant" && onPlayAudio && (
        <AudioButton 
          isLoading={isLoading} 
          isPlaying={isPlaying} 
          onClick={onPlayAudio}
          ariaLabel="Play target language audio"
        />
      )}
    </div>
  );
});

MessageContent.displayName = 'MessageContent';

export default MessageContent;

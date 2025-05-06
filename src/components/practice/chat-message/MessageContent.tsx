
import React from "react";
import AudioButton from "./AudioButton";

interface MessageContentProps {
  role: "user" | "assistant";
  content: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayAudio?: () => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  role, 
  content, 
  isPlaying, 
  isLoading, 
  onPlayAudio 
}) => {
  return (
    <div className="flex justify-between items-start">
      <p className={`
        ${role === "user" 
          ? "text-white" 
          : "text-lingua-accent dark:text-gray-100"}
      `}>
        {content}
      </p>
      
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
};

export default MessageContent;


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
    <div className="flex justify-between items-start gap-2">
      <p className={`
        flex-1 leading-relaxed transition-colors duration-200
        ${role === "user" 
          ? "text-white font-medium" 
          : "text-white dark:text-gray-100"}
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


import React from "react";
import SafetyWarning from "./SafetyWarning";
import MessageContent from "./MessageContent";
import TranslationSection from "./TranslationSection";
import useMessageAudio from "./hooks/useMessageAudio";

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  safeContent: string;
  safeTranslation: string;
  showTranslation: boolean;
  wasContentFiltered: boolean;
  targetLanguage: string;
  nativeLanguage: string;
  currentLanguage: string;
  onPlayAudio?: (text: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  role,
  safeContent,
  safeTranslation,
  showTranslation,
  wasContentFiltered,
  targetLanguage,
  nativeLanguage,
  currentLanguage,
  onPlayAudio
}) => {
  // Use our custom hook to manage audio state and playback
  const {
    contentAudio,
    handlePlayAudio
  } = useMessageAudio({
    role,
    content: safeContent,
    targetLanguage,
    onPlayAudio
  });
  
  return (
    <div
      className={`max-w-[80%] rounded-lg p-6 md:p-8 ${
        role === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-accent text-accent-foreground dark:bg-accent/80"
      }`}
    >
      <SafetyWarning wasContentFiltered={wasContentFiltered} />
      
      <MessageContent
        role={role}
        content={safeContent}
        isPlaying={contentAudio.isPlaying}
        isLoading={contentAudio.isLoading}
        onPlayAudio={role === "assistant" ? handlePlayAudio : undefined}
      />
      
      {showTranslation && (
        <TranslationSection
          showTranslation={showTranslation}
          role={role}
          translation={safeTranslation}
          currentLanguage={currentLanguage}
          isTranslationPlaying={false}
          isTranslationLoading={false}
          originalContent={safeContent}
          onPlayTranslationAudio={undefined}
        />
      )}
    </div>
  );
};

export default ChatMessageBubble;


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
    translationAudio,
    handlePlayAudio
  } = useMessageAudio({
    role,
    content: safeContent,
    translation: safeTranslation,
    targetLanguage,
    nativeLanguage,
    onPlayAudio
  });
  
  return (
    <div
      className={`max-w-[80%] rounded-lg p-4 ${
        role === "user"
          ? "bg-lingua-primary text-white dark:bg-lingua-blue-dark dark:text-white"
          : "bg-lingua-secondary/50 dark:bg-gray-700"
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
          isTranslationPlaying={translationAudio.isPlaying}
          isTranslationLoading={translationAudio.isLoading}
          originalContent={safeContent}
          onPlayTranslationAudio={role === "assistant" && safeTranslation ? translationAudio.playAudio : undefined}
        />
      )}
    </div>
  );
};

export default ChatMessageBubble;

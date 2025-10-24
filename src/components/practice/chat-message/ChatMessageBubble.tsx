
import React from "react";
import SafetyWarning from "./SafetyWarning";
import MessageContent from "./MessageContent";
import TranslationSection from "./TranslationSection";

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  safeContent: string;
  safeTranslation: string;
  showTranslation: boolean;
  wasContentFiltered: boolean;
  targetLanguage: string;
  nativeLanguage: string;
  currentLanguage: string;
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
}) => {
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
        isPlaying={false}
        isLoading={false}
        onPlayAudio={undefined}
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

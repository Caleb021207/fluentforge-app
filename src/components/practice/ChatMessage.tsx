import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";
import EmptyMessageWarning from "./chat-message/EmptyMessageWarning";
import SafetyWarning from "./chat-message/SafetyWarning";
import MessageContent from "./chat-message/MessageContent";
import TranslationSection from "./chat-message/TranslationSection";
import useTTS from "./chat-message/hooks/useTTS";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  onPlayAudio?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation, onPlayAudio }) => {
  const { currentLanguage } = useLocalization();
  
  // Languages that should always show translations
  const showTranslationLanguages = [
    "hindi", 
    "japanese", 
    "french", 
    "russian", 
    "ukrainian",
    "indonesian",
    "korean",
    "arabic",
    "vietnamese",
    "mandarin",
    "urdu",
    "pashto"
  ];
  
  // Filter content for safety if needed
  const safeContent = content ? filterContent(content) : "";
  const safeTranslation = translation ? filterContent(translation) : "";
  
  // Check for potentially unsafe content
  const isContentSafe = isSafeContent(content);
  const isTranslationSafe = translation ? isSafeContent(translation) : true;
  
  // Determine if translation should be shown
  const showTranslation = 
    showTranslationLanguages.includes(currentLanguage) || 
    (translation && translation.trim() !== "") ||
    !isContentSafe || !isTranslationSafe;
  
  const wasContentFiltered = !isContentSafe || !isTranslationSafe;
  
  // Handle case where content is undefined or empty
  if (!content && !translation) {
    return <EmptyMessageWarning />;
  }
  
  // Get language code for TTS based on who's learning what
  const targetLanguage = currentLanguage === "english" ? "spanish" : "english";
  const nativeLanguage = currentLanguage;
  
  // Setup TTS hooks for both content and translation
  const {
    isPlaying,
    isLoading,
    playAudio: playContentAudio
  } = useTTS({
    text: safeContent,
    language: targetLanguage,
    isTargetLanguage: true
  });
  
  const {
    isPlaying: isTranslationPlaying,
    isLoading: isTranslationLoading,
    playAudio: playTranslationAudio
  } = useTTS({
    text: safeTranslation,
    language: nativeLanguage,
    isTargetLanguage: false
  });
  
  const handlePlayAudio = () => {
    if (role !== "assistant") return;
    
    // If there's a parent handler, use that first
    if (onPlayAudio) {
      onPlayAudio(safeContent);
      return;
    }
    
    // Otherwise, use our direct TTS implementation
    playContentAudio();
  };
  
  return (
    <div
      className={`flex ${
        role === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          role === "user"
            ? "bg-lingua-primary text-white"
            : "bg-gray-100"
        }`}
      >
        <SafetyWarning wasContentFiltered={wasContentFiltered} />
        
        <MessageContent
          role={role}
          content={safeContent}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayAudio={role === "assistant" ? handlePlayAudio : undefined}
        />
        
        <TranslationSection
          showTranslation={showTranslation}
          role={role}
          translation={safeTranslation}
          currentLanguage={currentLanguage}
          isTranslationPlaying={isTranslationPlaying}
          isTranslationLoading={isTranslationLoading}
          onPlayAudio={role === "assistant" ? handlePlayAudio : undefined}
          onPlayTranslationAudio={role === "assistant" && safeTranslation ? playTranslationAudio : undefined}
        />
      </div>
    </div>
  );
};

export default ChatMessage;

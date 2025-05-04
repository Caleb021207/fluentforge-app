
import React from "react";
import { useLocalization } from "@/hooks/useLocalization";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";
import EmptyMessageWarning from "./chat-message/EmptyMessageWarning";
import ChatMessageBubble from "./chat-message/ChatMessageBubble";
import { TRANSLATION_REQUIRED_LANGUAGES, getTargetLanguage, getNativeLanguage } from "@/utils/languageConstants";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  onPlayAudio?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation, onPlayAudio }) => {
  const { currentLanguage } = useLocalization();
  
  // Handle case where content is undefined or empty
  if (!content && !translation) {
    return <EmptyMessageWarning />;
  }
  
  // Filter content for safety if needed
  const safeContent = content ? filterContent(content) : "";
  const safeTranslation = translation ? filterContent(translation) : "";
  
  // Check for potentially unsafe content
  const isContentSafe = isSafeContent(content);
  const isTranslationSafe = translation ? isSafeContent(translation) : true;
  
  // Determine if translation should be shown
  // Explicitly log this check for Tagalog
  console.log(`Current language is: ${currentLanguage}`);
  console.log(`Checking if translation should be shown for ${currentLanguage}`);
  console.log(`TRANSLATION_REQUIRED_LANGUAGES includes ${currentLanguage}: ${TRANSLATION_REQUIRED_LANGUAGES.includes(currentLanguage.toLowerCase())}`);
  
  const showTranslation = 
    TRANSLATION_REQUIRED_LANGUAGES.includes(currentLanguage.toLowerCase()) || 
    currentLanguage.toLowerCase() === "tagalog" ||
    (translation && translation.trim() !== "") ||
    !isContentSafe || !isTranslationSafe;
  
  console.log(`Show translation decision: ${showTranslation}`);
  
  const wasContentFiltered = !isContentSafe || !isTranslationSafe;
  
  // Get language code for TTS based on who's learning what
  const targetLanguage = getTargetLanguage(currentLanguage);
  const nativeLanguage = getNativeLanguage(currentLanguage);
  
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <ChatMessageBubble
        role={role}
        safeContent={safeContent}
        safeTranslation={safeTranslation}
        showTranslation={showTranslation}
        wasContentFiltered={wasContentFiltered}
        targetLanguage={targetLanguage}
        nativeLanguage={nativeLanguage}
        onPlayAudio={onPlayAudio}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default ChatMessage;

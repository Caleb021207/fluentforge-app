
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
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
  
  // Ensure translation is a string with better type checking
  const processedTranslation = (() => {
    if (!translation) return "";
    
    // Handle string translations (normal case)
    if (typeof translation === 'string') {
      // Check for invalid string values
      if (translation === 'undefined' || translation === '[object Object]') {
        console.warn(`Invalid string translation value for ${currentLanguage}:`, translation);
        return "";
      }
      return translation;
    }
    
    // If it's an object (seen in logs), try to extract meaningful content
    if (typeof translation === 'object') {
      console.warn('Translation was received as an object instead of string:', translation);
      
      // Try to extract from known potential object structures
      if (translation && 'value' in translation && translation.value) {
        return String(translation.value);
      } else if (translation && 'text' in translation && translation.text) {
        return String(translation.text);
      } else if (translation && 'content' in translation && translation.content) {
        return String(translation.content);
      }
      
      return "";
    }
    
    // Unknown format, convert to string or empty
    console.warn('Unexpected translation format:', translation);
    try {
      return String(translation) || "";
    } catch (e) {
      console.error('Error converting translation to string:', e);
      return "";
    }
  })();
  
  // Enhanced logging for Tagalog translations
  if (currentLanguage === 'tagalog') {
    console.log('ChatMessage Tagalog debug:', { 
      role, 
      content, 
      originalTranslation: translation,
      processedTranslation,
      translationLength: processedTranslation ? processedTranslation.length : 0,
      translationType: typeof translation,
      currentLanguage
    });
  }
  
  // Handle case where content is undefined or empty
  if (!content && !processedTranslation) {
    return <EmptyMessageWarning />;
  }
  
  // Filter content for safety if needed
  const safeContent = content ? filterContent(content) : "";
  const safeTranslation = processedTranslation ? filterContent(processedTranslation) : "";
  
  // Check for potentially unsafe content
  const isContentSafe = isSafeContent(content);
  const isTranslationSafe = processedTranslation ? isSafeContent(processedTranslation) : true;
  
  // Determine if translation should be shown
  const showTranslation = 
    TRANSLATION_REQUIRED_LANGUAGES.includes(currentLanguage) || 
    (processedTranslation && processedTranslation.trim() !== "") ||
    !isContentSafe || !isTranslationSafe;
  
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


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
  translation?: string | Record<string, unknown>;
  onPlayAudio?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation, onPlayAudio }) => {
  const { currentLanguage } = useLocalization();
  
  // Enhanced logging for Tagalog translations
  if (currentLanguage === 'tagalog') {
    console.log('ChatMessage Tagalog debug:', { 
      role, 
      content, 
      originalTranslation: translation,
      translationType: typeof translation,
      currentLanguage
    });
  }
  
  // Handle case where content is undefined or empty
  if (!content && !translation) {
    return <EmptyMessageWarning />;
  }
  
  // Filter content for safety if needed
  const safeContent = content ? filterContent(content) : "";
  
  // Always pass translation as a string, never as an object
  let safeTranslation = "";
  
  // Ensure translation is a string
  if (translation) {
    // Handle string translations (normal case)
    if (typeof translation === 'string') {
      safeTranslation = filterContent(translation);
    } 
    // Handle object translations (seen in Tagalog)
    else if (typeof translation === 'object' && translation !== null) {
      try {
        const translationObj = translation as Record<string, unknown>;
        
        // Extract string from object using common patterns
        if ('value' in translationObj && translationObj.value) {
          safeTranslation = filterContent(String(translationObj.value));
        } 
        else if ('text' in translationObj && translationObj.text) {
          safeTranslation = filterContent(String(translationObj.text));
        } 
        else if ('content' in translationObj && translationObj.content) {
          safeTranslation = filterContent(String(translationObj.content));
        }
        else {
          // Try to stringify the whole object
          const stringified = JSON.stringify(translationObj);
          if (stringified && stringified !== '{}' && stringified !== '[]') {
            safeTranslation = filterContent(stringified);
          }
        }
      } catch (e) {
        console.error('Failed to parse object translation in ChatMessage:', e);
        if (currentLanguage === 'tagalog') {
          safeTranslation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
        } else {
          safeTranslation = `Translation not available for ${currentLanguage}`;
        }
      }
    }
    // Try to convert any other type to string
    else {
      try {
        safeTranslation = filterContent(String(translation));
      } catch (e) {
        console.error('Error converting translation to string in ChatMessage:', e);
        if (currentLanguage === 'tagalog') {
          safeTranslation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
        } else {
          safeTranslation = `Translation not available for ${currentLanguage}`;
        }
      }
    }
  }
  
  if (currentLanguage === 'tagalog') {
    console.log('ChatMessage after processing:', {
      safeTranslation,
      translationLength: safeTranslation.length
    });
  }
  
  // Check for potentially unsafe content
  const isContentSafe = isSafeContent(content);
  const isTranslationSafe = safeTranslation ? isSafeContent(safeTranslation) : true;
  
  // Determine if translation should be shown
  const showTranslation = 
    TRANSLATION_REQUIRED_LANGUAGES.includes(currentLanguage) || 
    (safeTranslation && safeTranslation.trim() !== "") ||
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

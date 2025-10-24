
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";
import EmptyMessageWarning from "./chat-message/EmptyMessageWarning";
import ChatMessageBubble from "./chat-message/ChatMessageBubble";
import { TRANSLATION_REQUIRED_LANGUAGES, getTargetLanguage, getNativeLanguage } from "@/utils/languageConstants";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import type { TranslationType } from "./hooks/useTranslationHandler";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string | TranslationType;
  onPlayAudio?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation, onPlayAudio }) => {
  const { currentLanguage } = useLocalization();
  
  // Enhanced logging for specific translations
  if (['tagalog', 'thai'].includes(currentLanguage.toLowerCase())) {
    console.log(`ChatMessage ${currentLanguage} debug:`, { 
      role, 
      content, 
      originalTranslation: translation,
      translationType: typeof translation,
      currentLanguage,
      hasThaiScript: typeof translation === 'string' ? /[\u0E00-\u0E7F]/.test(translation) : false
    });
  }
  
  // Handle case where content is undefined or empty
  if (!content && !translation) {
    return <EmptyMessageWarning />;
  }
  
  // Filter content for safety if needed
  const safeContent = content ? filterContent(content) : "";
  
  // Convert translation to string format for safety filtering and display
  const processTranslation = (translation: string | TranslationType | undefined): string => {
    if (!translation) return "";
    
    try {
      // Handle string translations
      if (typeof translation === 'string') {
        // For Thai language, check if it actually contains Thai script
        if (currentLanguage.toLowerCase() === 'thai' && !/[\u0E00-\u0E7F]/.test(translation)) {
          console.log('Thai translation missing Thai script:', translation);
          return "ไม่สามารถแสดงคำแปลได้ในขณะนี้ ขออภัยในความไม่สะดวก";
        }
        
        // For Tagalog, ensure we have a valid translation
        if (currentLanguage.toLowerCase() === 'tagalog' && 
            (translation.trim() === content.trim() || translation.length < 10)) {
          console.log('Tagalog translation is same as content or too short:', translation);
          return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
        }
        
        return filterContent(translation);
      } 
      // Handle object translations
      else if (typeof translation === 'object' && translation !== null) {
        const translationObj = translation as Record<string, unknown>;
        
        // Extract string from object using common patterns
        if ('value' in translationObj && translationObj.value) {
          return filterContent(String(translationObj.value));
        } 
        else if ('text' in translationObj && translationObj.text) {
          return filterContent(String(translationObj.text));
        } 
        else if ('content' in translationObj && translationObj.content) {
          return filterContent(String(translationObj.content));
        }
        else {
          // Try to stringify the whole object
          const stringified = JSON.stringify(translationObj);
          if (stringified && stringified !== '{}' && stringified !== '[]') {
            return filterContent(stringified);
          }
        }
      }
      
      // Last resort - attempt direct string conversion
      return filterContent(String(translation));
    } catch (e) {
      console.error('Failed to process translation in ChatMessage:', e);
      
      if (currentLanguage.toLowerCase() === 'tagalog') {
        return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
      } else if (currentLanguage.toLowerCase() === 'thai') {
        return "ไม่สามารถแสดงคำแปลได้ในขณะนี้ ขออภัยในความไม่สะดวก";
      } else {
        return `Translation not available for ${currentLanguage}`;
      }
    }
  };
  
  const safeTranslation = processTranslation(translation);
  
  if (['tagalog', 'thai'].includes(currentLanguage.toLowerCase())) {
    console.log(`ChatMessage after processing ${currentLanguage}:`, {
      safeTranslation,
      translationLength: safeTranslation.length,
      hasThaiScript: /[\u0E00-\u0E7F]/.test(safeTranslation),
      isSameAsContent: safeTranslation.trim() === safeContent.trim()
    });
  }
  
  // Check for potentially unsafe content
  const isContentSafe = isSafeContent(content);
  const isTranslationSafe = safeTranslation ? isSafeContent(safeTranslation) : true;
  
  // Determine if translation should be shown
  const showTranslation = 
    TRANSLATION_REQUIRED_LANGUAGES.includes(currentLanguage.toLowerCase()) || 
    (safeTranslation && safeTranslation.trim() !== "" && safeTranslation.trim() !== safeContent.trim()) ||
    !isContentSafe || !isTranslationSafe;
  
  const wasContentFiltered = !isContentSafe || !isTranslationSafe;
  
  // Get language code for TTS based on who's learning what
  const targetLanguage = getTargetLanguage(currentLanguage);
  const nativeLanguage = getNativeLanguage(currentLanguage);
  
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-6`}>
      <ChatMessageBubble
        role={role}
        safeContent={safeContent}
        safeTranslation={safeTranslation}
        showTranslation={showTranslation}
        wasContentFiltered={wasContentFiltered}
        targetLanguage={targetLanguage}
        nativeLanguage={nativeLanguage}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default ChatMessage;

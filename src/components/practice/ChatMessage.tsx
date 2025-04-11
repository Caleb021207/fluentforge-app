
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";
import { AlertTriangle } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation }) => {
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
    "mandarin"
  ];
  
  // Filter content for safety if needed
  const safeContent = content ? filterContent(content) : "";
  const safeTranslation = translation ? filterContent(translation) : "";
  
  // Check for potentially unsafe content
  const isContentSafe = isSafeContent(content);
  const isTranslationSafe = translation ? isSafeContent(translation) : true;
  
  // Determine if translation should be shown:
  // 1. If user's language is in the list of languages that always show translations
  // 2. OR if the translation exists and is not empty
  const showTranslation = 
    showTranslationLanguages.includes(currentLanguage) || 
    (translation && translation.trim() !== "");
  
  const wasContentFiltered = !isContentSafe || !isTranslationSafe;
  
  // Handle case where content is undefined or empty
  if (!content && !translation) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-yellow-100 rounded p-4 text-yellow-700">
          <AlertTriangle size={16} className="inline mr-2" />
          <span>Empty message received</span>
        </div>
      </div>
    );
  }
  
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
        {wasContentFiltered && (
          <div className="mb-2 p-1 bg-yellow-100 rounded text-yellow-700 text-xs flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            <span>Some content was filtered for safety</span>
          </div>
        )}
        
        <p className={`${role === "user" ? "text-white" : "text-gray-800"}`}>{safeContent}</p>
        
        {showTranslation && (
          <div className="border-t border-gray-300 mt-2 pt-2">
            <p className={`text-sm ${role === "user" ? "text-gray-200" : "text-gray-500"}`}>
              {safeTranslation || `Translation not available for ${currentLanguage}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

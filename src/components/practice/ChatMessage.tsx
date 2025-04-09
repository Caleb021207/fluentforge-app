
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

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
  
  // Show translation if it exists and either:
  // 1. The user's language is in the list of languages that always show translations
  // 2. The translation is not empty
  const showTranslation = (translation && translation.trim() !== "") || 
    showTranslationLanguages.includes(currentLanguage);
  
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
        <p className={`${role === "user" ? "text-white" : "text-gray-800"}`}>{content}</p>
        {showTranslation && (
          <div className="border-t border-gray-300 mt-2 pt-2">
            <p className={`text-sm ${role === "user" ? "text-gray-200" : "text-gray-500"}`}>
              {translation || `Translation not available for ${currentLanguage}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

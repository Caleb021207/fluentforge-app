
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation }) => {
  const { currentLanguage } = useLocalization();
  
  // Always show translation for all non-English users or if translation exists
  const showTranslation = (translation && translation.trim() !== "") || 
    currentLanguage !== "english";
  
  // Get correct translation not available text based on language
  const getTranslationNotAvailableText = () => {
    switch (currentLanguage) {
      case "indonesian": return "Terjemahan tidak tersedia";
      case "turkish": return "Çeviri mevcut değil";
      case "polish": return "Tłumaczenie niedostępne";
      default: return "Translation not available";
    }
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
        <p className={`${role === "user" ? "text-white" : "text-gray-800"}`}>{content}</p>
        {showTranslation && (
          <div className="border-t border-gray-300 mt-2 pt-2">
            <p className={`text-sm ${role === "user" ? "text-gray-200" : "text-gray-500"}`}>
              {translation || getTranslationNotAvailableText()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

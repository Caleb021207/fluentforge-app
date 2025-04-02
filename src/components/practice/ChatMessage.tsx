
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation }) => {
  const { currentLanguage } = useLocalization();
  
  // Determine if translation should be shown based on language configuration
  const showTranslation = translation && translation.trim() !== "";
  
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
              {translation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

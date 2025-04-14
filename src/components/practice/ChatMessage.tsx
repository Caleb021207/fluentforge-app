import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";
import { AlertTriangle, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playTTS } from "@/utils/ttsUtils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  onPlayAudio?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation, onPlayAudio }) => {
  const { currentLanguage } = useLocalization();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Determine if translation should be shown
  const showTranslation = 
    showTranslationLanguages.includes(currentLanguage) || 
    (translation && translation.trim() !== "") ||
    !isContentSafe || !isTranslationSafe;
  
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
  
  const handlePlayAudio = async () => {
    if (role !== "assistant") return;
    
    // If there's a parent handler, use that first
    if (onPlayAudio) {
      onPlayAudio(safeContent);
      return;
    }
    
    // Otherwise, use our direct TTS implementation
    setIsLoading(true);
    setIsPlaying(true);
    
    // Get language code for TTS based on who's learning what
    let languageForTTS = currentLanguage === "english" ? "spanish" : "english";
    
    try {
      await playTTS({
        text: safeContent,
        language: languageForTTS,
        onStart: () => setIsLoading(false),
        onEnd: () => setIsPlaying(false),
        onError: (error) => {
          console.error("TTS error:", error);
          setIsPlaying(false);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      setIsLoading(false);
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
        {wasContentFiltered && (
          <div className="mb-2 p-1 bg-yellow-100 rounded text-yellow-700 text-xs flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            <span>Some content was filtered for safety</span>
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <p className={`${role === "user" ? "text-white" : "text-gray-800"}`}>{safeContent}</p>
          
          {role === "assistant" && (
            <Button 
              onClick={handlePlayAudio} 
              variant="ghost" 
              size="sm"
              disabled={isLoading || isPlaying}
              className="ml-2 -mt-1 p-1 h-auto"
            >
              {isLoading || isPlaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
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

import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { filterContent, isSafeContent } from "@/utils/safety/contentFilter";
import { AlertTriangle, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playTTS } from "@/utils/tts";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  onPlayAudio?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, translation, onPlayAudio }) => {
  const { currentLanguage } = useLocalization();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslationPlaying, setIsTranslationPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  
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
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-yellow-100 rounded p-4 text-yellow-700">
          <AlertTriangle size={16} className="inline mr-2" />
          <span>Empty message received</span>
        </div>
      </div>
    );
  }
  
  // Get language code for TTS based on who's learning what
  const targetLanguage = currentLanguage === "english" ? "spanish" : "english";
  const nativeLanguage = currentLanguage;
  
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
    
    try {
      await playTTS({
        text: safeContent,
        language: targetLanguage,
        isTargetLanguage: true, // This is the target language (using Polly)
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
  
  // New function to handle playing translation audio
  const handlePlayTranslationAudio = async () => {
    if (role !== "assistant" || !safeTranslation) return;
    
    setIsTranslationLoading(true);
    setIsTranslationPlaying(true);
    
    try {
      await playTTS({
        text: safeTranslation,
        language: nativeLanguage,
        isTargetLanguage: false, // This is the native language (using Azure)
        onStart: () => setIsTranslationLoading(false),
        onEnd: () => setIsTranslationPlaying(false),
        onError: (error) => {
          console.error("Translation TTS error:", error);
          setIsTranslationPlaying(false);
          setIsTranslationLoading(false);
        }
      });
    } catch (error) {
      console.error("Error playing translation audio:", error);
      setIsTranslationPlaying(false);
      setIsTranslationLoading(false);
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
              aria-label="Play target language audio"
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
            <div className="flex justify-between items-start">
              <p className={`text-sm ${role === "user" ? "text-gray-200" : "text-gray-500"}`}>
                {safeTranslation || `Translation not available for ${currentLanguage}`}
              </p>
              
              {role === "assistant" && safeTranslation && (
                <Button 
                  onClick={handlePlayTranslationAudio} 
                  variant="ghost" 
                  size="sm"
                  disabled={isTranslationLoading || isTranslationPlaying}
                  className="ml-2 -mt-1 p-1 h-auto"
                  aria-label="Play native language audio"
                >
                  {isTranslationLoading || isTranslationPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

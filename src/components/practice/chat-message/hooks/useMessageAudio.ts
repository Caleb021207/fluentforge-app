
import { useState } from "react";

interface UseMessageAudioProps {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  targetLanguage: string;
  nativeLanguage: string;
  onPlayAudio?: (text: string) => void;
}

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  playAudio: () => void;
}

const useMessageAudio = ({
  role,
  content,
  translation,
  targetLanguage,
  nativeLanguage,
  onPlayAudio
}: UseMessageAudioProps) => {
  const [isContentPlaying, setIsContentPlaying] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isTranslationPlaying, setIsTranslationPlaying] = useState(false);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  
  // Only assistant messages can be played
  const canPlayAudio = role === "assistant" && onPlayAudio;
  
  const handlePlayAudio = () => {
    if (!canPlayAudio) return;
    
    // Set loading state
    setIsContentLoading(true);
    setIsContentPlaying(true);
    
    // Call onPlayAudio function with the content
    console.log(`Playing audio for content: "${content}" in language ${targetLanguage}`);
    onPlayAudio(content);
    
    // Mock loading completion after 500ms 
    // In a real app, this would be handled by an event from the audio system
    setTimeout(() => {
      setIsContentLoading(false);
    }, 500);
    
    // Mock playing for 3 seconds
    // In a real app, this would be handled by audio events
    setTimeout(() => {
      setIsContentPlaying(false);
    }, 3000);
  };
  
  const handlePlayTranslationAudio = () => {
    if (!canPlayAudio || !translation) return;
    
    // Set translation audio loading state
    setIsTranslationLoading(true);
    setIsTranslationPlaying(true);
    
    // Call onPlayAudio with the translation
    console.log(`Playing audio for translation: "${translation}" in language ${nativeLanguage}`);
    onPlayAudio(translation);
    
    // Mock loading completion
    setTimeout(() => {
      setIsTranslationLoading(false);
    }, 500);
    
    // Mock playing 
    setTimeout(() => {
      setIsTranslationPlaying(false);
    }, 3000);
  };
  
  const contentAudio: AudioState = {
    isPlaying: isContentPlaying,
    isLoading: isContentLoading,
    playAudio: handlePlayAudio
  };
  
  const translationAudio: AudioState = {
    isPlaying: isTranslationPlaying,
    isLoading: isTranslationLoading,
    playAudio: handlePlayTranslationAudio
  };
  
  return {
    contentAudio,
    translationAudio,
    handlePlayAudio
  };
};

export default useMessageAudio;

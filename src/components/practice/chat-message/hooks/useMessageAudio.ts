import { useState } from "react";
import useTTS from "./useTTS";

interface UseMessageAudioProps {
  role: "user" | "assistant";
  content: string;
  targetLanguage: string;
  onPlayAudio?: (text: string) => void;
}

const useMessageAudio = ({
  role,
  content,
  targetLanguage,
  onPlayAudio
}: UseMessageAudioProps) => {
  // Setup TTS hook for target language content only
  const contentAudio = useTTS({
    text: content,
    language: targetLanguage
  });
  
  const handlePlayAudio = () => {
    if (role !== "assistant") return;
    
    // If there's a parent handler, use that first
    if (onPlayAudio) {
      onPlayAudio(content);
      return;
    }
    
    // Otherwise, use our direct TTS implementation
    contentAudio.playAudio();
  };
  
  return {
    contentAudio,
    handlePlayAudio
  };
};

export default useMessageAudio;

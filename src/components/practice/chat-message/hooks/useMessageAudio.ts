
import { useState } from "react";
import useTTS from "./useTTS";

interface UseMessageAudioProps {
  role: "user" | "assistant";
  content: string;
  translation: string;
  targetLanguage: string;
  nativeLanguage: string;
  onPlayAudio?: (text: string) => void;
  speechRate?: number;
}

const useMessageAudio = ({
  role,
  content,
  translation,
  targetLanguage,
  nativeLanguage,
  onPlayAudio,
  speechRate = 1.0
}: UseMessageAudioProps) => {
  // Setup TTS hooks for both content and translation
  const contentAudio = useTTS({
    text: content,
    language: targetLanguage,
    isTargetLanguage: true,
    speechRate
  });
  
  const translationAudio = useTTS({
    text: translation,
    language: nativeLanguage,
    isTargetLanguage: false,
    speechRate
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
    translationAudio,
    handlePlayAudio
  };
};

export default useMessageAudio;

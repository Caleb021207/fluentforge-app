
import { useEffect, useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import VoiceChat from "./VoiceChat";
import FrenchVoiceChat from "./FrenchVoiceChat";

export default function VoiceChatRouter() {
  const { currentLanguage } = useLocalization();
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the target language from localStorage
    const storedTargetLanguage = localStorage.getItem("targetLanguage");
    
    // If we're an English speaker with no target language, default to "spanish"
    if (currentLanguage === "english" && !storedTargetLanguage) {
      localStorage.setItem("targetLanguage", "spanish");
      setTargetLanguage("spanish");
    } else {
      setTargetLanguage(storedTargetLanguage);
    }
  }, [currentLanguage]);
  
  // For English speakers learning French, use the specialized French voice chat
  if (currentLanguage === "english" && targetLanguage === "french") {
    return <FrenchVoiceChat />;
  }
  
  // For all other language combinations, use the standard voice chat
  return <VoiceChat />;
}

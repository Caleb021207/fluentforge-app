
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import PremiumVoiceChat from "./PremiumVoiceChat";
import FrenchPremiumVoiceChat from "@/components/premium-voice/french/FrenchPremiumVoiceChat";

export default function PremiumVoiceRouter() {
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
    return <FrenchPremiumVoiceChat />;
  }
  
  // For all other language combinations, use the standard premium voice chat
  return <PremiumVoiceChat />;
}

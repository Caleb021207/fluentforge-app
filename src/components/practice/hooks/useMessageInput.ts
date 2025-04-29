
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

export const useMessageInput = () => {
  const [input, setInput] = useState("");
  const { t, currentLanguage } = useLocalization();

  const getPlaceholderText = () => {
    // For Urdu, we'll use a specific hardcoded translation to avoid placeholder issues
    if (currentLanguage === "urdu") {
      return t("chatPlaceholder");
    }
    
    // Get the display name for the target language based on current language
    const targetLanguage = currentLanguage === "english" ? "Spanish" : "English";
    const displayLanguage = getLanguageDisplayName(targetLanguage.toLowerCase());
    
    // Use the translation system for the placeholder with proper language name
    return t("chatPlaceholder", { language: displayLanguage });
  };

  return {
    input,
    setInput,
    getPlaceholderText
  };
};

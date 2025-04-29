
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

export const useMessageInput = () => {
  const [input, setInput] = useState("");
  const { t, currentLanguage } = useLocalization();

  const getPlaceholderText = () => {
    // For specific languages that need special handling
    if (currentLanguage === "swahili") {
      return t("chatPlaceholder", { targetLanguage: "English" });
    }
    
    // For Urdu and languages with right-to-left script
    if (currentLanguage === "urdu" || currentLanguage === "arabic") {
      return t("chatPlaceholder");
    }
    
    // For Amharic (which also uses a unique script)
    if (currentLanguage === "amharic") {
      return t("chatPlaceholder");
    }
    
    // For Bengali and Malayalam (which use unique scripts)
    if (currentLanguage === "bengali" || currentLanguage === "malayalam") {
      return t("chatPlaceholder");
    }
    
    // Get the display name for the target language based on current language
    const targetLanguage = currentLanguage === "english" ? "Spanish" : "English";
    const displayLanguage = getLanguageDisplayName(targetLanguage.toLowerCase());
    
    // Use the translation system for the placeholder with proper language name
    return t("chatPlaceholder", { targetLanguage: displayLanguage });
  };

  return {
    input,
    setInput,
    getPlaceholderText
  };
};

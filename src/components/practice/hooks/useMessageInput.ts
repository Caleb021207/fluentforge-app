
import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";

export const useMessageInput = () => {
  const [input, setInput] = useState("");
  const { t, currentLanguage } = useLocalization();

  const getPlaceholderText = () => {
    // Use the translation system for the placeholder
    return t("chatPlaceholder", { language: currentLanguage === "english" ? "Spanish" : "English" });
  };

  return {
    input,
    setInput,
    getPlaceholderText
  };
};

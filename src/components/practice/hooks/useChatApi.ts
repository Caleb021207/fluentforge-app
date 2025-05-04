import { useState, useEffect } from "react";
import { useLocalization } from "@/hooks/useLocalization";

interface ChatApiProps {
  targetLanguage: string;
}

export const useChatApi = ({ targetLanguage }: ChatApiProps) => {
  const { t } = useLocalization();
  const [placeholderText, setPlaceholderText] = useState<string>(t("enterMessage"));

  useEffect(() => {
    setPlaceholderText(t("enterMessage"));
  }, [t]);

  const getPlaceholderText = () => {
    return placeholderText;
  };

  return {
    getPlaceholderText,
  };
};


import { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { useSessionManagement } from "./useSessionManagement";
import { useMessageHandler } from "./useMessageHandler";

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
};

export const useChatMessages = () => {
  const [input, setInput] = useState("");
  const { currentLanguage, t } = useLocalization();
  const { messageCount, setMessageCount } = useSessionManagement();
  const { messages, isLoading, handleMessage } = useMessageHandler(setMessageCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleMessage(input);
    setInput("");
  };

  const sendLanguageLearningPrompt = async () => {
    if (isLoading) return;

    const { practice, native } = getLanguagePair(currentLanguage);
    const prompt = t("practicePrompt", {
      nativeLanguage: native,
      targetLanguage: practice,
    });

    await handleMessage(prompt);
  };

  const getPlaceholderText = () => {
    const { practice } = getLanguagePair(currentLanguage);
    return t("chatPlaceholder", { targetLanguage: practice });
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    getPlaceholderText
  };
};

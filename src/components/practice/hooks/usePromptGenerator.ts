import { useCallback } from "react";
import { useLocalization } from "@/hooks/useLocalization";

export const usePromptGenerator = () => {
  const { t } = useLocalization();

  const generateLanguageLearningPrompt = useCallback((targetLanguage: string) => {
    const languageName = targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1);
    const prompt = t("generateLanguageLearningPrompt", { language: languageName });
    return prompt;
  }, [t]);

  return { generateLanguageLearningPrompt };
};

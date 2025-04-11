
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageState, type ChatMessage } from "./useMessageState";
import { useMessageInput } from "./useMessageInput";
import { useChatMessaging } from "./useChatMessaging";
import { usePromptGenerator } from "./usePromptGenerator";
import { isSafeContent, filterContent } from "@/utils/contentSafetyUtils";

// Use 'export type' syntax for re-exporting types when isolatedModules is enabled
export type { ChatMessage };

export const useChatMessages = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();
  const { messages, setMessages, addUserMessage, addAssistantMessage } = useMessageState();
  const { input, setInput, getPlaceholderText } = useMessageInput();
  const { isLoading, setIsLoading, sendChatMessage } = useChatMessaging();
  const { generateLanguageLearningPrompt } = usePromptGenerator();

  const sendLanguageLearningPrompt = () => {
    const prompt = generateLanguageLearningPrompt();
    
    if (prompt) {
      addUserMessage(prompt);
      handleSendPrompt(prompt);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!isSafeContent(promptText)) {
      const filteredPrompt = filterContent(promptText);
      
      toast({
        title: t("contentFiltered"),
        description: t("contentFilteredDescription"),
        variant: "warning",
      });
      
      promptText = filteredPrompt;
    }
    
    const response = await sendChatMessage(promptText);
    
    if (response) {
      addAssistantMessage(response.content, response.translation);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addUserMessage(input);
    setInput("");
    
    await handleSendPrompt(input);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    sendLanguageLearningPrompt,
    handleSendPrompt,
    handleSubmit,
    getPlaceholderText
  };
};

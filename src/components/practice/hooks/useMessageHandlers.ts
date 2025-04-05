
import { ChatMessage } from "./useChatMessages";
import { useChatApi } from "./useChatApi";
import { useMessageState } from "./useMessageState";

/**
 * Hook for handling message submission and sending
 */
export const useMessageHandlers = () => {
  const { messages, setMessages, input, setInput } = useMessageState();
  const { 
    sendChatMessage, 
    getLanguageLearningPrompt, 
    isLoading, 
    setIsLoading 
  } = useChatApi();
  
  const sendLanguageLearningPrompt = (currentLanguage: string) => {
    const prompt = getLanguageLearningPrompt(currentLanguage);

    if (prompt) {
      const userMessage: ChatMessage = {
        role: "user",
        content: prompt,
      };

      setMessages((prev) => [...prev, userMessage]);
      handleSendPrompt(prompt, currentLanguage);
    }
  };

  const handleSendPrompt = async (promptText: string, currentLanguage: string) => {
    setIsLoading(true);

    const assistantMessage = await sendChatMessage(promptText, currentLanguage);
    
    if (assistantMessage) {
      setMessages((prev) => [...prev, assistantMessage]);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent, currentLanguage: string) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    const assistantMessage = await sendChatMessage(input, currentLanguage);
    
    if (assistantMessage) {
      setMessages((prev) => [...prev, assistantMessage]);
    }
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
    handleSubmit
  };
};

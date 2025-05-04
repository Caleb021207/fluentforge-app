
import { useState, useEffect } from "react";
import { useLocalization } from "@/hooks/useLocalization";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";

const Practice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { currentLanguage } = useLocalization();
  const [targetLanguage, setTargetLanguage] = useState<string>("spanish");
  
  useEffect(() => {
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    
    if (savedNativeLanguage && savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    } else {
      if (currentLanguage === "english") {
        setTargetLanguage("spanish");
      } else {
        setTargetLanguage("english");
      }
    }
  }, [currentLanguage]);
  
  const {
    messages,
    input,
    setInput,
    isLoading: chatLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    getPlaceholderText
  } = useChatMessages();
  
  const {
    startVoiceConversation,
    endVoiceConversation,
    isConversationActive
  } = useVoiceChat();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PracticeHeader targetLanguage={targetLanguage} />

      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={chatLoading}
        getPlaceholderText={getPlaceholderText}
      />
      
      <PracticePromptButton
        onClick={sendLanguageLearningPrompt}
        isLoading={chatLoading}
        targetLanguage={targetLanguage}
      />

      <PracticeGuide targetLanguage={targetLanguage} />
    </div>
  );
};

export default Practice;

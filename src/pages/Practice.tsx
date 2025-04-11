
import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";

const Practice = () => {
  const { currentLanguage } = useLocalization();
  const [targetLanguage, setTargetLanguage] = useState<string>("spanish");
  
  useEffect(() => {
    // Get the user's target language from localStorage
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    
    if (savedNativeLanguage && savedTargetLanguage) {
      setTargetLanguage(savedTargetLanguage);
    } else {
      // Fallback to default language pairing
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
    isLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    getPlaceholderText
  } = useChatMessages(targetLanguage);
  
  const {
    startVoiceConversation,
    endVoiceConversation,
    isConversationActive
  } = useVoiceChat(targetLanguage);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PracticeHeader targetLanguage={targetLanguage} />

      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        getPlaceholderText={getPlaceholderText}
      />
      
      <PracticePromptButton
        onClick={sendLanguageLearningPrompt}
        isLoading={isLoading}
        targetLanguage={targetLanguage}
      />

      <PracticeGuide targetLanguage={targetLanguage} />
    </div>
  );
};

export default Practice;

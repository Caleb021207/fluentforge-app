
import { useLocalization } from "@/context/LocalizationContext";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";

const Practice = () => {
  const { currentLanguage } = useLocalization();
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    getPlaceholderText
  } = useChatMessages();
  
  const {
    voiceChatTimeRemaining,
    startVoiceConversation,
    endVoiceConversation
  } = useVoiceChat();

  const targetLanguage = currentLanguage === "english" ? "Spanish" : 
                        currentLanguage === "french" ? "English" :
                        currentLanguage === "japanese" ? "English" : "English";

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PracticeHeader />

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
      />

      <PracticeGuide />
    </div>
  );
};

export default Practice;

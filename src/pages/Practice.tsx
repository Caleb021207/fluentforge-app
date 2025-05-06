
import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PracticeHeader from "@/components/practice/PracticeHeader";
import ChatContainer from "@/components/practice/ChatContainer";
import PracticePromptButton from "@/components/practice/PracticePromptButton";
import PracticeGuide from "@/components/practice/PracticeGuide";
import { useChatMessages } from "@/components/practice/hooks/useChatMessages";
import { useVoiceChat } from "@/components/practice/hooks/useVoiceChat";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { TranslationType } from "@/components/practice/hooks/useTranslationHandler";

// Create an interface that matches the Message structure from useChatMessages
interface MessageWithTranslationType {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
}

const Practice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { currentLanguage, t } = useLocalization();
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
    
    // Debug for Thai language - Fix the comparison to use lowercase comparison
    if (currentLanguage === 'thai') {
      console.log('Practice component initialized with Thai language:', {
        currentLanguage,
        targetLanguage: savedTargetLanguage || (currentLanguage === "english" ? "spanish" : "english")
      });
    }
  }, [currentLanguage]);
  
  const {
    messages,
    input,
    setInput,
    isLoading: chatLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    clearConversation,
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

  // Convert messages to ensure compatibility with ChatContainer
  const compatibleMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    // Convert complex translation objects to strings if needed
    translation: typeof msg.translation === 'string' ? 
      msg.translation : 
      msg.translation ? JSON.stringify(msg.translation) : undefined
  }));

  // Additional debug for Thai messages - fix the comparison to use lowercase comparison
  if (currentLanguage === 'thai') {
    console.log('Practice component rendering with Thai:', {
      messageCount: messages.length,
      hasTranslations: messages.filter(m => m.translation).length,
      currentLanguage
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PracticeHeader targetLanguage={targetLanguage} />
      
      <div className="flex justify-between items-center mb-4">
        <PracticePromptButton
          onClick={sendLanguageLearningPrompt}
          isLoading={chatLoading}
          targetLanguage={targetLanguage}
        />
        
        <Button 
          variant="outline" 
          onClick={clearConversation}
          className="flex items-center gap-2"
        >
          <Trash className="h-4 w-4" />
          {t("clearConversation")}
        </Button>
      </div>

      <ChatContainer
        messages={compatibleMessages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={chatLoading}
        getPlaceholderText={getPlaceholderText}
      />

      <PracticeGuide targetLanguage={targetLanguage} />
    </div>
  );
};

export default Practice;

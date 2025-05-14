
import React from "react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import ViewLanguageMetricsButton from "@/components/voice-chat/ViewLanguageMetricsButton";
import HintButton from "@/components/practice/HintButton";

interface VoiceChatControlsProps {
  conversationHistory: any[];
  apiConversationHistory: any[];
  sessionIdRef: React.MutableRefObject<string | null>;
  clearConversation: () => void;
  analyzeCurrentConversation: () => void;
  practice: string;
}

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  conversationHistory,
  apiConversationHistory,
  sessionIdRef,
  clearConversation,
  analyzeCurrentConversation,
  practice
}) => {
  const { t } = useLocalization();

  return (
    <div className="mt-4 flex items-center justify-end space-x-2">
      {conversationHistory.length > 3 && (
        <Button
          onClick={analyzeCurrentConversation}
          variant="outline"
          size="sm"
          className="mr-auto"
        >
          {t("analyzeConversation")}
        </Button>
      )}
      
      <ViewLanguageMetricsButton 
        messages={apiConversationHistory.map(msg => ({ 
          role: msg.role as any, 
          content: msg.content 
        }))} 
        sessionId={sessionIdRef.current || undefined}
      />
      
      <HintButton 
        targetLanguage={practice}
        messages={apiConversationHistory.map(msg => ({ 
          role: msg.role as any, 
          content: msg.content, 
          translation: undefined 
        }))} 
        className="mr-2"
      />
      
      {conversationHistory.length > 0 && (
        <Button
          onClick={clearConversation}
          variant="outline"
          size="sm"
        >
          {t("clearConversation")}
        </Button>
      )}
    </div>
  );
};

export default VoiceChatControls;

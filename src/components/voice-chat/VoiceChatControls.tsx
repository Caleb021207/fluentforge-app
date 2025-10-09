
import React from "react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { BarChart3, Loader2 } from "lucide-react";
import HintButton from "@/components/practice/HintButton";
import { VoiceChatControlsProps } from "@/types/voiceChat";

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  conversationHistory,
  apiConversationHistory,
  sessionIdRef,
  clearConversation,
  analyzeCurrentConversation,
  practice,
  isAnalyzing
}) => {
  const { t } = useLocalization();

  return (
    <div className="mt-4 flex items-center justify-end space-x-3">
      <HintButton 
        targetLanguage={practice}
        messages={apiConversationHistory.map(msg => ({ 
          role: msg.role as "user" | "assistant" | "system", 
          content: msg.content, 
          translation: undefined 
        }))} 
        className="px-6 py-3 text-base font-semibold"
      />
      
      {conversationHistory.length >= 4 && (
        <Button
          onClick={analyzeCurrentConversation}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
          className="px-6 py-3 text-base font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5 mr-2" />
              {t("analyzeConversation")}
            </>
          )}
        </Button>
      )}
      
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

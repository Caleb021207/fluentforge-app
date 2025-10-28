
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
  isAnalyzing,
  hasAnalyzed
}) => {
  const { t } = useLocalization();

  return (
    <div className="mt-6 flex items-center justify-end space-x-4">
      <HintButton 
        targetLanguage={practice}
        messages={apiConversationHistory.map(msg => ({ 
          role: msg.role as "user" | "assistant" | "system", 
          content: msg.content, 
          translation: undefined 
        }))} 
        className="px-8 py-4 text-lg md:text-xl font-semibold"
      />
      
      {conversationHistory.length >= 4 && (
        <Button
          onClick={analyzeCurrentConversation}
          disabled={isAnalyzing || hasAnalyzed}
          variant="outline"
          size="sm"
          className="px-8 py-4 text-lg md:text-xl font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <BarChart3 className="h-6 w-6 mr-2" />
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
          className="px-8 py-4 text-lg md:text-xl"
        >
          {t("clearConversation")}
        </Button>
      )}
    </div>
  );
};

export default VoiceChatControls;


import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { VoiceMessage } from "@/hooks/useVoiceChatMessages";

interface VoiceChatMessagesProps {
  messages: VoiceMessage[];
  onClearMessages: () => void;
}

const VoiceChatMessages: React.FC<VoiceChatMessagesProps> = ({
  messages,
  onClearMessages
}) => {
  const { t } = useLocalization();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{t("conversationHistory")}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearMessages}
          className="flex items-center text-muted-foreground"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {t("clearConversation")}
        </Button>
      </div>
      <ScrollArea className="h-[400px] rounded border bg-muted/20 p-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    message.role === "user" ? "bg-green-500" : "bg-lingua-primary"
                  }`} 
                />
                <p className="font-medium text-sm">
                  {message.role === "user" ? t("youSaid") : t("aiResponse")}
                </p>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm ml-4 pl-2 border-l-2 border-muted">
                {message.content}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VoiceChatMessages;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import type { VoiceMessage } from "@/hooks/useVoiceChatMessages";

interface FrenchChatPaneProps {
  messages: VoiceMessage[];
}

const FrenchChatPane = ({ messages }: FrenchChatPaneProps) => {
  const { t } = useLocalization();
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center p-4">
        <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500">{t("emptyConversationPrompt")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[300px] p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-lingua-primary text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FrenchChatPane;

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";
import { useTranslationHandler } from "@/components/practice/hooks/useTranslationHandler";
import { useTextToSpeech } from "@/components/practice/hooks/useTextToSpeech";
import { useLocalization } from "@/hooks/useLocalization";

interface UseMessageHandlerProps {
  targetLanguage: string;
  nativeLanguage: string;
  onAddMessage: (message: Message) => void;
}

export const useMessageHandler = ({
  targetLanguage,
  nativeLanguage,
  onAddMessage,
}: UseMessageHandlerProps) => {
  const { t } = useLocalization();
  const { translate } = useTranslationHandler();
  const { speak } = useTextToSpeech();
  const { toast } = useToast();

  const handleIncomingMessage = useCallback(
    async (message: string, role: "user" | "assistant") => {
      try {
        // Translate the message
        const translation = await translate(message, targetLanguage);

        // Add the original message
        onAddMessage({
          content: message,
          role: role,
          createdAt: new Date(),
        });

        // Add the translated message
        onAddMessage({
          content: translation,
          role: role,
          isTranslation: true,
          createdAt: new Date(),
        });

        // Speak the translated message
        speak(translation, targetLanguage);
      } catch (error: any) {
        console.error("Error processing message:", error);
        toast({
          title: t("messageError"),
          description: error.message || t("unknownError"),
          variant: "destructive",
        });
      }
    },
    [translate, speak, onAddMessage, targetLanguage, t]
  );

  return { handleIncomingMessage };
};

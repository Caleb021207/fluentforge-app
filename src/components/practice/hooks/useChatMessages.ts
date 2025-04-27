
import { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLanguagePair } from "@/utils/languageUtils";

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
};

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState({ inputs: 0, outputs: 0 });

  // Initialize chat session
  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('text_practice_interactions')
          .insert({
            user_id: user.id,
            inputs_count: 0,
            outputs_count: 0
          })
          .select()
          .single();

        if (error) throw error;
        setSessionId(data.id);
      } catch (error: any) {
        console.error('Error creating chat session:', error);
      }
    };

    initSession();

    // Cleanup session when component unmounts
    return () => {
      if (sessionId) {
        supabase
          .from('text_practice_interactions')
          .update({
            session_end: new Date().toISOString(),
            inputs_count: messageCount.inputs,
            outputs_count: messageCount.outputs
          })
          .eq('id', sessionId)
          .then(({ error }) => {
            if (error) console.error('Error closing session:', error);
          });
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Update message counts
      setMessageCount(prev => ({
        ...prev,
        inputs: prev.inputs + 1
      }));

      const userMessage = {
        role: "user" as const,
        content: input,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");

      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: input,
          userLanguage: currentLanguage,
        },
      });

      if (error) throw error;

      if (!data) {
        throw new Error("No response from tutor");
      }

      const assistantMessage = {
        role: "assistant" as const,
        content: data.content,
        translation: data.translation
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setMessageCount(prev => ({
        ...prev,
        outputs: prev.outputs + 1
      }));

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: t("error"),
        description: error.message || t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendLanguageLearningPrompt = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const { practice, native } = getLanguagePair(currentLanguage);
      const prompt = t("practicePrompt", {
        nativeLanguage: native,
        targetLanguage: practice,
      });

      const userMessage = {
        role: "user" as const,
        content: prompt,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: prompt,
          userLanguage: currentLanguage,
        },
      });

      if (error) throw error;

      if (!data) {
        throw new Error("No response from tutor");
      }

      const assistantMessage = {
        role: "assistant" as const,
        content: data.content,
        translation: data.translation
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setMessageCount(prev => ({
        ...prev,
        outputs: prev.outputs + 1,
        inputs: prev.inputs + 1
      }));

    } catch (error: any) {
      console.error("Error sending prompt:", error);
      toast({
        title: t("error"),
        description: error.message || t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    const { practice } = getLanguagePair(currentLanguage);
    return t("chatPlaceholder", { targetLanguage: practice });
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendLanguageLearningPrompt,
    handleSubmit,
    getPlaceholderText
  };
};


import React, { useState } from 'react';
import ChatContainer from "@/components/practice/ChatContainer";
import PracticeHeader from "@/components/practice/PracticeHeader";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

const FreeTierPractice = () => {
  const { t } = useLocalization();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant", content: string, translation?: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Supabase function to get AI response
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { message: input, history: messages }
      });

      if (error) throw error;

      if (data && data.response) {
        // Add AI response
        setMessages(prev => [...prev, { 
          role: "assistant" as const, 
          content: data.response,
          translation: data.translation || undefined
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        role: "assistant" as const, 
        content: t("errorOccurred")
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    return t("typeYourMessageHere");
  };

  return (
    <div className="container mx-auto p-4">
      <PracticeHeader />
      <ChatContainer 
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        getPlaceholderText={getPlaceholderText}
      />
    </div>
  );
};

export default FreeTierPractice;

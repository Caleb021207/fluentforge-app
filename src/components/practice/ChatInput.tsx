import React from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useLocalization } from "@/hooks/useLocalization";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
  placeholder,
}) => {
  const { t } = useLocalization();

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lingua-primary"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        <Send className="h-4 w-4 mr-2" />
        {t("send")}
      </Button>
    </form>
  );
};

export default ChatInput;

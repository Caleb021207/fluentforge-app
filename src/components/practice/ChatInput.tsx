
import React, { useState } from "react";
import { Send } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const { t } = useLocalization();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(e);
      setInputValue("");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="relative flex items-center">
        <textarea
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12"
          placeholder={t("typeMessage")}
          rows={1}
          disabled={disabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button 
          type="submit" 
          className="absolute right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputValue.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

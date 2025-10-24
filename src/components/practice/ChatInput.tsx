
import React, { useState, useRef, KeyboardEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import HintButton from "./HintButton";
import type { Message } from "@/types/chat";

interface ChatInputProps {
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  placeholder: string;
  messages: Message[];
  targetLanguage: string;
}

export default function ChatInput({
  isLoading,
  value,
  onChange,
  onSubmit,
  placeholder,
  messages,
  targetLanguage
}: ChatInputProps) {
  const { t } = useLocalization();
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Reset rows when value is empty
    if (!value) {
      setRows(1);
    }
  }, [value]);

  // Handle textarea height adjustment
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    onChange(textarea.value);
    
    // Adjust rows based on content
    const lineCount = textarea.value.split('\n').length;
    const newRows = Math.min(5, Math.max(1, lineCount));
    setRows(newRows);
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSubmit(e);
    }
  };
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          className="pr-16 resize-none py-4 min-h-[60px] text-lg md:text-xl"
          disabled={isLoading}
        />
        <div className="absolute right-3 bottom-2">
          <Button 
            size="lg" 
            type="submit" 
            disabled={isLoading || value.trim().length === 0}
            className="h-14 w-14 p-0"
          >
            <Send className="h-7 w-7" />
            <span className="sr-only">{t("send")}</span>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <HintButton 
          targetLanguage={targetLanguage}
          messages={messages}
        />
      </div>
    </form>
  );
}

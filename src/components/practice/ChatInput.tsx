
import React, { useState, useRef, KeyboardEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import HintButton from "./HintButton";
import type { Message } from "@/types/chat";

interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading?: boolean;
  isDisabled?: boolean; // Added for backwards compatibility
  placeholder?: string;
  messages?: Message[];
  targetLanguage?: string;
}

export default function ChatInput({
  value = "",
  onChange = () => {},
  onSubmit,
  isLoading = false,
  isDisabled = false, // Support both properties
  placeholder = "Type your message...",
  messages = [],
  targetLanguage = "spanish"
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
    if (e.key === "Enter" && !e.shiftKey && !isLoading && !isDisabled) {
      e.preventDefault();
      onSubmit(e);
    }
  };
  
  // Determine if the button should be disabled
  const buttonDisabled = isLoading || isDisabled || value.trim().length === 0;
  
  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          className="pr-24 resize-none py-3 min-h-[50px]"
          disabled={isLoading || isDisabled}
        />
        <div className="absolute right-2 bottom-1.5 flex space-x-2">
          <HintButton 
            targetLanguage={targetLanguage}
            messages={messages}
          />
          <Button 
            size="sm" 
            type="submit" 
            disabled={buttonDisabled}
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">{t("send")}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
